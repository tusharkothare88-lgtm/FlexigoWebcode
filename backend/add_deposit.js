import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import Rider from './modules/rider/riderModel.js';
import Transaction from './modules/rider/transactionModel.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  const riderId = new mongoose.Types.ObjectId('6a315422a382df60f4b83b8b');
  const amount = 2800;

  // 1. Create Transaction
  const txn = new Transaction({
    riderId,
    amount,
    type: 'credit',
    status: 'success',
    description: 'Added to wallet',
    method: 'razorpay',
    createdAt: new Date('2026-06-16T13:54:00.000Z') // 7:24 PM IST
  });

  await txn.save();
  console.log('Transaction created:', txn);

  // 2. Update Wallet Balance
  const rider = await Rider.findByIdAndUpdate(riderId, {
    $inc: { walletBalance: amount },
    $set: { depositPaid: true }
  }, { new: true });

  console.log('Rider updated:', rider.name, rider.walletBalance);

  process.exit(0);
};

run();
