import crypto from 'crypto';
import Transaction from '../rider/transactionModel.js';
import Rider from '../rider/riderModel.js';
import SubscriptionPlan from '../admin/subscriptionPlanModel.js';

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    
    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      console.log('Razorpay Webhook Verified:', req.body.event);
      
      const event = req.body.event;
      const payload = req.body.payload;
      
      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentEntity = payload.payment.entity;
        const notes = paymentEntity.notes || {};
        const paymentId = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        
        // 1. Check if we already processed this payment
        // (If the normal redirect flow succeeded, we'll find it here)
        // Note: verifyPayment stores transaction with method 'razorpay' and description including plan or something, 
        // but it doesn't currently store razorpay_payment_id in Transaction! 
        // We will need to check if we can prevent duplicates. 
        // To be safe, we check if the rider already has an active plan that matches, 
        // or we can add a simple check. If notes contain 'type', we process based on it.
        
        if (notes && notes.type) {
            // Wait, we need to make sure we don't double process.
            // Let's implement the logic for plan_upgrade and adhoc_payment based on notes.
            
            if (notes.type === 'plan_upgrade') {
                const phone = notes.phone;
                const planId = notes.planId;
                
                const rider = await Rider.findOne({ phone });
                if (!rider) return res.status(200).json({ status: 'ignored', reason: 'Rider not found' });
                
                // If rider is already active and the plan was applied recently, skip it.
                // A basic check to avoid double entry if it was just processed by verifyPayment
                const timeDiff = new Date() - new Date(rider.subscriptionStart);
                if (rider.status === 'active' && rider.subscriptionPlan.toString() === planId && timeDiff < 600000) {
                    return res.status(200).json({ status: 'ignored', reason: 'Already processed by frontend' });
                }
                
                // Otherwise, the frontend failed. Let's process it.
                const plan = await SubscriptionPlan.findById(planId);
                const durationMs = plan.type === 'Daily' ? 86400000 : plan.type === 'Weekly' ? 604800000 : 2592000000;
                const expiresAt = new Date(Date.now() + durationMs);

                const updatedRider = await Rider.findOneAndUpdate(
                  { phone }, 
                  { status: 'active', subscriptionPlan: plan._id, subscriptionStart: new Date(), subscriptionEnd: expiresAt }, 
                  { new: true }
                );

                await Transaction.create({
                  riderId: updatedRider._id,
                  amount: Number(paymentEntity.amount) / 100, // Webhook amount is in paise
                  type: 'debit',
                  status: 'success',
                  description: `Plan Upgrade (Webhook Recovery): ${plan.name}`,
                  method: 'razorpay',
                  planId: plan._id
                });
                console.log(`[Webhook] Recovered Plan Upgrade for ${phone}`);
                
            } else if (notes.type === 'add_off') {
                const phone = notes.phone;
                const rider = await Rider.findOne({ phone }).populate('franchise');
                if (!rider) return res.status(200).json({ status: 'ignored', reason: 'Rider not found' });

                // Add to addOff (assuming it's not already added, which is hard to check without a unique transaction id. 
                // We will add the orderId to description to ensure it's trackable)
                const amount = Number(paymentEntity.amount) / 100;
                
                // Prevent duplicate by checking recent transaction
                const recentTx = await Transaction.findOne({
                    riderId: rider._id,
                    description: { $regex: orderId }
                });
                if (recentTx) return res.status(200).json({ status: 'ignored', reason: 'Already processed' });

                rider.addOff = (rider.addOff || 0) + amount;
                await rider.save();

                await Transaction.create({
                  riderId: rider._id,
                  amount: amount,
                  type: 'credit',
                  status: 'success',
                  description: `Adhoc Payment (Webhook) - ${orderId}`,
                  method: 'razorpay'
                });
                console.log(`[Webhook] Recovered Adhoc Payment for ${phone}`);
            }
        }
      }
      
      // Always return 200 OK so Razorpay doesn't retry infinitely
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'error', reason: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
