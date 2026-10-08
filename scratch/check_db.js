import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rider from './backend/modules/rider/riderModel.js';

dotenv.config({ path: './backend/.env' });

async function checkRider(id) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const rider = await Rider.findById(id);
    if (rider) {
      console.log('Rider Found:', rider.name);
      console.log('KYC Details:', JSON.stringify(rider.kycDetails, null, 2));
    } else {
      console.log('Rider not found with ID:', id);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

const targetId = process.argv[2] || '6a0433350f6d7f3694e231ac';
checkRider(targetId);
