import express from 'express';
import {
  sendOTP,
  verifyOTP,
  updateRegistration,
  getWalletData,
  getDashboardMetrics,
  createHandover,
  generateAadhaarOTP,
  verifyAadhaarOTP,
  getFranchisePlans,
  saveFcmToken,
  addVehicle,
  franchiseLogin,
  resetPassword,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  addWalletFunds,
  createWalletOrder,
  verifyWalletPayment,
  getRiderDues,
  payRiderPlan,
  payRiderDeposit,
  createDepositOrder,
  verifyDepositPayment,
  createPlanOrder,
  verifyPlanPayment,
  addRider
} from './franchiseController.js';
import { protectFranchise } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/send-otp', sendOTP);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/login', franchiseLogin);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/save-fcm-token', protectFranchise, saveFcmToken);
router.get('/plans', getFranchisePlans);
router.post('/update-registration', protectFranchise, updateRegistration);
router.get('/wallet', protectFranchise, getWalletData);
router.post('/wallet/add', protectFranchise, addWalletFunds);
router.post('/wallet/create-order', protectFranchise, createWalletOrder);
router.post('/wallet/verify-payment', protectFranchise, verifyWalletPayment);
router.get('/dashboard-metrics', protectFranchise, getDashboardMetrics);
router.post('/handover', protectFranchise, createHandover);
router.post('/kyc/aadhaar/generate-otp', generateAadhaarOTP);
router.post('/kyc/aadhaar/verify-otp', verifyAadhaarOTP);
router.post('/fleet/add', protectFranchise, addVehicle);

// Notifications
router.get('/notifications', protectFranchise, getNotifications);
router.patch('/notifications/:id/read', protectFranchise, markNotificationRead);
router.patch('/notifications/mark-all-read', protectFranchise, markAllNotificationsRead);

// Rider Management (Payments & Dues)
router.get('/riders/dues', protectFranchise, getRiderDues);
router.post('/riders/pay-plan', protectFranchise, payRiderPlan);
router.post('/riders/pay-deposit', protectFranchise, payRiderDeposit);
router.post('/riders/deposit-create-order', protectFranchise, createDepositOrder);
router.post('/riders/deposit-verify', protectFranchise, verifyDepositPayment);
router.post('/riders/plan-create-order', protectFranchise, createPlanOrder);
router.post('/riders/plan-verify', protectFranchise, verifyPlanPayment);
router.post('/riders/add', protectFranchise, addRider);

export default router;
