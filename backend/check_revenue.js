import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const TransactionSchema = new mongoose.Schema({}, { strict: false });
const FranchiseTransaction = mongoose.model('FranchiseTransaction', TransactionSchema, 'franchisetransactions');
const RiderTransaction = mongoose.model('RiderTransaction', TransactionSchema, 'transactions');

async function checkRevenue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const frCount = await FranchiseTransaction.countDocuments({ status: { $in: ['completed', 'success'] } });
    const riderCount = await RiderTransaction.countDocuments({ status: { $in: ['completed', 'success'] } });
    
    console.log(`\nFound ${frCount} Completed Franchise Transactions`);
    console.log(`Found ${riderCount} Successful Rider Transactions\n`);
    
    if (frCount > 0) {
      const latestFr = await FranchiseTransaction.find({ status: { $in: ['completed', 'success'] } }).sort({ date: -1 }).limit(1);
      console.log('Latest Franchise Payment Date:', latestFr[0].date);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRevenue();
