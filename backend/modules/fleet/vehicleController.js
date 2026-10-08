import mongoose from 'mongoose';
import Vehicle from './vehicleModel.js';
import Rider from '../rider/riderModel.js';
import Assignment from './assignmentModel.js';
import Franchise from '../franchise/franchiseModel.js';
import cloudinary from '../../config/cloudinary.js';
import { sendPushNotification } from '../../shared/utils/firebase.js';

const normalizeVehicleStatus = (status) => {
  if (status === 'unassigned') return 'available';
  return status;
};

const isAssignableVehicleStatus = (status) => {
  const normalized = normalizeVehicleStatus(status);
  return !normalized || normalized === 'available';
};

// @desc    Add new vehicle
// @route   POST /api/v1/fleet/add
export const addVehicle = async (req, res) => {
  try {
    const { rcImage, insuranceDocImage, pucDocImage, vehicleImages, ...vehicleData } = req.body;


    // Robust franchise resolution
    if (vehicleData.franchise) {
      let fId = vehicleData.franchise;
      if (typeof fId === 'string') {
        fId = fId.trim().replace(/^\(|\)$/g, '');
      }

      if (mongoose.Types.ObjectId.isValid(fId)) {
        vehicleData.franchise = fId;
      } else {
        const hub = await Franchise.findOne({
          $or: [
            { hubName: fId },
            { "businessDetails.name": fId },
            { ownerName: fId }
          ]
        });
        if (hub) {
          vehicleData.franchise = hub._id;
        } else {
          console.warn(`Could not resolve franchise for: ${fId}. Removing.`);
          delete vehicleData.franchise;
        }
      }
    }

    const uploadDoc = async (base64, folder) => {
      if (!base64 || !base64.startsWith('data:image')) return '';
      const result = await cloudinary.uploader.upload(base64, { folder: `flexigo/vehicles/${folder}` });
      return result.secure_url;
    };

    const [rcUrl, insuranceDocUrl, pucDocUrl] = await Promise.all([
      uploadDoc(rcImage, 'rc'),
      uploadDoc(insuranceDocImage, 'insurance'),
      uploadDoc(pucDocImage, 'puc'),
    ]);

    // Handle Real Vehicle Images upload (Max 3)
    let imageUrls = [];
    if (vehicleImages && Array.isArray(vehicleImages)) {
      const uploadPromises = vehicleImages.slice(0, 3).map(img => {
        if (img && img.startsWith('data:image')) {
          return cloudinary.uploader.upload(img, {
            folder: 'flexigo/vehicles/main',
          });
        }
        return null;
      });
      
      const results = await Promise.all(uploadPromises);
      imageUrls = results.filter(r => r !== null).map(r => r.secure_url);
    }

    const vehiclePayload = {
      ...vehicleData,
      ...(rcUrl && { rcUrl }),
      ...(insuranceDocUrl && { insuranceDocUrl }),
      ...(pucDocUrl && { pucDocUrl }),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    let vehicle = await Vehicle.findOne({ plate: vehicleData.plate });
    let isNew = false;

    if (vehicle) {
      // Update existing vehicle
      vehicle = await Vehicle.findByIdAndUpdate(vehicle._id, vehiclePayload, { new: true });
    } else {
      // Create new
      vehicle = await Vehicle.create(vehiclePayload);
      isNew = true;
    }

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Vehicle provisioned successfully' : 'Existing vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.plate) {
      return res.status(400).json({ 
        success: false, 
        message: `A vehicle with plate number ${error.keyValue?.plate || ''} already exists in the system.` 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Local helper for date filtering
const getDateFilter = (range, fieldName = 'createdAt') => {
  if (!range) return {};
  
  let rangeVal = range;
  try {
    if (typeof range === 'string' && range.startsWith('{')) {
      rangeVal = JSON.parse(range);
    }
  } catch (e) { }

  let start = new Date();
  start.setHours(0, 0, 0, 0);

  if (rangeVal === 'Today') {
    return { [fieldName]: { $gte: start } };
  } else if (rangeVal === 'Yesterday') {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    let endOfYesterday = new Date();
    endOfYesterday.setHours(0, 0, 0, 0);
    return { [fieldName]: { $gte: yesterday, $lt: endOfYesterday } };
  } else if (rangeVal === 'Last 7 Days') {
    start.setDate(start.getDate() - 7);
    return { [fieldName]: { $gte: start } };
  } else if (rangeVal === 'Last 30 Days') {
    start.setDate(start.getDate() - 30);
    return { [fieldName]: { $gte: start } };
  } else if (typeof rangeVal === 'object' && rangeVal.from && rangeVal.to) {
    return { [fieldName]: { $gte: new Date(rangeVal.from), $lte: new Date(rangeVal.to) } };
  }

  return {};
};

// @desc    Get all vehicles
// @route   GET /api/v1/fleet
export const getVehicles = async (req, res) => {
  try {
    const { franchiseId, range } = req.query;
    let fId = franchiseId;
    if (fId && typeof fId === 'string') {
      fId = fId.trim().replace(/^\(|\)$/g, '');
    }

    let resolvedFranchiseId = null;
    if (fId) {
      if (mongoose.Types.ObjectId.isValid(fId)) {
        resolvedFranchiseId = fId;
      } else {
        const hub = await Franchise.findOne({ 
          $or: [
            { hubName: fId }, 
            { "businessDetails.name": fId },
            { ownerName: fId }
          ] 
        });
        if (hub) resolvedFranchiseId = hub._id;
      }
    }

    const dateFilter = getDateFilter(range, 'createdAt');
    const query = resolvedFranchiseId 
      ? { ...dateFilter, franchise: resolvedFranchiseId } 
      : (fId ? { ...dateFilter, franchise: null } : { ...dateFilter });
    
    let vehicles = await Vehicle.find(query).sort('-createdAt').populate('franchise', 'hubName ownerName businessDetails').lean();

    // Attach live location and rider name from assignments
    for (let vehicle of vehicles) {
       try {
          // Look for any assignment (active preferred)
          let assignment = await Assignment.findOne({ vehicle: vehicle._id, status: 'active' }).sort('-startTime').lean();
          if (!assignment) {
             assignment = await Assignment.findOne({ vehicle: vehicle._id }).sort('-startTime').lean();
          }

          if (assignment) {
             const rider = await Rider.findById(assignment.rider).select('name phone lastLocation currentSpeed depositPaid subscriptionEnd subscriptionPlan').populate('subscriptionPlan').lean();
             if (rider) {
                vehicle.rider = rider.name || 'Assigned';
                vehicle.riderPhone = rider.phone;
                vehicle.lastLocation = rider.lastLocation;
                vehicle.currentSpeed = rider.currentSpeed;
                vehicle.depositPaid = rider.depositPaid;
                vehicle.subscriptionPlan = rider.subscriptionPlan;
                vehicle.subscriptionEnd = rider.subscriptionEnd;
             }
          } else {
             // Reconcile legacy or manual assignment state using rider.vehicleId
             const rider = await Rider.findOne({ vehicleId: vehicle._id }).select('name phone lastLocation currentSpeed depositPaid subscriptionEnd subscriptionPlan').populate('subscriptionPlan').lean();
             if (rider) {
                vehicle.rider = rider.name || 'Assigned';
                vehicle.riderPhone = rider.phone;
                vehicle.lastLocation = rider.lastLocation;
                vehicle.currentSpeed = rider.currentSpeed;
                vehicle.depositPaid = rider.depositPaid;
                vehicle.subscriptionPlan = rider.subscriptionPlan;
                vehicle.subscriptionEnd = rider.subscriptionEnd;

                if (vehicle.status === 'unassigned') {
                   vehicle.status = 'assigned';
                   await Vehicle.findByIdAndUpdate(vehicle._id, { status: 'assigned' });
                }
             }
          }

          // Fallback: If no rider location, use Franchise location (Hub location)
          if (!vehicle.lastLocation && vehicle.franchise && vehicle.franchise.businessDetails) {
             const bd = vehicle.franchise.businessDetails;
             if (bd.latitude && bd.longitude) {
                vehicle.lastLocation = {
                   lat: bd.latitude,
                   lng: bd.longitude
                };
             }
          }
       } catch (err) {
          console.error("Rider lookup error for vehicle:", vehicle.plate, err);
       }
    }

    // If a franchise is specified, include unassigned riders as virtual vehicles
    let allEntries = [...vehicles];
    if (resolvedFranchiseId) {
       const ridersWithVehicle = new Set();
       for (const v of vehicles) {
          if (v.rider) {
             const riderObj = await Rider.findOne({ phone: v.riderPhone }).select('_id').lean();
             if (riderObj) ridersWithVehicle.add(riderObj._id.toString());
          }
       }

       const franchiseRiders = await Rider.find({
          franchise: resolvedFranchiseId,
          role: 'rider',
          status: { $in: ['approved', 'active'] }
       })
       .populate('subscriptionPlan')
       .select('name phone subscriptionPlan adminAssignedStartDate depositPaid subscriptionEnd _id')
       .lean();

       const unassignedRiders = franchiseRiders.filter(r => !ridersWithVehicle.has(r._id.toString()));
       const unassignedEntries = unassignedRiders.map(rider => ({
          _id: `unassigned-${rider._id}`,
          plate: null,
          model: null,
          franchise: resolvedFranchiseId,
          status: 'unassigned',
          rider: rider.name || rider.phone,
          riderPhone: rider.phone,
          riderId: rider._id,
          subscriptionPlan: rider.subscriptionPlan,
          adminAssignedStartDate: rider.adminAssignedStartDate,
          depositPaid: rider.depositPaid,
          subscriptionEnd: rider.subscriptionEnd,
          isUnassignedRider: true
       }));
       allEntries = [...unassignedEntries, ...allEntries];
    }

    res.status(200).json({
      success: true,
      count: allEntries.length,
      vehicles: allEntries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle status
// @route   PATCH /api/v1/fleet/:id/status
export const updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Add maintenance log
// @route   POST /api/v1/fleet/:id/maintenance
export const addMaintenanceLog = async (req, res) => {
  try {
    const { date, type, staff, description } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.maintenanceLogs.unshift({
      date: date || Date.now(),
      type,
      staff,
      description,
    });

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance log added',
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign vehicle to rider
// @route   POST /api/v1/fleet/assignments
export const createAssignment = async (req, res) => {
  try {
    const { vehiclePlate, riderPhone, type, hubName } = req.body;

    const vPlate = vehiclePlate.trim();
    const rPhone = riderPhone.trim();

    // Make search flexible (ignore spaces and dashes)
    const normalizedPlate = vPlate.replace(/[\s-]/g, '');
    const vehicle = await Vehicle.findOne({ 
      $or: [
        { plate: { $regex: new RegExp(`^${vPlate}$`, 'i') } },
        { plate: { $regex: new RegExp(`^${normalizedPlate}$`, 'i') } }
      ]
    });
    const rider = await Rider.findOne({ phone: rPhone });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: `Vehicle with plate ${vPlate} not found` });
    }
    if (!rider) {
      return res.status(404).json({ success: false, message: `Rider with phone ${rPhone} not found` });
    }

    // Allow if status is 'available', 'unassigned', or empty/null
    if (!isAssignableVehicleStatus(vehicle.status)) {
      return res.status(400).json({ success: false, message: `Vehicle ${vPlate} is currently ${vehicle.status}` });
    }

    const assignment = await Assignment.create({
      vehicle: vehicle._id,
      rider: rider._id,
      type,
      hubName
    });

    // Update statuses
    if (rider.vehicleId) {
      await Vehicle.findByIdAndUpdate(rider.vehicleId, { status: 'available' });
    }

    vehicle.status = 'assigned';
    await vehicle.save();

    rider.vehicleId = vehicle._id;
    await rider.save();

    // Send Real-time FCM Notification on Assignment
    const fcmToken = rider.fcmToken || rider.fcmTokenMobile;
    if (fcmToken) {
      const title = 'Vehicle Provisioned';
      const body = `Success! Vehicle ${vehicle.plate} has been assigned to you. Launch your ride now.`;
      await sendPushNotification(fcmToken, title, body, {
        type: 'vehicle_assigned',
        icon: 'http://localhost:5173/src/assets/logo4.png'
      });
    }

    res.status(201).json({ success: true, assignment: {
      ...assignment._doc,
      vehicle: { _id: vehicle._id, plate: vehicle.plate, model: vehicle.model },
      rider: { _id: rider._id, name: rider.name, phone: rider.phone }
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/v1/fleet/assignments
export const getAssignments = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'startTime');

    const assignments = await Assignment.find(dateFilter)
      .populate('vehicle', 'plate model')
      .populate('rider', 'name phone')
      .sort('-startTime');

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk add vehicles
// @route   POST /api/v1/fleet/bulk-add
export const bulkAddVehicles = async (req, res) => {
  try {
    const { vehicles } = req.body;

    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of vehicles' });
    }

    // Process franchise IDs for all vehicles in bulk
    const processedVehicles = await Promise.all(vehicles.map(async (v) => {
      const vData = { ...v };
      if (vData.franchise) {
        let fId = vData.franchise;
        if (typeof fId === 'string') {
          fId = fId.trim().replace(/^\(|\)$/g, '');
          // Automatically fix Excel's drag-to-fill auto-increment errors (e.g., FLEXIGO_20 -> FLEXIGO)
          fId = fId.replace(/_\d+$/, '');
        }

        if (!mongoose.Types.ObjectId.isValid(fId)) {
          const hub = await Franchise.findOne({ 
            $or: [
              { hubName: { $regex: new RegExp(`^${fId}$`, 'i') } }, 
              { "businessDetails.name": { $regex: new RegExp(`^${fId}$`, 'i') } },
              { ownerName: { $regex: new RegExp(`^${fId}$`, 'i') } }
            ] 
          });
          if (hub) vData.franchise = hub._id;
          else delete vData.franchise;
        } else {
          vData.franchise = fId;
        }
      }
      return vData;
    }));

    // Use bulkWrite for upsert functionality (update if exists, insert if new)
    const bulkOps = processedVehicles.map(v => ({
      updateOne: {
        filter: { plate: v.plate },
        update: { $set: v },
        upsert: true
      }
    }));

    const result = await Vehicle.bulkWrite(bulkOps);

    res.status(201).json({
      success: true,
      count: processedVehicles.length,
      message: `${processedVehicles.length} vehicles provisioned/updated successfully`,
      vehicles: processedVehicles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle attachment
// @route   PATCH /api/v1/fleet/:id/attachment
export const updateVehicleAttachment = async (req, res) => {
  try {
    const { attachment } = req.body; // base64
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (attachment && attachment.startsWith('data:')) {
      const result = await cloudinary.uploader.upload(attachment, {
        folder: 'flexigo/vehicles/attachments',
        resource_type: 'auto' // Important for PDFs/Docs
      });
      vehicle.attachmentUrl = result.secure_url;
      await vehicle.save();
    }

    res.status(200).json({
      success: true,
      message: 'Attachment synced successfully',
      attachmentUrl: vehicle.attachmentUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/v1/fleet/:id
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Optional: Delete related assignments or rider vehicleIds here if needed.
    // Assuming simple deletion for now.

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
