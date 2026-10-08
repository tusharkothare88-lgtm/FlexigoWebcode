import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './modules/rider/transactionModel.js';
import Rider from './modules/rider/riderModel.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const updates = [
      {
        id: '6a293fcfb29c6478b53061c4', // Shaikh Asif Shaikh Kalu
        createdAt: new Date('2026-06-10T16:13:00+05:30')
      },
      {
        id: '6a294511b29c6478b53061c6', // Nitin Vijay Langote
        createdAt: new Date('2026-06-10T16:35:00+05:30')
      }
    ];

    for (const info of updates) {
      // 1. Update the Transaction
      const txn = await Transaction.findOne({
        riderId: info.id,
        method: 'razorpay',
        status: 'success',
        amount: 2800
      }).sort({ createdAt: -1 });

      if (txn) {
        txn.description = 'Security Deposit';
        txn.createdAt = info.createdAt;
        await txn.save();
        console.log(`✅ Updated transaction for rider ${info.id}`);
      } else {
        console.log(`❌ Transaction not found for rider ${info.id}`);
      }

      // 2. Update the Rider to show Deposit Badge
      const rider = await Rider.findById(info.id);
      if (rider) {
        rider.depositPaid = true;
        rider.depositAmount = 2800;
        await rider.save();
        console.log(`✅ Set deposit badge for rider ${info.id}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
};

run();
