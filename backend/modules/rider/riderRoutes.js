import express from 'express';
import {
  sendOTP,
  verifyOTP,
  updateKYC,
  getRiderProfile,
  addMoney,
  uploadAttachment,
  uploadProfileDocuments,
  getWalletData,
  getSubscribersByFranchise,
  getActiveHubs,
  getMyVehicle,
  getRiderPlans,
  saveRiderPlan,
  createPaymentOrder,
  verifyPayment,
  getRiderPayments,
  payViaWallet,
  requestQRPayment,
  generateAadhaarOTP,
  verifyAadhaarOTP,
  saveFcmToken,
  updateRiderLocation,
  requestHandover,
  payDepositViaWallet,
  createDepositOrder,
  verifyDepositPayment,
  requestDepositQR,
  getSettings,
  createWalletTopUpOrder,
  verifyWalletTopUp,
  createAddOffOrder,
  verifyAddOffPayment,
  requestWithdrawal,
  riderLogin,
  resetPassword,
  updateBankDetails
} from './riderController.js';
import { protectFranchise, protectRider } from '../../shared/middleware/authMiddleware.js';
import { upload } from '../../shared/middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/auth/send-otp', sendOTP);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/login', riderLogin);
router.post('/auth/reset-password', resetPassword);
router.post('/kyc/update', upload.fields([
  { name: 'selfie', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 }
]), updateKYC);
router.post('/kyc/aadhaar/generate-otp', generateAadhaarOTP);
router.post('/kyc/aadhaar/verify-otp', verifyAadhaarOTP);
router.post('/auth/save-fcm-token', protectRider, saveFcmToken);
router.get('/profile/:phone', getRiderProfile);
router.post('/profile/attachment', uploadAttachment);
router.post('/profile/upload-documents', upload.fields([
  { name: 'selfie', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
]), uploadProfileDocuments);
router.post('/profile/bank-details', upload.fields([
  { name: 'attachment', maxCount: 1 }
]), updateBankDetails);
router.post('/wallet/add', addMoney);
router.post('/wallet/create-topup-order', createWalletTopUpOrder);
router.post('/wallet/verify-topup', verifyWalletTopUp);
router.post('/wallet/withdraw', requestWithdrawal);
router.get('/wallet/:phone', getWalletData);
router.get('/subscribers', protectFranchise, getSubscribersByFranchise);
router.get('/hubs', getActiveHubs);
router.get('/my-vehicle/:phone', getMyVehicle);
router.get('/plans', getRiderPlans);
router.post('/plans/save', saveRiderPlan);
router.post('/payments/create-order', createPaymentOrder);
router.post('/payments/verify', verifyPayment);
router.get('/payments/:phone', getRiderPayments);
router.post('/payments/wallet', payViaWallet);
router.post('/payments/qr-request', requestQRPayment);

router.post('/payments/deposit/wallet', payDepositViaWallet);
router.post('/payments/deposit/create-order', createDepositOrder);
router.post('/payments/deposit/verify', verifyDepositPayment);
router.post('/payments/deposit/qr-request', requestDepositQR);

router.post('/payments/add-off/create-order', createAddOffOrder);
router.post('/payments/add-off/verify', verifyAddOffPayment);

router.patch('/location', protectRider, updateRiderLocation);
router.post('/handover/request', protectRider, requestHandover);

router.get('/settings', getSettings);

export default router;
