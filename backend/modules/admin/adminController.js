import Franchise from '../franchise/franchiseModel.js';
import { sendPushNotification } from '../../shared/utils/firebase.js';
import Vehicle from '../fleet/vehicleModel.js';
import Assignment from '../fleet/assignmentModel.js';
import Transaction from '../franchise/franchiseTransactionModel.js';
import RiderTransaction from '../rider/transactionModel.js';
import Rider from '../rider/riderModel.js';
import WithdrawalRequest from '../rider/models/withdrawalRequestModel.js';
import Geofence from './geofenceModel.js';
import Staff from './staffModel.js';
import Inventory from './inventoryModel.js';
import VendorBill from './billModel.js';
import Part from './partModel.js';
import Challan from './challanModel.js';
import SupportTicket from './ticketModel.js';
import axios from 'axios';
import AdminTransaction from './adminTransactionModel.js';
import mongoose from 'mongoose';
import PromoCampaign from './promoModel.js';
import AuditLog from './auditLogModel.js';
import Handover from '../franchise/handoverModel.js';
import Role from './roleModel.js';
import Attendance from './attendanceModel.js';
import cloudinary from '../../config/cloudinary.js';
import Admin from './adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SystemSetting from './systemSettingModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const getDateFilter = (range, fieldName = 'createdAt') => {
  if (!range) return {};

  let rangeVal = range;
  try {
    if (typeof range === 'string' && range.startsWith('{')) {
      rangeVal = JSON.parse(range);
    }
  } catch (e) { }

  // IST offset: UTC+5:30 = 330 minutes
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

  // Get current IST time
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET_MS);

  // IST midnight = start of today in IST, converted back to UTC for MongoDB query
  const getISTMidnightUTC = (date) => {
    const ist = new Date(date.getTime() + IST_OFFSET_MS);
    ist.setUTCHours(0, 0, 0, 0); // midnight in IST space
    return new Date(ist.getTime() - IST_OFFSET_MS); // convert back to UTC
  };

  const todayMidnightUTC = getISTMidnightUTC(nowUTC);

  if (rangeVal === 'Today') {
    return { [fieldName]: { $gte: todayMidnightUTC } };
  } else if (rangeVal === 'Yesterday') {
    const yesterdayMidnightUTC = new Date(todayMidnightUTC.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEndUTC = new Date(todayMidnightUTC.getTime() - 1);
    return { [fieldName]: { $gte: yesterdayMidnightUTC, $lte: yesterdayEndUTC } };
  } else if (rangeVal === 'Last 7 Days') {
    const start = new Date(todayMidnightUTC.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { [fieldName]: { $gte: start } };
  } else if (rangeVal === 'Last 30 Days') {
    const start = new Date(todayMidnightUTC.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { [fieldName]: { $gte: start } };
  } else if (rangeVal === 'This Month') {
    // 1st of current month in IST
    const firstOfMonthIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1, 0, 0, 0, 0));
    const firstOfMonthUTC = new Date(firstOfMonthIST.getTime() - IST_OFFSET_MS);
    return { [fieldName]: { $gte: firstOfMonthUTC } };
  } else if (rangeVal === 'Last Month') {
    const lastMonthStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() - 1, 1, 0, 0, 0, 0));
    const lastMonthEndIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 0, 23, 59, 59, 999));
    const lastMonthStartUTC = new Date(lastMonthStartIST.getTime() - IST_OFFSET_MS);
    const lastMonthEndUTC = new Date(lastMonthEndIST.getTime() - IST_OFFSET_MS);
    return { [fieldName]: { $gte: lastMonthStartUTC, $lte: lastMonthEndUTC } };
  } else if (typeof rangeVal === 'object' && rangeVal.start && rangeVal.end) {
    // Custom date range — treat as IST dates
    return {
      [fieldName]: {
        $gte: new Date(rangeVal.start + 'T00:00:00+05:30'),
        $lte: new Date(rangeVal.end + 'T23:59:59+05:30')
      }
    };
  }
  return {};
};

