import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rider from './backend/modules/rider/riderModel.js';

dotenv.config({ path: './backend/.env' });

async function countRidersWithLocation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Rider.countDocuments({ lastLocation: { $exists: true, $ne: null } });
    console.log('Total Riders with Location:', count);
    const riders = await Rider.find({ lastLocation: { $exists: true, $ne: null } }).select('name phone');
    console.log('Riders List:', JSON.stringify(riders, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

countRidersWithLocation();
