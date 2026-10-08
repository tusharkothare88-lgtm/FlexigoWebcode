import express from 'express';
import { handleRazorpayWebhook } from './webhookController.js';

const router = express.Router();

router.post('/razorpay', handleRazorpayWebhook);

export default router;
