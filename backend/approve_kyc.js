import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const RiderSchema = new mongoose.Schema({
  kycStatus: String
});

const FranchiseSchema = new mongoose.Schema({
  kycStatus: String
});

const Rider = mongoose.model('Rider', RiderSchema);
const Franchise = mongoose.model('Franchise', FranchiseSchema);

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(uri);
    console.log('Connected to DB');

    const riderResult = await Rider.updateMany(
      { kycStatus: 'pending' },
      { $set: { kycStatus: 'approved' } }
    );
    console.log(`Updated ${riderResult.modifiedCount} riders to approved`);

    const franchiseResult = await Franchise.updateMany(
      { kycStatus: 'pending' },
      { $set: { kycStatus: 'approved' } }
    );
    console.log(`Updated ${franchiseResult.modifiedCount} franchises to approved`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