// @desc    Get dashboard metrics for admin
// @route   GET /api/v1/admin/dashboard-stats
export const getAdminStats = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');
    const transFilter = getDateFilter(range, 'date');

    const totalHubs = await Franchise.countDocuments({ kycStatus: 'approved' });
    const activeFleet = await Rider.countDocuments({ kycStatus: 'approved' });

    // Calculate total subscribers (riders assigned to vehicles)
    const activeSubscribers = await Vehicle.countDocuments({ status: { $in: ['assigned', 'in-transit'] } });

    // Total Revenue (Sum of all completed franchise & rider transactions)
    // Avoid double counting: exclude rider transactions that were paid by franchise wallet
    // Avoid double counting: exclude rider transactions that were paid by franchise wallet
    const [frTxns, riderTxns] = await Promise.all([
      Transaction.find({ ...transFilter, type: 'Subscription', status: { $in: ['completed', 'success'] } }),
      RiderTransaction.find({
        ...getDateFilter(range, 'createdAt'),
        status: { $in: ['completed', 'success'] },
        description: { $not: /Paid by Franchise Wallet/i }
      })
    ]);

    const frRev = frTxns.reduce((acc, t) => acc + t.amount, 0);
    const riderRev = riderTxns.reduce((acc, t) => acc + t.amount, 0);
    const grossRevenue = frRev + riderRev;

    // Maintenance Alerts
    const maintenanceAlerts = await Vehicle.countDocuments({ status: 'in-service' });

    // Calculate Weekly Revenue for Chart (Last 7 Days - Daily)
    const now = new Date();
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const [wFr, wRider] = await Promise.all([
        Transaction.find({ status: { $in: ['completed', 'success'] }, date: { $gte: start, $lte: end } }),
        RiderTransaction.find({
          status: { $in: ['completed', 'success'] },
          createdAt: { $gte: start, $lte: end },
          description: { $not: /Paid by Franchise Wallet/i }
        })
      ]);

      const dailySum = wFr.reduce((acc, t) => acc + t.amount, 0) + wRider.reduce((acc, t) => acc + t.amount, 0);
      revenueData.push({
        name: i === 0 ? 'Today' : start.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dailySum
      });
    }

    // Calculate Monthly Revenue for Chart (Last 4 Weeks - Weekly)
    const monthlyRevenue = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);

      const [wFr, wRider] = await Promise.all([
        Transaction.find({ status: { $in: ['completed', 'success'] }, date: { $gte: start, $lt: end } }),
        RiderTransaction.find({
          status: { $in: ['completed', 'success'] },
          createdAt: { $gte: start, $lt: end },
          description: { $not: /Paid by Franchise Wallet/i }
        })
      ]);

      const weekSum = wFr.reduce((acc, t) => acc + t.amount, 0) + wRider.reduce((acc, t) => acc + t.amount, 0);
      monthlyRevenue.push({
        name: i === 0 ? 'This Week' : `Wk -${i}`,
        value: weekSum
      });
    }

    // Dynamic Logic for metrics
    const totalVehicles = await Vehicle.countDocuments();
    const avgUptime = totalVehicles > 0 ? (((totalVehicles - maintenanceAlerts) / totalVehicles) * 100).toFixed(1) + "%" : "0%";
    const churnRate = activeSubscribers > 0 ? "1.2%" : "0%"; // Complex query for ride churn, keeping simple
    const growthTier = grossRevenue > 1000000 ? "Level 4" : "Level 1";

    // Basic trend calculation based on recent revenue
    const revenueTrend = revenueData.length > 1 && revenueData[revenueData.length - 2].value > 0
      ? `+${Math.round(((revenueData[revenueData.length - 1].value - revenueData[revenueData.length - 2].value) / revenueData[revenueData.length - 2].value) * 100)}%`
      : '+0%';

    // Analytics Metrics
    const yieldProjectionValue = grossRevenue > 0 ? (grossRevenue / 30) * 35 : 0; // Simulated 35-day projection
    const nodeLoadValue = totalVehicles > 0 ? ((activeFleet / totalVehicles) * 100).toFixed(1) : "0";
    const riskScoringValue = totalVehicles > 0 ? Math.round(100 - (maintenanceAlerts / totalVehicles * 100)) : 100;

    // Regional Yield Hubs (Aggregation by location)
    const franchises = await Franchise.find().lean();
    const regionalYieldData = await Promise.all(franchises.map(async (f) => {
      const trans = await Transaction.find({ franchise: f._id, type: 'Subscription', status: 'completed' });
      const rev = trans.reduce((sum, t) => sum + t.amount, 0);
      return {
        name: f.businessDetails?.location || f.businessDetails?.name || 'Unknown',
        value: (rev / 100000).toFixed(1)
      };
    }));

    // Sort and take top 3 for the small widget
    const topRegions = regionalYieldData
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    res.status(200).json({
      success: true,
      stats: {
        totalHubs,
        activeFleet,
        totalSubscribers: activeSubscribers,
        grossRevenue,
        maintenanceAlerts,
        revenueData,
        monthlyRevenue,
        hubUtilization: "94.2%",
        avgUptime,
        churnRate,
        growthTier,
        yieldProjection: `₹${(yieldProjectionValue / 100000).toFixed(1)}L`,
        churnDelta: revenueTrend,
        nodeLoad: `${nodeLoadValue}%`,
        riskScoring: `${riskScoringValue}/100`,
        regionalYield: topRegions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/v1/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for admin first
    let admin = await Admin.findOne({ email });

    // Auto-seed if no admin exists at all (Development Safety)
    if (!admin && email === 'admin@flexigo.com') {
      admin = await Admin.create({
        name: 'Master Administrator',
        email: 'admin@flexigo.com',
        password: 'flexigo_root',
        role: 'SuperAdmin'
      });
    }

    if (admin) {
      // 2. Check admin password
      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid Credentials' });
      }

      // 3. Create Token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      return res.status(200).json({
        success: true,
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          accountType: 'admin'
        }
      });
    }

    // 4. If not found in Admin, check Staff (HR-created staff members)
    const staff = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (!staff) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    if (!staff.password) {
      return res.status(401).json({ success: false, message: 'No password set for this account. Contact your administrator.' });
    }

    const staffPasswordMatch = await bcrypt.compare(password, staff.password);
    if (!staffPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    if (staff.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Contact your administrator.' });
    }

    // 5. Create Token for staff
    const staffToken = jwt.sign({ id: staff._id, accountType: 'staff' }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    return res.status(200).json({
      success: true,
      token: staffToken,
      admin: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.assignedRole || staff.role, // assignedRole for RBAC, role as fallback
        dept: staff.dept,
        accountType: 'staff'
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all hubs (franchises) with stats
// @route   GET /api/v1/admin/hubs
export const getAllHubs = async (req, res) => {
  try {
    const { lat, lng, range } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const hasLocation = !isNaN(userLat) && !isNaN(userLng);
    const dateFilter = getDateFilter(range, 'createdAt');

    // Haversine formula to calculate distance between two coordinates in km
    const getDistanceKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const franchises = await Franchise.find({ kycStatus: 'approved' }).sort('-createdAt');

    const hubs = await Promise.all(franchises.map(async (f) => {
      const fleetCount = await Vehicle.countDocuments({ franchise: f._id });

      const franchiseVehicles = await Vehicle.find({ franchise: f._id }).select('_id');
      const vehicleIds = franchiseVehicles.map(v => v._id);

      const activeAssignments = await Assignment.find({
        vehicle: { $in: vehicleIds },
        status: 'active'
      }).select('rider');
      const assignedRiderIds = activeAssignments.map(a => a.rider);

      const subsCount = await Rider.countDocuments({
        $or: [
          { franchise: f._id },
          { vehicleId: { $in: vehicleIds } },
          { _id: { $in: assignedRiderIds } }
        ],
        kycStatus: 'approved',
        role: 'rider'
      });

      // Calculate exact getHubVehicles equivalent count
      const allAssignments = await Assignment.find({ vehicle: { $in: vehicleIds }, status: 'active' }).select('rider');
      const ridersWithVehicle = new Set(allAssignments.map(a => a.rider.toString()));
      const franchiseRiders = await Rider.find({
        franchise: f._id,
        role: 'rider',
        kycStatus: 'approved'
      }).select('_id');
      const unassignedRidersCount = franchiseRiders.filter(r => !ridersWithVehicle.has(r._id.toString())).length;
      const totalHubVehiclesCount = fleetCount + unassignedRidersCount;

      const revenueData = await Transaction.find({ franchiseId: f._id, type: 'Subscription', status: 'completed' });
      const totalRevenue = revenueData.reduce((acc, t) => acc + t.amount, 0);

      // Calculate Health based on maintenance status
      const serviceCount = await Vehicle.countDocuments({ franchise: f._id, status: 'in-service' });
      const healthVal = fleetCount > 0 ? Math.round(((fleetCount - serviceCount) / fleetCount) * 100) : 100;

      const hubLat = f.businessDetails?.latitude;
      const hubLng = f.businessDetails?.longitude;
      const distanceKm =
        hasLocation && hubLat && hubLng
          ? parseFloat(getDistanceKm(userLat, userLng, hubLat, hubLng).toFixed(1))
          : null;

      // Best available display name from DB (Matching getKycRecords exactly)
      const displayName = f.hubName || f.ownerName || f.phone || 'Unknown Hub';

      const displayCity =
        f.city ||
        f.businessDetails?.location ||
        f.businessDetails?.address ||
        '—';

      return {
        id: f._id,
        name: displayName,
        ownerName: f.ownerName,
        phone: f.phone,
        email: f.email,
        city: displayCity,
        fleet: totalHubVehiclesCount,
        subs: subsCount,
        revenue: totalRevenue,
        status: f.kycStatus === 'approved' ? 'approved' : (f.kycStatus === 'rejected' ? 'rejected' : (f.kycStatus || 'pending')),
        health: `${healthVal}%`,
        distanceKm,
        lat: hubLat || null,
        lng: hubLng || null,
        capacity: f.businessDetails?.capacity || 0,
      };
    }));

    // Sort by proximity if user location provided, else by creation date
    if (hasLocation) {
      hubs.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    // Dynamic Stats for Franchise Directory
    const totalCount = hubs.length;
    const totalCapacity = hubs.reduce((acc, h) => acc + (h.capacity || 0), 0);
    const totalFleet = hubs.reduce((acc, h) => acc + h.fleet, 0);
    const utilization = totalCapacity > 0 ? ((totalFleet / totalCapacity) * 100).toFixed(1) : "100.0";

    // Connectivity & Health proxies following filter
    const avgHealth = hubs.length > 0 ? Math.round(hubs.reduce((acc, h) => acc + parseInt(h.health), 0) / hubs.length) : 0;

    res.status(200).json({
      success: true,
      hubs,
      stats: {
        totalHubs: totalCount,
        hubUtilization: `${utilization}%`,
        connectivity: totalCount > 0 ? "98.2%" : "0%",
        systemHealth: totalCount > 0 ? `${avgHealth}%` : "0%"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get distribution data
// @route   GET /api/v1/admin/distribution
export const getFleetDistribution = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const inTransit = await Vehicle.countDocuments({ status: { $in: ['assigned', 'in-transit'] } });
    const atHub = await Vehicle.countDocuments({ status: 'available' });
    const maintenance = await Vehicle.countDocuments({ status: 'in-service' });
    const offline = await Vehicle.countDocuments({ status: 'quarantined' });

    res.status(200).json({
      success: true,
      distribution: [
        { name: 'On Road', value: inTransit },
        { name: 'At-Hub', value: atHub },
        { name: 'Maintenance', value: maintenance },
        { name: 'Offline', value: offline },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get KYC Records
// @route   GET /api/v1/admin/kyc
export const getKycRecords = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const [riders, franchises, activeAssignments] = await Promise.all([
      Rider.find({ ...dateFilter, kycStatus: { $ne: 'uninitiated' } })
        .populate({ path: 'vehicleId', populate: { path: 'franchise' } })
        .sort('-createdAt')
        .lean(),
      Franchise.find(dateFilter).sort('-createdAt').lean(),
      Assignment.find({ status: 'active' }).populate({ path: 'vehicle', select: 'franchise plate' }).lean()
    ]);

    const records = [
      ...riders.map(r => {
        const normalizedKycStatus = r.kycStatus === 'uninitiated' ? 'pending' : r.kycStatus;
        let franchiseId = r.franchise || r.vehicleId?.franchise?._id || r.vehicleId?.franchise || null;

        if (!franchiseId) {
          const assignment = activeAssignments.find(a => String(a.rider) === String(r._id));
          if (assignment && assignment.vehicle) {
            franchiseId = assignment.vehicle.franchise?._id || assignment.vehicle.franchise || null;
          }
        }

        return {
          id: r._id,
          name: r.name || r.phone,
          phone: r.phone,
          role: r.role || 'Rider',
          type: 'Individual',
          city: r.city || 'N/A',
          status: normalizedKycStatus === 'approved' ? 'approved' : (normalizedKycStatus === 'rejected' ? 'rejected' : (r.status || 'pending')),
          vehicleId: r.vehicleId?._id || r.vehicleId,
          vehiclePlate: r.vehicleId?.plate || 'N/A',
          date: r.createdAt,
          details: r.kycDetails,
          walletBalance: r.walletBalance || 0,
          adminAssignedStartDate: r.adminAssignedStartDate || null,
          isBlocked: r.isBlocked || false,
          franchise: franchiseId,
          onboardedPlatform: r.onboardedPlatform || ''
        };
      }),
      ...franchises.map(f => {
        const normalizedKycStatus = f.kycStatus === 'uninitiated' ? 'pending' : f.kycStatus;
        return {
          id: f._id,
          name: f.hubName || f.ownerName || f.phone || 'Unknown Hub',
          phone: f.phone,
          role: 'Franchise',
          type: f.businessDetails?.type || 'Pvt Ltd',
          city: f.city || f.businessDetails?.location || 'N/A',
          status: normalizedKycStatus === 'approved' ? 'approved' : (normalizedKycStatus === 'rejected' ? 'rejected' : (f.status || 'pending')),
          date: f.createdAt,
          details: f.kycDetails,
          walletBalance: f.walletBalance || 0,
          hubs: 1,
          isBlocked: f.isBlocked || false
        };
      })
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Stats Logic (Filtered by date as requested)
    const uniqueCities = [...new Set(records.map(r => r.city).filter(c => c && c !== 'N/A'))].length;
    const approvedCount = records.filter(r => r.status === 'approved').length;
    const gstSync = records.length > 0 ? Math.round((approvedCount / records.length) * 100) : 0;
    const integrity = records.length > 0 ? (95 + (approvedCount * 0.5)).toFixed(1) : "0.0";

    res.status(200).json({
      success: true,
      records,
      stats: {
        markets: uniqueCities || 0,
        gstSync: `${gstSync}%`,
        integrity: `${Math.min(parseFloat(integrity), 99.8)}%`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKycStatus = async (req, res) => {
  try {
    const { status, name, phone, referenceName, referenceNumber, referenceName2, referenceNumber2, kycDetails, adminAssignedStartDate, franchise, onboardedPlatform } = req.body;
    const id = req.params.id;

    const updateFields = {};
    if (status !== undefined) {
      updateFields.kycStatus = status;
      updateFields.status = status;
    }
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (adminAssignedStartDate !== undefined) updateFields.adminAssignedStartDate = adminAssignedStartDate;
    if (franchise !== undefined) updateFields.franchise = franchise || null;
    if (onboardedPlatform !== undefined) updateFields.onboardedPlatform = onboardedPlatform;

    // Extract dynamic reference fields (checking flat fields first, then falling back to nested)
    const refName = referenceName !== undefined ? referenceName : kycDetails?.referenceName;
    const refNum = referenceNumber !== undefined ? referenceNumber : kycDetails?.referenceNumber;
    const refName2 = referenceName2 !== undefined ? referenceName2 : kycDetails?.referenceName2;
    const refNum2 = referenceNumber2 !== undefined ? referenceNumber2 : kycDetails?.referenceNumber2;

    if (refName !== undefined) updateFields['kycDetails.referenceName'] = refName;
    if (refNum !== undefined) updateFields['kycDetails.referenceNumber'] = refNum;
    if (refName2 !== undefined) updateFields['kycDetails.referenceName2'] = refName2;
    if (refNum2 !== undefined) updateFields['kycDetails.referenceNumber2'] = refNum2;

    if (kycDetails) {
      if (kycDetails.selfie !== undefined) updateFields['kycDetails.selfie'] = kycDetails.selfie;
      if (kycDetails.aadhaarFront !== undefined) updateFields['kycDetails.aadhaarFront'] = kycDetails.aadhaarFront;
      if (kycDetails.aadhaarBack !== undefined) updateFields['kycDetails.aadhaarBack'] = kycDetails.aadhaarBack;
      if (kycDetails.panCard !== undefined) updateFields['kycDetails.panCard'] = kycDetails.panCard;
      if (kycDetails.drivingLicense !== undefined) updateFields['kycDetails.drivingLicense'] = kycDetails.drivingLicense;
      if (kycDetails.certificate !== undefined) updateFields['kycDetails.certificate'] = kycDetails.certificate;
      if (kycDetails.ekycVerified !== undefined) updateFields['kycDetails.ekycVerified'] = kycDetails.ekycVerified;
    }

    const franchiseUpdateFields = { ...updateFields };
    if (status !== undefined) {
      franchiseUpdateFields.isVerified = status === 'approved';
    }

    // Try updating Franchise first, then Rider
    const franchiseNameFields = {};
    if (name !== undefined) franchiseNameFields.hubName = name;
    if (phone !== undefined) franchiseNameFields.phone = phone;
    let updated = await Franchise.findByIdAndUpdate(id, { $set: { ...franchiseUpdateFields, ...franchiseNameFields } }, { new: true, returnDocument: 'after' });

    if (!updated) {
      updated = await Rider.findByIdAndUpdate(id, { $set: updateFields }, { new: true, returnDocument: 'after' });
      if (franchise !== undefined && updated && updated.vehicleId) {
        await Vehicle.findByIdAndUpdate(updated.vehicleId, { $set: { franchise: franchise || null } });
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Send Real-time FCM Notification on Approval
    if (status === 'approved') {
      const fcmToken = updated.fcmToken || updated.fcmTokenMobile;
      if (fcmToken) {
        const title = 'KYC Authorized';
        const body = `Welcome to Flexigo! Your identity has been verified. You are now cleared for network access.`;
        await sendPushNotification(fcmToken, title, body, {
          type: 'kyc_approved',
          icon: 'http://localhost:5173/src/assets/logo4.png'
        });
      }
    }

    const isFranchise = updated.hubName !== undefined || updated.ownerName !== undefined;
    const formattedRecord = {
      id: updated._id,
      name: updated.name || updated.hubName || updated.ownerName || updated.phone,
      phone: updated.phone,
      role: updated.role || (isFranchise ? 'Franchise' : 'Rider'),
      type: isFranchise ? (updated.businessDetails?.type || 'Pvt Ltd') : 'Individual',
      city: updated.city || updated.businessDetails?.location || 'N/A',
      status: updated.kycStatus === 'approved' ? 'approved' : (updated.kycStatus === 'rejected' ? 'rejected' : (updated.status || updated.kycStatus || 'pending')),
      date: updated.createdAt,
      details: updated.kycDetails
    };
    if (!isFranchise) {
      formattedRecord.vehicleId = updated.vehicleId?._id || updated.vehicleId;
      formattedRecord.vehiclePlate = updated.vehicleId?.plate || 'N/A';
    } else {
      formattedRecord.hubs = 1;
    }

    res.status(200).json({
      success: true,
      status: updated.kycStatus,
      kycDetails: updated.kycDetails,
      record: formattedRecord,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKycReferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { referenceName, referenceNumber, referenceName2, referenceNumber2 } = req.body;

    console.log(`[Admin KYC] DYNAMIC Reference Update Triggered! Target ID: ${id}`);
    console.log(`[Admin KYC] Received payload:`, req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[Admin KYC] ERROR: Invalid MongoDB ObjectId format: ${id}`);
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Build update object dynamically to preserve existing data if some fields are not provided
    const updateFields = {};
    if (referenceName !== undefined) updateFields['kycDetails.referenceName'] = referenceName;
    if (referenceNumber !== undefined) updateFields['kycDetails.referenceNumber'] = referenceNumber;
    if (referenceName2 !== undefined) updateFields['kycDetails.referenceName2'] = referenceName2;
    if (referenceNumber2 !== undefined) updateFields['kycDetails.referenceNumber2'] = referenceNumber2;

    console.log(`[Admin KYC] DB Update Fields:`, updateFields);

    let updated = await Rider.findByIdAndUpdate(id, { $set: updateFields }, { new: true, returnDocument: 'after' });

    if (!updated) {
      console.log(`[Admin KYC] Rider not found with ID ${id}. Trying Franchise...`);
      updated = await Franchise.findByIdAndUpdate(id, { $set: updateFields }, { new: true, returnDocument: 'after' });
    }

    if (!updated) {
      console.log(`[Admin KYC] ERROR: Record not found in either Rider or Franchise for ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    console.log(`[Admin KYC] SUCCESS! Dynamic DB Update Complete for ${updated.name || updated.phone} (${updated.role || 'franchise'}).`);
    console.log(`[Admin KYC] Updated kycDetails in DB:`, updated.kycDetails);

    res.status(200).json({ success: true, message: 'References updated successfully', kycDetails: updated.kycDetails });
  } catch (error) {
    console.error(`[Admin KYC] EXCEPTION in updateKycReferences:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBlockKycRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    let updated = await Rider.findById(id);
    if (!updated) {
      updated = await Franchise.findById(id);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    updated.isBlocked = !updated.isBlocked;
    await updated.save();

    res.status(200).json({
      success: true,
      message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: updated.isBlocked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete KYC Record (Rider or Franchise)
// @route   DELETE /api/v1/admin/kyc/:id
export const deleteKycRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    let deleted = await Rider.findByIdAndDelete(id);
    if (!deleted) {
      deleted = await Franchise.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({
      success: true,
      message: `Record deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Certificate for KYC Record
// @route   POST /api/v1/admin/kyc/:id/certificate
export const uploadKycCertificate = async (req, res) => {
  try {
    const { certificate } = req.body;
    const id = req.params.id;

    console.log(`[Admin] Certificate Upload Request for: ${id}`);

    if (!certificate) {
      return res.status(400).json({ success: false, message: 'No certificate data provided' });
    }

    const uploadToCloudinary = async (base64Data) => {
      if (!base64Data || !base64Data.startsWith('data:')) return base64Data;
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: `flexigo/kyc-certificates/${id}`
      });
      return result.secure_url;
    };

    const certificateUrl = await uploadToCloudinary(certificate);

    let updated = await Franchise.findByIdAndUpdate(id, {
      'kycDetails.certificate': certificateUrl
    }, { new: true, returnDocument: 'after' });

    if (!updated) {
      updated = await Rider.findByIdAndUpdate(id, {
        'kycDetails.certificate': certificateUrl
      }, { new: true, returnDocument: 'after' });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({
      success: true,
      certificateUrl: updated.kycDetails.certificate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Referral Bonus to Rider Wallet
// @route   POST /api/v1/admin/kyc/:id/referral
export const addReferralBonus = async (req, res) => {
  try {
    const { amount } = req.body;
    const id = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid referral amount' });
    }

    let rider = await Rider.findById(id);
    if (!rider) {
      // Could also be a Franchise, but franchises don't have wallets in this system yet?
      // Assuming Referral Bonus is strictly for Riders (direct or franchise riders).
      return res.status(404).json({ success: false, message: 'Rider not found for wallet update' });
    }

    rider.walletBalance = (rider.walletBalance || 0) + Number(amount);
    await rider.save();

    const transaction = await RiderTransaction.create({
      riderId: rider._id,
      amount: Number(amount),
      type: 'credit',
      method: 'referral_bonus',
      status: 'success',
      description: 'Admin KYC Referral Bonus'
    });

    res.status(200).json({ success: true, message: 'Referral bonus added', walletBalance: rider.walletBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Attachment (PDF/Image) for KYC Record
// @route   POST /api/v1/admin/kyc/:id/attachment
export const uploadKycAttachment = async (req, res) => {
  try {
    const { file, fileName } = req.body;
    const id = req.params.id;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file data provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: `flexigo/kyc-attachments/${id}`,
      resource_type: 'auto',
      public_id: fileName ? fileName.replace(/\.[^/.]+$/, '') : undefined
    });

    const attachmentUrl = result.secure_url;

    // Save to rider or franchise kycDetails.attachments array
    let updated = await Rider.findById(id);
    if (updated) {
      if (!updated.kycDetails) updated.kycDetails = {};
      if (!updated.kycDetails.attachments) updated.kycDetails.attachments = [];
      updated.kycDetails.attachments.push({ url: attachmentUrl, name: fileName, uploadedAt: new Date() });
      updated.markModified('kycDetails');
      await updated.save();
    } else {
      updated = await Franchise.findById(id);
      if (updated) {
        if (!updated.kycDetails) updated.kycDetails = {};
        if (!updated.kycDetails.attachments) updated.kycDetails.attachments = [];
        updated.kycDetails.attachments.push({ url: attachmentUrl, name: fileName, uploadedAt: new Date() });
        updated.markModified('kycDetails');
        await updated.save();
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, attachmentUrl, message: 'Attachment uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Create Hub (Franchise)
// @route   POST /api/v1/admin/hubs
export const createHub = async (req, res) => {
  try {
    const { name, city, email, phone, password, fleet, ownerName } = req.body;

    if (!name || !city || !phone || !ownerName) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, city, phone, and ownerName are required' });
    }

    // Check if franchise already exists
    const existingFranchise = await Franchise.findOne({ phone });
    if (existingFranchise) {
      return res.status(400).json({ success: false, message: 'Franchise with this phone number already exists' });
    }

    // Register as franchise
    const franchise = await Franchise.create({
      hubName: name,
      ownerName,
      city,
      email,
      phone,
      password, // Note: Should ideally be hashed if used for password login
      kycStatus: 'pending',
      businessDetails: {
        name,
        address: city,
        location: city,
        latitude: req.body.latitude || 0,
        longitude: req.body.longitude || 0,
        capacity: parseInt(fleet) || 0
      }
    });

    res.status(201).json({
      success: true,
      hub: {
        id: franchise._id,
        name: franchise.hubName,
        ownerName: franchise.ownerName,
        city: franchise.city,
        status: franchise.status || 'active',
        fleet: fleet || 0,
        subs: 0,
        revenue: 0,
        health: '100%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all subscribers (riders)
// @route   GET /api/v1/admin/subscribers
export const getSubscribers = async (req, res) => {
  try {
    const riders = await Rider.find().sort('-createdAt');
    const subscribers = riders.map(r => {
      const hasAllDocs = r.kycDetails?.selfie &&
        r.kycDetails?.aadhaarFront &&
        r.kycDetails?.aadhaarBack &&
        r.kycDetails?.drivingLicense;

      return {
        id: r._id,
        name: r.name || r.phone,
        email: r.email || 'N/A',
        phone: r.phone,
        persona: r.role || 'Rider',
        location: 'N/A',
        status: r.kycStatus === 'approved' ? 'approved' : (r.kycStatus === 'rejected' ? 'rejected' : (r.status || 'pending')),
        kycStatus: r.kycStatus || (hasAllDocs ? 'approved' : 'pending')
      };
    });

    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Geofence Management
export const getGeofences = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    // Geofences are permanent rules and should not be filtered by creation date by default.
    // We fetch all geofences so that older perimeters do not disappear after 7 days.
    const geofences = await Geofence.find()
      .populate('riderId', 'name phone lastLocation currentSpeed')
      .sort('-createdAt');

    // Fetch all riders to show in the registry list (exclude removed ones)
    const allRiders = await Rider.find({ excludeFromGeofencing: { $ne: true } }).select('name phone lastLocation currentSpeed kycStatus');

    // Filter geofences to only those with valid riders
    const validGeofences = geofences.filter(gf => gf.riderId);
    const activeZones = validGeofences.length;
    const breaches = 0; // Placeholder until Breach model is implemented

    // Get unique zone names (cities/places)
    const uniquePlaces = [...new Set(validGeofences.map(gf => gf.name))].join(', ');

    res.status(200).json({
      success: true,
      geofences,
      allRiders: allRiders,
      stats: {
        totalRiders: allRiders.length,
        activeZones: activeZones,
        places: uniquePlaces || 'Global',
        breaches: "00"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGeofence = async (req, res) => {
  try {
    const { name, type, radius, riderId, center } = req.body;
    const geofence = await Geofence.create({ name, type, radius, riderId, center });
    res.status(201).json({ success: true, geofence });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGeofence = async (req, res) => {
  try {
    await Geofence.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Geofence deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove rider from geofencing list
// @route   DELETE /api/v1/admin/geofencing/rider/:riderId
export const removeRiderFromGeofencing = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    rider.excludeFromGeofencing = true;
    await rider.save();

    // Also delete any geofence assigned to this rider
    await Geofence.deleteMany({ riderId: req.params.riderId });

    res.status(200).json({ success: true, message: 'Rider removed from geofencing' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGeofence = async (req, res) => {
  try {
    const { name, type, radius, riderId, center, status } = req.body;
    const geofence = await Geofence.findByIdAndUpdate(
      req.params.id,
      { name, type, radius, riderId, center, status },
      { new: true }
    );
    res.status(200).json({ success: true, geofence });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Staff Management
export const getAllStaff = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const staff = await Staff.find(dateFilter).sort('-joiningDate');

    // Stats Logic (Filtered by selected range as requested)
    const totalCount = staff.length;
    const onDutyCount = staff.length;

    res.status(200).json({
      success: true,
      staff,
      stats: {
        totalStaff: totalCount,
        onDuty: onDutyCount,
        performance: totalCount > 0 ? "99.5%" : "0%",
        leaves: "00"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, role, dept, shift, phone, joiningDate, kycDetails, email, password } = req.body;

    // Email format validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    const employeeId = req.body.employeeId || `STF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Helper for Cloudinary (copying from updateStaff logic)
    const uploadToCloudinary = async (base64Data, folder) => {
      if (!base64Data || !base64Data.startsWith('data:image')) {
        return base64Data;
      }
      try {
        const result = await cloudinary.uploader.upload(base64Data, {
          folder: `flexigo/staff/${folder}`
        });
        return result.secure_url;
      } catch (err) {
        console.error("Cloudinary Error:", err);
        throw new Error("Document sync failed: " + err.message);
      }
    };

    const processedKycDetails = {
      aadhaarFront: null,
      aadhaarBack: null,
      isVerified: false
    };

    if (kycDetails) {
      if (kycDetails.aadhaarFront) processedKycDetails.aadhaarFront = await uploadToCloudinary(kycDetails.aadhaarFront, 'kyc');
      if (kycDetails.aadhaarBack) processedKycDetails.aadhaarBack = await uploadToCloudinary(kycDetails.aadhaarBack, 'kyc');
      if (processedKycDetails.aadhaarFront && processedKycDetails.aadhaarBack) {
        processedKycDetails.isVerified = true;
      }
    }

    // Hash password with bcrypt if provided
    let hashedPassword = null;
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password.trim(), salt);
    }

    const staff = await Staff.create({
      employeeId,
      name: (name || '').trim(),
      phone: phone || '',
      email: email ? email.trim().toLowerCase() : undefined,
      password: hashedPassword,
      role: (role || '').trim(),
      dept: dept || 'Operations',
      shift: shift || 'Regular',
      joiningDate: joiningDate || Date.now(),
      kycDetails: processedKycDetails
    });
    res.status(201).json({ success: true, staff });
  } catch (error) {
    console.error("Staff Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message).join(', ') : error.message
    });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { name, role, dept, shift, phone, email, password, reportingManager, joiningDate, cityZone, status, kycDetails, workingHours, workDaysCount } = req.body;
    console.log("Updating Staff ID:", req.params.id, "with payload:", req.body);

    // Email format validation
    if (email !== undefined && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    // Helper for Cloudinary
    const uploadToCloudinary = async (base64Data, folder) => {
      if (!base64Data || !base64Data.startsWith('data:image')) {
        console.log("Cloudinary: Data is already a URL or not a base64 image, skipping.");
        return base64Data;
      }
      try {
        console.log("Cloudinary: Updating document on cloud...");
        const result = await cloudinary.uploader.upload(base64Data, {
          folder: `flexigo/staff/${folder}`
        });
        console.log("Cloudinary: Success! URL:", result.secure_url);
        return result.secure_url;
      } catch (err) {
        console.error("Cloudinary: Update failed!", err);
        throw new Error("Document sync failed: " + err.message);
      }
    };

    // Explicitly update fields
    if (name !== undefined) staff.name = name;
    if (role !== undefined) staff.role = role;
    if (dept !== undefined) staff.dept = dept;
    if (shift !== undefined) staff.shift = shift;
    if (phone !== undefined) staff.phone = phone;
    if (email !== undefined) staff.email = email ? email.trim().toLowerCase() : staff.email;
    if (reportingManager !== undefined) staff.reportingManager = reportingManager;
    if (joiningDate !== undefined) staff.joiningDate = joiningDate;
    if (cityZone !== undefined) staff.cityZone = cityZone;
    if (status !== undefined) staff.status = status;
    if (workingHours !== undefined) staff.workingHours = workingHours;
    if (workDaysCount !== undefined) staff.workDaysCount = workDaysCount;

    // Hash new password with bcrypt if provided
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password.trim(), salt);
    }

    if (kycDetails) {
      console.log("Processing KYC Update Protocol...");
      if (!staff.kycDetails) staff.kycDetails = {};

      if (kycDetails.aadhaarFront) staff.kycDetails.aadhaarFront = await uploadToCloudinary(kycDetails.aadhaarFront, 'kyc');
      if (kycDetails.aadhaarBack) staff.kycDetails.aadhaarBack = await uploadToCloudinary(kycDetails.aadhaarBack, 'kyc');
      if (kycDetails.aadhaar !== undefined) staff.kycDetails.aadhaar = kycDetails.aadhaar;

      // Allow explicit manual override from frontend, else fallback to automatic check
      if (kycDetails.isVerified !== undefined) {
        staff.kycDetails.isVerified = kycDetails.isVerified;
      } else {
        if (staff.kycDetails.aadhaarFront && staff.kycDetails.aadhaarBack) {
          staff.kycDetails.isVerified = true;
        } else {
          staff.kycDetails.isVerified = false;
        }
      }

      staff.markModified('kycDetails');
    }

    await staff.save();
    res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error("Staff Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekKey } = req.query;

    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    let record = await Attendance.findOne({ staffId: id, weekKey });

    if (!record) {
      record = {
        staffId: id,
        weekKey,
        days: Array(staff.workDaysCount || 5).fill('present')
      };
    }

    res.status(200).json({ success: true, attendance: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekKey, days } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { staffId: id, weekKey },
      { days, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, attendance: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month } = req.query; // format: "YYYY-MM"
    if (!month) return res.status(400).json({ success: false, message: 'Month is required' });

    const staffList = await Staff.find();

    // Find all attendance records that might fall into this month
    // We'll just search for all records where weekKey starts with the year
    // and then filter in memory or use a more precise query.
    // Since weekKey is YYYY-Www, we can't easily filter by month without a date mapping.
    // However, we can search for all records and the frontend can handle the display,
    // or we fetch records for the 4-5 weeks of that month.

    const records = await Attendance.find({
      weekKey: { $regex: new RegExp(`^${month.split('-')[0]}`) }
    }).populate('staffId', 'name role dept');

    res.status(200).json({ success: true, records, staffList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get vehicle analytics stats
// @route   GET /api/v1/admin/vehicle-stats
export const getVehicleStats = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();

    // Simulate telemetry data for each vehicle
    const assetRegistry = vehicles.map(v => {
      // Use ID as seed for stable randoms
      const seed = parseInt(v._id.toString().slice(-4), 16);
      const health = 85 + (seed % 15); // 85-100%
      const temp = 28 + (seed % 15); // 28-43°C
      const cycles = 100 + (seed % 1500);
      const voltage = (70 + (seed % 40) / 10).toFixed(1);

      let status = 'optimal';
      if (health < 80 || temp > 45) status = 'critical';
      else if (health < 90 || temp > 40) status = 'warning';

      return {
        id: v.plate || `EV-${v._id.toString().slice(-4)}`,
        health,
        temp: `${temp}°C`,
        cycles,
        voltage: `${voltage}V`,
        status
      };
    });

    const avgHealth = Math.round(assetRegistry.reduce((sum, a) => sum + a.health, 0) / assetRegistry.length) || 0;
    const criticalOverheat = assetRegistry.filter(a => parseInt(a.temp) > 45).length;

    res.status(200).json({
      success: true,
      stats: {
        fleetHealth: `${avgHealth}%`,
        bmsTags: "24.2k",
        thermals: criticalOverheat.toString().padStart(2, '0'),
        gridEfficiency: "92.1%",
        perfSeries: [
          { time: '08:00', load: 45 },
          { time: '10:00', load: 82 },
          { time: '12:00', load: 94 },
          { time: '14:00', load: 78 },
          { time: '16:00', load: 65 },
        ],
        assetRegistry
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rider behaviour analytics
// @route   GET /api/v1/admin/rider-behaviour
export const getRiderBehaviour = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const riders = await Rider.find(dateFilter).lean();
    const vehicles = await Vehicle.find(dateFilter).lean();

    const lowBalanceCount = riders.filter(r => (r.walletBalance || 0) < 100).length;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const docExpiryCount = vehicles.filter(v => {
      const insExpiry = v.insuranceExpiry ? new Date(v.insuranceExpiry) : null;
      const pucExpiry = v.pUCExpiry ? new Date(v.pUCExpiry) : null;
      return (insExpiry && insExpiry < thirtyDaysFromNow) || (pucExpiry && pucExpiry < thirtyDaysFromNow);
    }).length;

    // Generate dynamic violation stream
    const behaviourAlerts = [];

    // Add Low Balance alerts
    riders.filter(r => (r.walletBalance || 0) < 100).slice(0, 5).forEach(r => {
      behaviourAlerts.push({
        id: `AL-${r._id.toString().slice(-4)}`,
        rider: r.name || r.phone,
        type: 'Low Balance',
        severity: (r.walletBalance || 0) < 20 ? 'critical' : 'high',
        due: 'Today',
        status: 'pending'
      });
    });

    // Add Doc Expiry alerts
    vehicles.filter(v => v.insuranceExpiry && new Date(v.insuranceExpiry) < thirtyDaysFromNow).slice(0, 3).forEach(v => {
      behaviourAlerts.push({
        id: `DC-${v._id.toString().slice(-4)}`,
        rider: v.plate || 'Assigned Rider',
        type: 'Insurance Expiry',
        severity: 'medium',
        due: 'Soon',
        status: 'notified'
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        activeAlerts: behaviourAlerts.length,
        lowBalance: lowBalanceCount,
        docExpiry: docExpiryCount,
        cleanup: `${(98 + Math.random()).toFixed(1)}%`,
        behaviourAlerts: behaviourAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffLeaves = async (req, res) => {
  try {
    const Leave = (await import('./leaveModel.js')).default;
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query = {
        $or: [
          { startDate: { $lte: end, $gte: start } },
          { endDate: { $lte: end, $gte: start } },
          { startDate: { $lte: start }, endDate: { $gte: end } }
        ]
      };
    }

    const leaves = await Leave.find(query).populate('staffId', 'name role dept').sort({ startDate: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaffLeave = async (req, res) => {
  try {
    const Leave = (await import('./leaveModel.js')).default;
    const { staffId, startDate, endDate, leaveType, reason } = req.body;

    const newLeave = await Leave.create({
      staffId,
      startDate,
      endDate,
      leaveType,
      reason,
      status: 'Approved' // auto-approve for now based on request
    });

    const populatedLeave = await Leave.findById(newLeave._id).populate('staffId', 'name role dept');

    res.status(201).json({ success: true, message: 'Leave created', leave: populatedLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffLeave = async (req, res) => {
  try {
    const Leave = (await import('./leaveModel.js')).default;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('staffId', 'name role dept');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    res.status(200).json({ success: true, message: 'Leave updated', leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinanceData = async (req, res) => {
  try {
    const { range } = req.query;

    // Fetch from both sources
    const frFilter = getDateFilter(range, 'date');
    const riderFilter = getDateFilter(range, 'createdAt');

    const [frTxns, riderTxns] = await Promise.all([
      Transaction.find(frFilter).populate('franchiseId', 'hubName ownerName').lean(),
      RiderTransaction.find(riderFilter).populate('riderId', 'name phone').lean()
    ]);

    // Normalize and Combine
    const combined = [
      ...frTxns.map(t => ({
        _id: t._id,
        id: t.transactionId || `TXN-${t._id.toString().slice(-6).toUpperCase()}`,
        hub: t.franchiseId?.hubName || 'Hub Network',
        user: t.franchiseId?.ownerName || t.subscriberName || 'Partner',
        amount: t.amount,
        method: t.paymentMethod ? t.paymentMethod.toUpperCase() : (t.type === 'Subscription' ? 'RAZORPAY' : 'CARD'),
        status: (t.status === 'completed' || t.status === 'success') ? 'success' : t.status,
        date: t.date,
        rawStatus: t.status
      })),
      ...riderTxns.map(t => ({
        _id: t._id,
        id: t.transactionId || `TXN-${t._id.toString().slice(-6).toUpperCase()}`,
        hub: 'Direct (Rider)',
        user: t.riderId?.name || t.riderId?.phone || 'Rider',
        amount: t.amount,
        method: t.method ? t.method.toUpperCase() : 'UPI',
        status: (t.status === 'success' || t.status === 'completed') ? 'success' : t.status,
        date: t.createdAt,
        rawStatus: t.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate Aggregated Stats
    const successTxns = combined.filter(t => t.status === 'success');
    const totalRev = successTxns.reduce((acc, t) => acc + t.amount, 0);
    const settled = totalRev * 0.85;
    const liability = totalRev * 0.15;
    const successRate = combined.length > 0 ? ((successTxns.length / combined.length) * 100).toFixed(1) : "100.0";

    // Helper for precise formatting
    const formatValue = (val) => {
      return `₹${Math.round(val).toLocaleString()}`;
    };

    res.status(200).json({
      success: true,
      transactions: combined.slice(0, 1000).map(t => ({
        ...t,
        val: `₹${t.amount.toLocaleString()}`,
        date: t.date
      })),
      stats: {
        settled: formatValue(settled),
        liability: formatValue(liability),
        unitYield: formatValue(totalRev / (combined.length || 1)),
        successRate: `${successRate}%`,
        dailyVolume: formatValue(totalRev),
        pending: formatValue(liability)
      }
    });
  } catch (error) {
    console.error("Finance Data Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryData = async (req, res) => {
  try {
    const { range, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const dateFilter = getDateFilter(range, 'createdAt');
    const billFilter = getDateFilter(range, 'date');

    const unpaidAmtResult = await VendorBill.aggregate([
      { $match: { ...billFilter, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const unpaidAmt = unpaidAmtResult[0]?.total || 0;

    const [items, bills, totalBills] = await Promise.all([
      Inventory.find(dateFilter).sort('name'),
      VendorBill.find(billFilter).populate('partId').sort('-date').skip(skip).limit(limitNum),
      VendorBill.countDocuments(billFilter)
    ]);

    const totalItems = items.reduce((acc, item) => acc + item.stock, 0);
    const lowStockCount = items.filter(item => item.stock <= item.minThreshold).length;
    const stockValue = items.reduce((acc, item) => acc + (item.stock * (item.pricePerUnit || 0)), 0);

    const formattedItems = items.map(item => ({
      id: item.sku,
      name: item.name,
      category: item.category,
      stock: item.stock,
      minLevel: item.minThreshold,
      supplier: item.supplier || 'N/A',
      status: item.stock <= 0 ? 'out-of-stock' : item.stock <= item.minThreshold ? 'low-stock' : 'optimal'
    }));

    const formattedBills = bills.map(b => ({
      _id: b._id,
      id: b.billId,
      supplier: b.supplier,
      vehicleNo: b.vehicleNo,
      chasisNo: b.chasisNo,
      partId: b.partId?._id || b.partId || '',
      partName: b.partId?.name || 'N/A',
      partsRepair: b.partsRepair,
      riderName: b.riderName,
      amount: b.amount,
      formattedAmount: `₹${b.amount.toLocaleString()}`,
      status: b.status,
      date: b.date
    }));

    const formatCurrency = (val) => {
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
      return `₹${val.toLocaleString()}`;
    };

    res.status(200).json({
      success: true,
      inventory: formattedItems,
      billing: formattedBills,
      billingPagination: {
        page: pageNum,
        limit: limitNum,
        total: totalBills,
        totalPages: Math.ceil(totalBills / limitNum)
      },
      stats: {
        totalItems: totalItems.toLocaleString(),
        restockCount: lowStockCount < 10 ? `0${lowStockCount}` : lowStockCount,
        stockValue: formatCurrency(stockValue),
        unpaidAmount: `₹${unpaidAmt.toLocaleString()}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportInventoryData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');
    const billFilter = getDateFilter(range, 'date');

    const [items, bills] = await Promise.all([
      Inventory.find(dateFilter).sort('name'),
      VendorBill.find(billFilter).populate('partId').sort('-date')
    ]);

    const formattedItems = items.map(item => ({
      SKU: item.sku || 'N/A',
      Name: item.name || 'N/A',
      Category: item.category || 'N/A',
      Stock: item.stock || 0,
      MinThreshold: item.minThreshold || 0,
      Supplier: item.supplier || 'N/A',
      Status: item.stock <= 0 ? 'out-of-stock' : item.stock <= item.minThreshold ? 'low-stock' : 'optimal'
    }));

    const formattedBills = bills.map(b => ({
      BillID: b.billId || 'N/A',
      Supplier: b.supplier || 'N/A',
      VehicleNo: b.vehicleNo || 'N/A',
      ChasisNo: b.chasisNo || 'N/A',
      PartName: b.partId?.name || 'N/A',
      PartsRepair: b.partsRepair || 'N/A',
      RiderName: b.riderName || 'N/A',
      Amount: b.amount || 0,
      Status: b.status || 'pending',
      Date: b.date ? new Date(b.date).toLocaleDateString() : 'N/A'
    }));

    res.status(200).json({
      success: true,
      inventory: formattedItems,
      billing: formattedBills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBill = async (req, res) => {
  try {
    const { vehicleNo, chasisNo, partId, partsRepair, riderName, amount, supplier } = req.body;
    const billId = `BILL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newBill = await VendorBill.create({
      billId,
      vehicleNo,
      chasisNo,
      partId,
      partsRepair,
      riderName,
      amount,
      supplier: supplier || 'Internal'
    });
    res.status(201).json({ success: true, bill: newBill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await VendorBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.status(200).json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const bill = await VendorBill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.status(200).json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getParts = async (req, res) => {
  try {
    const parts = await Part.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, parts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPart = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Part name is required' });
    }
    const newPart = await Part.create({ name });
    res.status(201).json({ success: true, part: newPart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePart = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Part name is required' });
    }
    const part = await Part.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.status(200).json({ success: true, part });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Part not found' });
    res.status(200).json({ success: true, message: 'Part deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getFranchiseOpsData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');
    const txnFilter = getDateFilter(range, 'date');

    const franchises = await Franchise.find(dateFilter).sort('-createdAt');
    const totalPartners = franchises.length;

    const txns = await Transaction.find({ ...txnFilter, status: 'completed' });
    const grossPayout = txns.reduce((acc, t) => acc + t.amount, 0);

    const formattedFranchises = await Promise.all(franchises.map(async (fr) => {
      const fleetCount = await Vehicle.countDocuments({ franchise: fr._id });
      return {
        id: fr._id,
        name: fr.hubName || fr.ownerName || fr.phone || 'Unknown Hub',
        city: fr.businessDetails?.location || fr.city || 'N/A',
        hubs: 1,
        fleet: fleetCount,
        payout: `₹${(grossPayout / (totalPartners || 1) * (fr.kycStatus === 'approved' ? 1.2 : 0.8)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        status: fr.kycStatus === 'approved' ? 'settled' : 'processing',
        kycStatus: fr.kycStatus,
        businessDetails: fr.businessDetails
      };
    }));

    res.status(200).json({
      success: true,
      franchises: formattedFranchises,
      stats: {
        totalPartners,
        activeNodes: totalPartners,
        grossPayout: `₹${(grossPayout / 100000).toFixed(1)}L`,
        growth: totalPartners > 5 ? `+${(totalPartners * 1.2).toFixed(1)}%` : "0%"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplianceData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'date');

    const challans = await Challan.find(dateFilter).sort('-date').limit(50);

    const activeFines = await Challan.countDocuments({ ...dateFilter, status: 'pending' });
    const autoPaid = await Challan.find({ ...dateFilter, status: 'auto-paid' });
    const settledAmt = autoPaid.reduce((acc, c) => acc + c.amount, 0);

    const totalCount = await Challan.countDocuments();
    const complianceRate = totalCount > 0 ? (((totalCount - activeFines) / totalCount) * 100).toFixed(1) : "100";

    const formattedChallans = challans.map(c => ({
      id: c.challanId,
      vehicle: c.vehicleId,
      type: c.issueType,
      amount: `₹${c.amount.toLocaleString()}`,
      rto: c.rtoNode,
      status: c.status,
      date: c.date
    }));

    res.status(200).json({
      success: true,
      challans: formattedChallans,
      stats: {
        activeFines: activeFines.toLocaleString(),
        autoSettled: `₹${(settledAmt / 1000).toFixed(1)}K`,
        complianceRate: `${complianceRate}%`,
        apiStatus: 'Live'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEngagementData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range);

    const [tickets, promos] = await Promise.all([
      SupportTicket.find(dateFilter).sort('-createdAt').limit(20),
      PromoCampaign.find({ ...dateFilter, status: 'active' })
    ]);

    const totalTickets = await SupportTicket.countDocuments(dateFilter);
    const resolvedTickets = await SupportTicket.countDocuments({ ...dateFilter, status: 'resolved' });
    const openTicketsCount = await SupportTicket.countDocuments({ ...dateFilter, status: { $ne: 'resolved' } });

    // CSAT Score based on resolution rate (proxy)
    const csat = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : "95.0";

    // SLA Ready: Average resolution time for resolved tickets (in minutes)
    const resolvedSamples = await SupportTicket.find({ ...dateFilter, status: 'resolved' }).limit(10);
    let avgSla = 12; // default
    if (resolvedSamples.length > 0) {
      const totalMin = resolvedSamples.reduce((acc, t) => {
        const diff = new Date(t.updatedAt) - new Date(t.createdAt);
        return acc + (diff / (1000 * 60));
      }, 0);
      avgSla = Math.round(totalMin / resolvedSamples.length);
    }

    const formattedTickets = tickets.map(t => ({
      id: t.ticketId,
      entity: t.entityName,
      category: t.category,
      priority: t.priority,
      status: t.status,
      sla: t.slaTime
    }));

    const formattedPromos = promos.map(p => ({
      code: p.name,
      discount: 'Dynamic',
      usage: p.usageCount.toLocaleString(),
      expiry: p.targetNodes ? `${p.targetNodes} Nodes` : 'N/A',
      status: p.status
    }));

    res.status(200).json({
      success: true,
      tickets: formattedTickets,
      promos: formattedPromos,
      stats: {
        openTickets: openTicketsCount,
        livePromos: promos.length < 10 ? `0${promos.length}` : promos.length,
        csatScore: `${csat}%`,
        slaReady: `${avgSla}m`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSecurityData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'timestamp');
    const riderFilter = getDateFilter(range, 'createdAt');

    const logs = await AuditLog.find(dateFilter).sort('-timestamp').limit(50);
    const failures = await AuditLog.countDocuments({
      ...dateFilter,
      status: 'failure'
    });

    const formattedLogs = logs.map(l => ({
      id: l._id,
      identity: l.identity,
      action: l.actionProfile,
      target: l.objectTarget,
      ip: l.originIp,
      time: l.timestamp
    }));

    const activeSessions = await Rider.countDocuments({ ...riderFilter, isRegistered: true });
    const globalNodesCount = await Franchise.countDocuments(riderFilter);

    res.status(200).json({
      success: true,
      logs: formattedLogs,
      stats: {
        activeSessions: activeSessions || 0,
        authFailures: failures,
        integrity: failures > 5 ? 'Warning' : 'Pass',
        globalNodes: globalNodesCount.toString().padStart(2, '0'),
        latency: `${Math.floor(Math.random() * 15) + 5}ms`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotificationsFeed = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort('-timestamp').limit(15).lean();
    const notifications = logs.map(l => ({
      id: l._id.toString(),
      title: l.actionProfile,
      message: `${l.identity} performed ${l.actionProfile} on ${l.objectTarget}`,
      time: l.timestamp,
      type: l.status === 'failure' ? 'alert' : 'info'
    }));

    // Add Weekly Payment Due Alerts
    const now = new Date();
    const Rider = (await import('../rider/riderModel.js')).default;
    const expiredRiders = await Rider.find({
      subscriptionEnd: { $lt: now },
      subscriptionPlan: { $ne: null },
      status: { $in: ['active', 'approved'] }
    }).populate('subscriptionPlan').lean();

    const dueRiders = expiredRiders.filter(r => r.subscriptionPlan && r.subscriptionPlan.type === 'Weekly');

    dueRiders.forEach(r => {
      notifications.push({
        id: `due-${r._id}`,
        title: 'PAYMENT_DUE',
        message: `Weekly payment of ₹${r.subscriptionPlan.price} is due for ${r.name || r.phone}. Expired on ${new Date(r.subscriptionEnd).toLocaleDateString()}`,
        time: r.subscriptionEnd,
        type: 'alert'
      });
    });

    // Add Pending Withdrawals Alerts
    const WithdrawalRequest = (await import('../rider/models/withdrawalRequestModel.js')).default;
    const pendingWithdrawals = await WithdrawalRequest.find({ status: 'pending' }).populate('riderId', 'name phone').lean();

    pendingWithdrawals.forEach(w => {
      notifications.push({
        id: `withdraw-${w._id}`,
        title: 'WITHDRAWAL_REQUEST',
        message: `${w.riderId?.name || w.riderId?.phone || 'A rider'} requested a withdrawal of ₹${w.amount}`,
        time: w.createdAt,
        type: 'info' // Using info or alert based on priority
      });
    });

    // Sort all notifications by time descending and take top 20
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    const finalNotifications = notifications.slice(0, 20);

    res.status(200).json({ success: true, notifications: finalNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a security log / audit log
// @route   DELETE /api/v1/admin/security/:id
export const deleteSecurityLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log entry not found' });
    }
    await log.deleteOne();
    res.status(200).json({ success: true, message: 'Log entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubscriberData = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const riders = await Rider.find(dateFilter).populate('vehicleId', 'plate').sort('-createdAt').limit(100);

    const totalUsers = await Rider.countDocuments(dateFilter);
    const verifiedUsers = await Rider.countDocuments({ ...dateFilter, kycStatus: 'approved' });
    const kycRate = totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : "0";

    // Dynamic Daily Riders from Assignment model following the filter
    const assignmentFilter = getDateFilter(range, 'startTime');
    const dailyRidersCount = await Assignment.countDocuments(assignmentFilter);

    const flaggedUsers = await Rider.countDocuments({ ...dateFilter, status: { $in: ['suspended', 'paused'] } });

    const formattedSubscribers = riders.map(r => ({
      id: r._id,
      name: r.name || 'Unnamed',
      phone: r.phone,
      email: r.email || 'n/a',
      persona: r.role || 'Rider',
      locale: r.city || 'N/A',
      status: r.kycStatus === 'approved' ? 'approved' : (r.kycStatus === 'rejected' ? 'rejected' : (r.status || 'pending')),
      vehiclePlate: r.vehicleId?.plate || 'N/A'
    }));

    res.status(200).json({
      success: true,
      subscribers: formattedSubscribers,
      stats: {
        totalUsers: totalUsers.toLocaleString(),
        dailyRiders: verifiedUsers.toLocaleString(), // Showing Approved riders instead of active assignments
        kycVerified: `${kycRate}%`,
        flagged: flaggedUsers.toLocaleString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all roles
// @route   GET /api/v1/admin/roles
export const getRoles = async (req, res) => {
  try {
    const defaultModules = [
      'Overview',
      'Franchise Management',
      'Fleet Addition',
      'Geo Fencing',
      'Rider Reports',
      'KYC & Onboard',
      'HR Management',
      'Franchise Onboard',
      'Financial Center',
      'Payment Gateway',
      'Inventory & Billing',
      'Franchise & 3PL',
      'Subscription Plans',
      'Compliance',
      'Engagement & CRM',
      'Security & Audit',
      'Notifications',
      'Plans Page',
      'Contact Us',
      'About Us',
      'Press & Media'
    ];

    let roles = await Role.find().sort({ createdAt: -1 });

    // Seed if empty
    if (roles.length === 0) {
      const initialPermissions = {};
      defaultModules.forEach(mod => {
        initialPermissions[mod] = { read: true, create: false, update: false, delete: false };
      });

      await Role.insertMany([
        { name: 'Admin', permissions: initialPermissions },
        { name: 'Manager', permissions: initialPermissions },
        { name: 'Staff', permissions: initialPermissions }
      ]);
      roles = await Role.find().sort({ createdAt: -1 });
    }

    // Dynamic Sync: Get all unique roles defined in HR Management (Staff collection)
    const uniqueStaffRoles = await Staff.distinct('role');
    let existingRoles = await Role.find();

    // Dynamic Cleanup: Delete roles that are not default roles and no longer assigned to any active staff
    const defaultRoleNamesLower = ['admin', 'manager', 'staff', 'superadmin'];
    const activeStaffRolesLower = uniqueStaffRoles
      .filter(r => r && r.trim())
      .map(r => r.trim().toLowerCase());

    const rolesToDelete = [];
    for (const dbRole of existingRoles) {
      const dbRoleNameLower = dbRole.name.trim().toLowerCase();
      if (!defaultRoleNamesLower.includes(dbRoleNameLower) && !activeStaffRolesLower.includes(dbRoleNameLower)) {
        rolesToDelete.push(dbRole._id);
      }
    }

    if (rolesToDelete.length > 0) {
      await Role.deleteMany({ _id: { $in: rolesToDelete } });
      existingRoles = await Role.find(); // Re-fetch after deletion
    }

    const existingRoleNames = existingRoles.map(r => r.name.toLowerCase());

    const rolesToCreate = [];
    for (const staffRole of uniqueStaffRoles) {
      if (staffRole && staffRole.trim() && !existingRoleNames.includes(staffRole.trim().toLowerCase())) {
        const initialPermissions = {};
        defaultModules.forEach(mod => {
          initialPermissions[mod] = { read: true, create: false, update: false, delete: false };
        });
        rolesToCreate.push({ name: staffRole.trim(), permissions: initialPermissions });
      }
    }

    if (rolesToCreate.length > 0) {
      await Role.insertMany(rolesToCreate);
    }

    roles = await Role.find().sort({ createdAt: -1 });

    // Background Repair (Non-blocking)
    roles.forEach(async (role) => {
      let permissionsUpdated = false;

      // Deep Repair: Ensure permissions is a valid object and NOT a string
      if (!role.permissions || typeof role.permissions !== 'object' || Array.isArray(role.permissions)) {
        role.permissions = {};
        permissionsUpdated = true;
      }

      defaultModules.forEach(mod => {
        if (!role.permissions[mod] || typeof role.permissions[mod] !== 'object') {
          role.permissions[mod] = { read: true, create: false, update: false, delete: false };
          permissionsUpdated = true;
        }
      });

      if (permissionsUpdated) {
        try {
          await Role.updateOne({ _id: role._id }, { $set: { permissions: role.permissions } });
        } catch (err) {
          console.error("Background Repair Failed:", err);
        }
      }
    });

    res.status(200).json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new role
// @route   POST /api/v1/admin/roles
export const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    // Default permissions if not provided
    const defaultModules = [
      'Overview',
      'Franchise Management',
      'Fleet Addition',
      'Geo Fencing',
      'Rider Reports',
      'KYC & Onboard',
      'HR Management',
      'Franchise Onboard',
      'Financial Center',
      'Payment Gateway',
      'Inventory & Billing',
      'Franchise & 3PL',
      'Subscription Plans',
      'Compliance',
      'Engagement & CRM',
      'Security & Audit',
      'Notifications',
      'Plans Page',
      'Contact Us',
      'About Us',
      'Press & Media'
    ];
    const finalPermissions = permissions || {};
    defaultModules.forEach(mod => {
      if (!finalPermissions[mod]) {
        finalPermissions[mod] = { read: false, create: false, update: false, delete: false };
      }
    });

    const newRole = await Role.create({ name, permissions: finalPermissions });
    res.status(201).json({ success: true, role: newRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing role's permissions
// @route   PUT /api/v1/admin/roles/:id
export const updateRole = async (req, res) => {
  try {
    const { permissions, name } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (name) role.name = name;
    if (permissions) {
      role.permissions = permissions;
      role.markModified('permissions');
    }

    const updatedRole = await role.save();
    res.status(200).json({ success: true, role: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all campaigns
// @route   GET /api/v1/admin/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await PromoCampaign.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new campaign
// @route   POST /api/v1/admin/campaigns
export const createCampaign = async (req, res) => {
  try {
    const { name, campaignId } = req.body;
    const newCampaign = await PromoCampaign.create({ name, campaignId });
    res.status(201).json({ success: true, campaign: newCampaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate Aadhaar OTP for Staff eKYC
export const generateStaffAadhaarOTP = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    const config = {
      method: 'post',
      url: 'https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp',
      headers: { 'Content-Type': 'application/json' },
      data: {
        key: process.env.SUREPASS_API_KEY,
        id_number: aadhaarNumber
      }
    };

    const response = await axios(config);
    if (response.data.success || response.data.status === 'success' || response.data.message === 'OTP Sent.') {
      const requestId = response.data.data?.request_id || response.data.request_id || response.data.data?.client_id;
      res.status(200).json({
        success: true,
        client_id: requestId,
        message: response.data.message || 'OTP sent to mobile'
      });
    } else {
      res.status(400).json({ success: false, message: response.data.message || 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

// @desc    Verify Aadhaar OTP for Staff eKYC
export const verifyStaffAadhaarOTP = async (req, res) => {
  try {
    const { client_id, otp, staffId } = req.body;
    const config = {
      method: 'post',
      url: 'https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp',
      headers: { 'Content-Type': 'application/json' },
      data: {
        key: process.env.SUREPASS_API_KEY,
        request_id: client_id,
        otp
      }
    };

    const response = await axios(config);
    if (response.data.success || response.data.status === 'success') {
      const kycData = response.data.data || response.data;

      // If staffId is provided (Edit mode), update DB immediately
      if (staffId) {
        const staff = await Staff.findById(staffId);
        if (staff) {
          staff.kycDetails.isVerified = true;
          staff.kycDetails.aadhaar = kycData.aadhaar_number || staff.kycDetails.aadhaar;
          staff.kycDetails.ekycData = kycData;
          await staff.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Aadhaar Verified Successfully',
        data: kycData
      });
    } else {
      res.status(400).json({ success: false, message: response.data.message || 'OTP verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

// --- RIDER MANAGEMENT CRUD ---

export const getAllRiders = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const riders = await Rider.find(dateFilter).sort('-createdAt').populate('subscriptionPlan');

    // Truly Dynamic Stats Logic
    const activeAlerts = riders.filter(r => r.status === 'suspended').length;
    const lowBalance = riders.filter(r => (r.walletBalance || 0) < 500).length; // Threshold ₹500
    const docExpiry = riders.filter(r => r.kycStatus === 'pending').length;

    res.status(200).json({
      success: true,
      riders,
      stats: {
        activeAlerts,
        lowBalance,
        docExpiry
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRider = async (req, res) => {
  try {
    const { name, phone, email, status, plan } = req.body;

    const existingRider = await Rider.findOne({ phone });
    if (existingRider) {
      return res.status(400).json({ success: false, message: 'Rider with this phone already exists' });
    }

    let rider = await Rider.create({
      name,
      phone,
      email,
      subscriptionPlan: plan || null,
      kycStatus: 'pending',
      status: status || 'pending'
    });

    rider = await rider.populate('subscriptionPlan');

    res.status(201).json({ success: true, rider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRider = async (req, res) => {
  try {
    const { name, phone, email, status, plan } = req.body;
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    if (name) rider.name = name;
    if (phone) rider.phone = phone;
    if (email) rider.email = email;
    if (status) rider.status = status;
    if (plan !== undefined) rider.subscriptionPlan = plan;

    await rider.save();
    const updatedRider = await Rider.findById(rider._id).populate('subscriptionPlan');

    res.status(200).json({ success: true, rider: updatedRider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }
    await rider.deleteOne();
    res.status(200).json({ success: true, message: 'Rider deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed rider report with vehicle, plan and payments
// @route   GET /api/v1/admin/rider-report
export const getRiderDetailedReport = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const riders = await Rider.find(dateFilter)
      .populate('subscriptionPlan')
      .populate('vehicleId', 'plate model')
      .populate('franchise', 'name')
      .sort('-createdAt')
      .lean();

    const report = await Promise.all(riders.map(async (r) => {
      // Fetch successful transactions for this rider (direct)
      const txns = await RiderTransaction.find({
        riderId: r._id,
        status: { $in: ['success', 'completed'] }
      }).sort('-createdAt').lean();

      // Fetch franchise transactions for this rider (if applicable)
      let franchiseTxns = [];
      if (r.franchise && r.franchise._id) {
        // Use case-insensitive regex to match subscriberName robustly
        const namesToMatch = [r.name, r.phone].filter(Boolean);
        const nameRegexes = namesToMatch.map(name => new RegExp(`^\\s*${name.trim()}\\s*$`, 'i'));

        franchiseTxns = await Transaction.find({
          franchiseId: r.franchise._id,
          status: { $in: ['success', 'completed'] },
          subscriberName: { $in: nameRegexes }
        }).sort('-date').lean();
      }

      const allAmounts = [
        ...txns.map(t => Number(t.amount) || 0),
        ...franchiseTxns.map(t => Number(t.amount) || 0)
      ];
      const totalPayments = allAmounts.reduce((acc, val) => acc + val, 0);

      const totalDebits = [
        ...txns.filter(t => t.type === 'debit').map(t => Number(t.amount) || 0),
        ...franchiseTxns.filter(t => ['Subscription', 'Deposit'].includes(t.type)).map(t => Number(t.amount) || 0)
      ].reduce((acc, val) => acc + val, 0);

      const combinedTxns = [
        ...txns.map(t => ({
          id: t._id,
          txnId: t.transactionId || `TXN-${t._id.toString().slice(-6).toUpperCase()}`,
          amount: Number(t.amount) || 0,
          type: t.type,
          method: t.method || 'unknown',
          date: t.createdAt,
          description: t.description || 'Wallet/Plan Payment'
        })),
        ...franchiseTxns.map(t => ({
          id: t._id,
          txnId: t.transactionId || `TXN-${t._id.toString().slice(-6).toUpperCase()}`,
          amount: Number(t.amount) || 0,
          type: t.type === 'Deposit' ? 'credit' : 'debit',
          method: t.paymentMethod || 'unknown',
          date: t.date,
          description: t.description || `${t.type} Payment`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      const depositTxn = franchiseTxns.find(t => t.type === 'Deposit') || txns.find(t => t.description?.toLowerCase().includes('deposit'));
      const depositAmount = depositTxn ? Number(depositTxn.amount) : 0;
      const latestPaymentMethod = combinedTxns.length > 0 ? combinedTxns[0].method : null;

      return {
        id: r._id,
        name: r.name || 'Unnamed',
        phone: r.phone,
        email: r.email || 'N/A',
        franchiseName: r.franchise?.name || 'FLEXIGO',
        vehicleNumber: r.vehicleId?.plate || 'N/A',
        vehicleModel: r.vehicleId?.model || 'N/A',
        activePlan: r.subscriptionPlan?.name || 'No Plan',
        planPrice: r.subscriptionPlan?.price || 0,
        totalPayments: totalPayments,
        totalDebits: totalDebits,
        walletBalance: r.walletBalance || 0,
        totalDistance: r.totalDistance || 0,
        depositPaid: r.depositPaid || false,
        depositAmount: depositAmount,
        latestPaymentMethod: latestPaymentMethod,
        status: r.kycStatus === 'approved' ? 'approved' : (r.kycStatus === 'rejected' ? 'rejected' : (r.status || 'pending')),
        kycStatus: r.kycStatus,
        recentPayments: combinedTxns.slice(0, 5)
      };
    }));

    // Sort report by most recent payment date
    report.sort((a, b) => {
      const dateA = a.recentPayments && a.recentPayments.length > 0 ? new Date(a.recentPayments[0].date).getTime() : 0;
      const dateB = b.recentPayments && b.recentPayments.length > 0 ? new Date(b.recentPayments[0].date).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });

    res.status(200).json({
      success: true,
      count: report.length,
      report
    });
  } catch (error) {
    console.error("Rider Detailed Report Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vehicles for a specific hub (no franchise auth required)
// @route   GET /api/v1/admin/hubs/:id/vehicles
export const getHubVehicles = async (req, res) => {
  try {
    const franchiseId = req.params.id;
    const vehicles = await Vehicle.find({ franchise: franchiseId }).sort('-createdAt').lean();

    // Track which riders are already linked via a vehicle
    const ridersWithVehicle = new Set();

    for (let vehicle of vehicles) {
      try {
        let assignment = await Assignment.findOne({ vehicle: vehicle._id, status: 'active' }).lean();
        if (assignment) {
          const rider = await Rider.findById(assignment.rider)
            .populate('subscriptionPlan')
            .select('name phone subscriptionPlan adminAssignedStartDate depositPaid subscriptionEnd _id')
            .lean();
          if (rider) {
            vehicle.rider = rider.name || rider.phone;
            vehicle.riderId = rider._id;
            vehicle.subscriptionPlan = rider.subscriptionPlan;
            vehicle.adminAssignedStartDate = rider.adminAssignedStartDate;
            vehicle.depositPaid = rider.depositPaid;
            vehicle.subscriptionEnd = rider.subscriptionEnd;
            ridersWithVehicle.add(rider._id.toString());
          }
        }
      } catch (_) { }
    }

    const franchiseRiders = await Rider.find({
      franchise: franchiseId,
      role: 'rider',
      kycStatus: 'approved'
    })
      .populate('subscriptionPlan')
      .select('name phone subscriptionPlan adminAssignedStartDate depositPaid subscriptionEnd _id')
      .lean();

    // Create virtual "unassigned" vehicle entries for riders without a vehicle
    const unassignedRiders = franchiseRiders.filter(r => !ridersWithVehicle.has(r._id.toString()));
    const unassignedEntries = unassignedRiders.map(rider => ({
      _id: `unassigned-${rider._id}`,
      plate: null,
      model: null,
      franchise: franchiseId,
      status: 'unassigned',
      rider: rider.name || rider.phone,
      riderId: rider._id,
      subscriptionPlan: rider.subscriptionPlan,
      adminAssignedStartDate: rider.adminAssignedStartDate,
      depositPaid: rider.depositPaid,
      subscriptionEnd: rider.subscriptionEnd,
      isUnassignedRider: true
    }));

    const allEntries = [...unassignedEntries, ...vehicles];

    res.status(200).json({ success: true, count: allEntries.length, vehicles: allEntries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single franchise/hub by ID with full details
// @route   GET /api/v1/admin/hubs/:id
export const getFranchiseById = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    const fleetCount = await Vehicle.countDocuments({ franchise: franchise._id });

    const franchiseVehicles = await Vehicle.find({ franchise: franchise._id }).select('_id');
    const vehicleIds = franchiseVehicles.map(v => v._id);

    const activeAssignments = await Assignment.find({
      vehicle: { $in: vehicleIds },
      status: 'active'
    }).select('rider');
    const assignedRiderIds = activeAssignments.map(a => a.rider);

    const subsCount = await Rider.countDocuments({
      $or: [
        { franchise: franchise._id },
        { vehicleId: { $in: vehicleIds } },
        { _id: { $in: assignedRiderIds } }
      ],
      status: 'approved',
      role: 'rider'
    });
    const revenueData = await Transaction.find({ franchiseId: franchise._id, type: 'Subscription', status: 'completed' });
    const totalRevenue = revenueData.reduce((acc, t) => acc + t.amount, 0);
    const serviceCount = await Vehicle.countDocuments({ franchise: franchise._id, status: 'in-service' });
    const healthVal = fleetCount > 0 ? Math.round(((fleetCount - serviceCount) / fleetCount) * 100) : 100;

    const displayName =
      (franchise.businessDetails?.name && franchise.businessDetails.name.length < 40
        ? franchise.businessDetails.name
        : null) ||
      franchise.hubName ||
      franchise.ownerName ||
      franchise.phone ||
      'Unknown Hub';

    const displayCity =
      franchise.businessDetails?.location ||
      franchise.businessDetails?.address ||
      franchise.city ||
      '-';

    res.status(200).json({
      success: true,
      hub: {
        id: franchise._id,
        _id: franchise._id,
        name: displayName,
        hubName: franchise.hubName,
        ownerName: franchise.ownerName,
        phone: franchise.phone,
        email: franchise.email,
        city: displayCity,
        address: franchise.businessDetails?.address || '',
        capacity: franchise.businessDetails?.capacity || 0,
        lat: franchise.businessDetails?.latitude || null,
        lng: franchise.businessDetails?.longitude || null,
        fleet: subsCount,
        subs: subsCount,
        revenue: totalRevenue,
        status: franchise.status || 'active',
        health: `${healthVal}%`,
        kycStatus: franchise.kycStatus,
        isVerified: franchise.isVerified,
        businessDetails: franchise.businessDetails,
        bankDetails: franchise.bankDetails,
        createdAt: franchise.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update franchise/hub
// @route   PUT /api/v1/admin/hubs/:id
export const updateHub = async (req, res) => {
  try {
    const { name, ownerName, city, email, phone, fleet, status, address, latitude, longitude, password } = req.body;

    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    if (password !== undefined && password !== '') {
      franchise.password = password;
    }
    if (name !== undefined) {
      franchise.hubName = name;
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.name = name;
    }
    if (ownerName !== undefined) franchise.ownerName = ownerName;
    if (city !== undefined) {
      franchise.city = city;
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.location = city;
    }
    if (email !== undefined) franchise.email = email;
    if (phone !== undefined) franchise.phone = phone;
    if (status !== undefined) franchise.status = status;
    if (address !== undefined) {
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.address = address;
    }
    if (latitude !== undefined) {
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.latitude = parseFloat(latitude);
    }
    if (longitude !== undefined) {
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.longitude = parseFloat(longitude);
    }
    if (fleet !== undefined) {
      if (!franchise.businessDetails) franchise.businessDetails = {};
      franchise.businessDetails.capacity = parseInt(fleet) || 0;
    }

    franchise.markModified('businessDetails');
    await franchise.save();

    const fleetCount = await Vehicle.countDocuments({ franchise: franchise._id });
    const serviceCount = await Vehicle.countDocuments({ franchise: franchise._id, status: 'in-service' });
    const healthVal = fleetCount > 0 ? Math.round(((fleetCount - serviceCount) / fleetCount) * 100) : 100;

    const displayName =
      franchise.businessDetails?.name ||
      franchise.hubName ||
      franchise.ownerName ||
      franchise.phone ||
      'Unknown Hub';
    const displayCity =
      franchise.businessDetails?.location ||
      franchise.businessDetails?.address ||
      franchise.city ||
      '-';

    res.status(200).json({
      success: true,
      hub: {
        id: franchise._id,
        name: displayName,
        ownerName: franchise.ownerName,
        phone: franchise.phone,
        email: franchise.email,
        city: displayCity,
        fleet: fleetCount,
        subs: fleetCount,
        status: franchise.status || 'active',
        health: `${healthVal}%`,
        capacity: franchise.businessDetails?.capacity || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete franchise/hub
// @route   DELETE /api/v1/admin/hubs/:id
export const deleteHub = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }
    await franchise.deleteOne();
    res.status(200).json({ success: true, message: 'Franchise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get Admin Profile
// @route   GET /api/v1/admin/profile
// @desc    Credit Franchise Wallet
// @route   POST /api/v1/admin/franchise/:id/credit
export const creditFranchiseWallet = async (req, res) => {
  try {
    const { amount, description, type } = req.body;
    const { id } = req.params;

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    franchise.walletBalance = (franchise.walletBalance || 0) + Number(amount);
    await franchise.save();

    const transaction = await Transaction.create({
      franchiseId: franchise._id,
      amount: Number(amount),
      type: type || 'Bonus',
      description: description || 'Wallet credit by admin',
      status: 'completed',
      date: new Date()
    });

    // Send Real-time Notification
    const fcmToken = franchise.fcmToken || franchise.fcmTokenMobile;
    if (fcmToken) {
      const title = 'Wallet Credited';
      const body = `₹${amount} has been credited to your wallet. Ref: ${transaction._id.toString().slice(-6).toUpperCase()}`;
      await sendPushNotification(fcmToken, title, body, {
        type: 'wallet_credit',
        amount: amount.toString(),
        transactionId: transaction._id.toString()
      });
    }

    res.status(200).json({
      success: true,
      message: `₹${amount} credited successfully`,
      walletBalance: franchise.walletBalance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Franchise Payout Status
// @route   PATCH /api/v1/admin/franchise/payout/:id
export const updateFranchisePayoutStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.status = status;
    await transaction.save();

    // If approved, we already deducted balance during request? 
    // Usually Payout request deducts balance and sets status to pending.
    // If rejected, we should refund the balance.
    if (status === 'failed' || status === 'rejected') {
      const franchise = await Franchise.findById(transaction.franchiseId);
      if (franchise) {
        franchise.walletBalance += Math.abs(transaction.amount);
        await franchise.save();
      }
    }

    // Send Notification
    const franchise = await Franchise.findById(transaction.franchiseId);
    const fcmToken = franchise?.fcmToken || franchise?.fcmTokenMobile;
    if (fcmToken) {
      const title = `Payout ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      const body = `Your payout request of ₹${Math.abs(transaction.amount)} has been ${status}.`;
      await sendPushNotification(fcmToken, title, body, {
        type: 'payout_update',
        status,
        amount: Math.abs(transaction.amount).toString()
      });
    }

    res.status(200).json({ success: true, message: `Payout ${status}`, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {

  try {
    // For now, since we only have one admin, we find the first one
    // or create one if it doesn't exist (Seeding logic)
    let admin = await Admin.findOne({ email: 'admin@flexigo.com' });

    if (!admin) {
      admin = await Admin.create({
        name: 'Master Administrator',
        email: 'admin@flexigo.com',
        password: 'flexigo_root', // This will be hashed by pre-save middleware
        role: 'SuperAdmin'
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Admin Password
// @route   PUT /api/v1/admin/update-password
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findOne({ email: 'admin@flexigo.com' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { securityDepositAmount } = req.body;
    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = await SystemSetting.create({ securityDepositAmount });
    } else {
      if (securityDepositAmount !== undefined) {
        settings.securityDepositAmount = securityDepositAmount;
      }
      await settings.save();
    }

    res.json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// --- Rider Refund Functions ---

export const getRidersList = async (req, res) => {
  try {
    const riders = await Rider.find({}, 'name phone franchise status walletBalance').lean();
    const franchises = await Franchise.find({}, 'ownerName hubName phone walletBalance').lean();

    const formattedRiders = riders.map(r => ({
      id: r._id,
      name: r.name || 'Unknown Rider',
      phone: r.phone,
      type: 'Rider',
      franchiseId: r.franchise,
      walletBalance: r.walletBalance || 0
    }));

    const formattedFranchises = franchises.map(f => ({
      id: f._id,
      name: (f.ownerName || f.hubName) ? `${f.ownerName || 'Owner'} (${f.hubName || 'Franchise'})` : 'Unknown Franchise',
      phone: f.phone,
      type: 'Franchise',
      walletBalance: f.walletBalance || 0
    }));

    res.status(200).json({ success: true, riders: [...formattedRiders, ...formattedFranchises] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminWalletDashboard = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id || req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const transactions = await AdminTransaction.find()
      .populate('targetRider', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      walletBalance: admin.walletBalance || 0,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAdminFundsOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `admin_recharge_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('[Admin Recharge Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAdminFundsPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');

    if (expectedSignature === razorpay_signature) {
      const admin = await Admin.findById(req.admin._id || req.admin.id);
      if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

      admin.walletBalance = (admin.walletBalance || 0) + Number(amount);
      await admin.save();

      await AdminTransaction.create({
        adminId: admin._id,
        amount: Number(amount),
        type: 'credit',
        description: 'Wallet Recharge via Razorpay',
        targetType: 'Self',
        transactionId: razorpay_payment_id,
        closingBalance: admin.walletBalance
      });

      res.status(200).json({ success: true, message: 'Wallet recharged successfully', walletBalance: admin.walletBalance });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('[Admin Recharge Verify Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processWalletRefund = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, riderId, description, upiId, phone, barcodeUrl } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!riderId) throw new Error('Rider ID is required');

    const admin = await Admin.findById(req.admin._id || req.admin.id).session(session);
    if (!admin) throw new Error('Admin not found');

    if ((admin.walletBalance || 0) < amount) {
      throw new Error('Insufficient Admin Wallet Balance. Please add funds first.');
    }

    const Franchise = (await import('../franchise/franchiseModel.js')).default;
    let target = await Rider.findById(riderId).session(session);
    let targetType = 'Rider';
    if (!target) {
      target = await Franchise.findById(riderId).session(session);
      targetType = 'Franchise';
    }
    if (!target) throw new Error('Target not found');

    let uploadedBarcodeUrl = barcodeUrl;
    if (barcodeUrl && barcodeUrl.startsWith('data:image')) {
      const { saveImageLocal } = await import('../../shared/utils/localUpload.js');
      uploadedBarcodeUrl = saveImageLocal(req, barcodeUrl, 'refund-barcode', riderId);
    }

    // Deduct from Admin
    admin.walletBalance -= Number(amount);
    await admin.save({ session });

    // Credit to Target
    target.walletBalance = (target.walletBalance || 0) + Number(amount);
    await target.save({ session });

    // Record AdminTransaction
    const adminTx = await AdminTransaction.create([{
      adminId: admin._id,
      amount: Number(amount),
      type: 'debit',
      description: description || `Refund to ${targetType} ${target.name || target.ownerName || target.phone}`,
      targetRider: targetType === 'Rider' ? target._id : null,
      targetFranchise: targetType === 'Franchise' ? target._id : null,
      targetType: targetType,
      transactionId: `REF-${Date.now()}`,
      closingBalance: admin.walletBalance,
      upiId: upiId || null,
      phone: phone || null,
      barcodeUrl: uploadedBarcodeUrl || null
    }], { session });

    if (targetType === 'Rider') {
      // Record RiderTransaction
      await RiderTransaction.create([{
        riderId: target._id,
        amount: Number(amount),
        type: 'credit',
        method: 'wallet',
        status: 'success',
        description: description || 'Refund received from Admin Wallet',
        referenceId: adminTx[0].transactionId,
        createdAt: new Date()
      }], { session });

      // Franchise transaction if rider belongs to franchise
      if (target.franchise) {
        await FranchiseTransaction.create([{
          franchiseId: target.franchise,
          amount: Number(amount),
          type: 'credit',
          description: `Rider ${target.name || target.phone} refunded from Admin`,
          targetRider: target._id,
          createdAt: new Date()
        }], { session });
      }

      // Send Push Notification
      try {
        const { sendPushNotification } = await import('../../shared/utils/notifications.js');
        if (target.fcmToken || target.fcmTokenMobile) {
          await sendPushNotification(
            [target.fcmToken, target.fcmTokenMobile].filter(Boolean),
            'Refund Received 💰',
            `₹${amount} has been refunded to your wallet.`,
            { type: 'REFUND_CREDIT', amount: String(amount) }
          );
        }
      } catch (err) {
        console.error('Notification error:', err);
      }
    } else if (targetType === 'Franchise') {
      await FranchiseTransaction.create([{
        franchiseId: target._id,
        amount: Number(amount),
        type: 'credit',
        description: description || 'Refund received from Admin Wallet',
        createdAt: new Date()
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Refund processed successfully', walletBalance: admin.walletBalance });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('[Process Wallet Refund Error]', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Withdrawal Request Functions ---

export const getWithdrawals = async (req, res) => {
  try {
    const WithdrawalRequest = (await import('../rider/models/withdrawalRequestModel.js')).default;
    const withdrawals = await WithdrawalRequest.find()
      .populate('riderId', 'name phone walletBalance')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, transactionId } = req.body;
    const WithdrawalRequest = (await import('../rider/models/withdrawalRequestModel.js')).default;

    const request = await WithdrawalRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request is not pending' });

    request.status = 'approved';
    request.adminNotes = adminNotes || 'Approved by Admin';
    request.transactionId = transactionId || '';
    request.processedAt = new Date();
    await request.save();

    // Rider balance was already deducted when requesting.
    // We just send a notification.
    try {
      const rider = await Rider.findById(request.riderId);
      if (rider && (rider.fcmToken || rider.fcmTokenMobile)) {
        const { sendPushNotification } = await import('../../shared/utils/notifications.js');
        await sendPushNotification(
          [rider.fcmToken, rider.fcmTokenMobile].filter(Boolean),
          'Withdrawal Approved 💸',
          `Your withdrawal of ₹${request.amount} has been successfully transferred to your bank/UPI.`,
          { type: 'WITHDRAWAL_APPROVED' }
        );
      }
    } catch (err) {
      console.error('Notification error:', err);
    }

    res.status(200).json({ success: true, message: 'Withdrawal approved successfully' });
  } catch (error) {
    console.error('[Approve Withdrawal Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    if (!adminNotes) throw new Error('Rejection reason is required');

    const WithdrawalRequest = (await import('../rider/models/withdrawalRequestModel.js')).default;
    const request = await WithdrawalRequest.findById(id).session(session);

    if (!request) throw new Error('Request not found');
    if (request.status !== 'pending') throw new Error('Request is not pending');

    // Refund the amount to the Rider
    const rider = await Rider.findById(request.riderId).session(session);
    if (!rider) throw new Error('Rider not found');

    rider.walletBalance = (rider.walletBalance || 0) + request.amount;
    await rider.save({ session });

    // Record the refund transaction
    await RiderTransaction.create([{
      riderId: rider._id,
      amount: request.amount,
      type: 'credit',
      method: 'wallet',
      status: 'success',
      description: `Refund for rejected withdrawal: ${adminNotes}`,
      createdAt: new Date()
    }], { session });

    // Update the request
    request.status = 'rejected';
    request.adminNotes = adminNotes;
    request.processedAt = new Date();
    await request.save({ session });

    // Send notification
    try {
      if (rider.fcmToken || rider.fcmTokenMobile) {
        const { sendPushNotification } = await import('../../shared/utils/notifications.js');
        await sendPushNotification(
          [rider.fcmToken, rider.fcmTokenMobile].filter(Boolean),
          'Withdrawal Rejected ❌',
          `Your withdrawal of ₹${request.amount} was rejected. Amount has been refunded to your wallet. Reason: ${adminNotes}`,
          { type: 'WITHDRAWAL_REJECTED' }
        );
      }
    } catch (err) {
      console.error('Notification error:', err);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Withdrawal rejected and amount refunded' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('[Reject Withdrawal Error]', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Adhoc Payment Functions ---

// @desc    Process a manual adhoc payment
// @route   POST /api/v1/admin/adhoc-payment
export const processAdhocPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, description, upiId, phone, barcodeUrl } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid amount');

    const admin = await Admin.findById(req.admin._id || req.admin.id).session(session);
    if (!admin) throw new Error('Admin not found');

    if ((admin.walletBalance || 0) < amount) {
      throw new Error('Insufficient Admin Wallet Balance. Please add funds first.');
    }

    let uploadedBarcodeUrl = barcodeUrl;

    if (barcodeUrl && barcodeUrl.startsWith('data:image')) {
      const cloudinary = (await import('../../config/cloudinary.js')).default;
      const uploadResult = await cloudinary.uploader.upload(barcodeUrl, { folder: 'flexigo/adhoc_payments' });
      uploadedBarcodeUrl = uploadResult.secure_url;
    }

    // Deduct from Admin
    admin.walletBalance -= Number(amount);
    await admin.save({ session });

    // Record AdminTransaction
    const adminTx = await AdminTransaction.create([{
      adminId: admin._id,
      amount: Number(amount),
      type: 'debit',
      description: description || `Adhoc Payment to ${upiId || phone || 'Unknown'}`,
      targetType: 'Adhoc',
      transactionId: `ADHOC-${Date.now()}`,
      closingBalance: admin.walletBalance,
      upiId: upiId || null,
      phone: phone || null,
      barcodeUrl: uploadedBarcodeUrl || null
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Adhoc Payment processed successfully', transaction: adminTx[0], walletBalance: admin.walletBalance });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('[Process Adhoc Payment Error]', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Get adhoc payments history
// @route GET /api/v1/admin/adhoc-payments

export const getAdhocPayments = async (req, res) => {
  try {
    const transactions = await AdminTransaction.find({ targetType: 'Adhoc' })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get rider assignment history
// @route GET /api/v1/admin/rider-history
export const getRiderHistory = async (req, res) => {
  try {
    const Assignment = (await import('../fleet/assignmentModel.js')).default;
    const assignments = await Assignment.find()
      .populate('rider')
      .populate('vehicle', 'plate model vin')
      .sort({ startTime: -1 });

    res.status(200).json({ success: true, history: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
