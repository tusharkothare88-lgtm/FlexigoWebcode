import jwt from 'jsonwebtoken';
import Franchise from '../../modules/franchise/franchiseModel.js';
import Rider from '../../modules/rider/riderModel.js';
import Admin from '../../modules/admin/adminModel.js';
import Staff from '../../modules/admin/staffModel.js';
import Role from '../../modules/admin/roleModel.js';

export const protectFranchise = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.franchise = await Franchise.findById(decoded.id).select('-otp -otpExpire');
      if (!req.franchise) return res.status(401).json({ success: false, message: 'Authorized user not found' });
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid Token' });
    }
  }
  if (!token) res.status(401).json({ success: false, message: 'No Token' });
};

export const protectFranchiseOrAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.franchise = await Franchise.findById(decoded.id).select('-otp -otpExpire');
      if (req.franchise) {
        return next();
      }

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (req.admin) {
        return next();
      }

      const staff = await Staff.findById(decoded.id).select('-password');
      if (staff && staff.status === 'active') {
        req.admin = {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.assignedRole || staff.role,
          accountType: 'staff'
        };
        return next();
      }

      return res.status(401).json({ success: false, message: 'Authorized user not found' });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid Token' });
    }
  }
  if (!token) res.status(401).json({ success: false, message: 'No Token' });
};

export const protectRider = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.rider = await Rider.findById(decoded.id).select('-otp -otpExpire');
      if (!req.rider) return res.status(401).json({ success: false, message: 'Authorized rider not found' });
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid Token' });
    }
  }
  if (!token) res.status(401).json({ success: false, message: 'No Token' });
};

// @desc    Protect Admin Routes
export const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1. Check Admin table first
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        // 2. Not found in Admin — check Staff table (HR-created staff)
        const staff = await Staff.findById(decoded.id).select('-password');
        if (!staff) {
          return res.status(401).json({ success: false, message: 'Authorized user not found' });
        }
        if (staff.status !== 'active') {
          return res.status(403).json({ success: false, message: 'Account inactive' });
        }
        // Attach staff as req.admin so authorize() middleware works
        req.admin = {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.assignedRole || staff.role,
          accountType: 'staff'
        };
      }

      next();
    } catch (error) {
      console.error("DEBUG: JWT Verification Error:", error.message);
      res.status(401).json({ success: false, message: 'Invalid Admin Token' });
    }
  }
  if (!token) res.status(401).json({ success: false, message: 'Authorization Required' });
};

// @desc    Authorize Admin Permissions
export const authorize = (module, action) => {
  return async (req, res, next) => {
    try {
      // 1. Better SuperAdmin Check (Case-insensitive)
      const userRole = req.admin.role || '';
      const lowerRole = userRole.toLowerCase();
      if (lowerRole === 'superadmin' || lowerRole === 'admin' || lowerRole === 'administrator') {
        return next();
      }

      // 2. Fetch the role's permissions from DB
      const role = await Role.findOne({
        name: { $regex: new RegExp(`^${userRole}$`, 'i') }
      });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: `Role '${userRole}' not defined in Matrix. Access Denied.`
        });
      }

      // 3. Translate old permission modules to new sidebar labels
      const moduleMap = {
        'Dashboard': 'Overview',
        'Hubs': 'Franchise Management',
        'Fleet': 'Fleet Addition',
        'Geofencing': 'Geo Fencing',
        'Subscribers': 'Rider Reports',
        'KYC': 'KYC & Onboard',
        'Staff': 'HR Management',
        'Franchise': 'Franchise Onboard',
        'Finance': 'Financial Center',
        'Plans': 'Subscription Plans',
        'Compliance': 'Compliance',
        'Engagement': 'Engagement & CRM',
        'Security': 'Security & Audit'
      };
      const targetModule = moduleMap[module] || module;

      // 4. Verify permission
      const hasPermission = role.permissions && role.permissions[targetModule] && role.permissions[targetModule][action];

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: No '${action}' permission for '${targetModule}'.`
        });
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(500).json({ success: false, message: 'Internal Security Error' });
    }
  };
};
