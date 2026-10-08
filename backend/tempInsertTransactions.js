import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rider from './modules/rider/riderModel.js';
import SubscriptionPlan from './modules/admin/subscriptionPlanModel.js';
import Transaction from './modules/rider/transactionModel.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const ridersToUpdate = [
      { id: '6a293fcfb29c6478b53061c4', amount: 2800, planId: '6a20ee6234bc40ba8e4bc091' },
      { id: '6a294511b29c6478b53061c6', amount: 2800, planId: '6a20ee6234bc40ba8e4bc091' }
    ];
    
    for (const info of ridersToUpdate) {
      const rider = await Rider.findById(info.id);
      
      if (rider) {
        console.log(`Processing Rider: ${rider.name || rider.phone}`);
        
        // 1. Update Rider Subscription to Active
        const expiresAt = new Date(Date.now() + 604800000); // +7 days for weekly plan
        rider.status = 'active';
        rider.subscriptionPlan = info.planId;
        rider.subscriptionStart = new Date();
        rider.subscriptionEnd = expiresAt;
        await rider.save();
        console.log(`- Rider plan updated to active`);

        // 2. Check and Create Transaction
        const existingTxn = await Transaction.findOne({
          riderId: rider._id,
          method: 'razorpay',
          status: 'success',
          amount: info.amount
        });

        if (!existingTxn) {
          await Transaction.create({
            riderId: rider._id,
            amount: info.amount,
            type: 'debit',
            status: 'success',
            description: `Plan Upgrade: Weekly Rent`,
            method: 'razorpay',
            planId: info.planId
          });
          console.log(`✅ Transaction added for ${rider.phone}`);
        } else {
          console.log(`⚠️ Transaction already exists for ${rider.phone}`);
        }
      } else {
        console.log(`❌ Rider not found with ID: ${info.id}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
};

run();
