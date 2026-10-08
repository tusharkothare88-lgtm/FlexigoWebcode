import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const VehicleSchema = new mongoose.Schema({ plate: String, status: String, model: String });
const Vehicle = mongoose.model('VehicleList', VehicleSchema, 'vehicles');

const checkOnRoad = async () => {
  await connectDB();
  
  const vehicles = await Vehicle.find({ status: { $in: ['assigned', 'in-transit'] } });
  
  console.log('START_OF_LIST');
  vehicles.forEach(v => {
    console.log(`PLATE:${v.plate}|STATUS:${v.status}|MODEL:${v.model || 'N/A'}`);
  });
  console.log('END_OF_LIST');

  process.exit();
};

checkOnRoad();
