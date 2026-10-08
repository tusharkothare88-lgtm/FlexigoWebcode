import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const VehicleSchema = new mongoose.Schema({
  plate: String,
  status: String
}, { strict: false });

const Vehicle = mongoose.model('VehicleTest', VehicleSchema, 'vehicles');

async function findOnRoadVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const onRoadVehicles = await Vehicle.find({
      status: { $in: ['assigned', 'in-transit'] }
    }).select('plate status');

    console.log(`\nFound ${onRoadVehicles.length} vehicles "On Road":`);
    onRoadVehicles.forEach((v, i) => {
      console.log(`${i + 1}. Plate: ${v.plate} | Status: ${v.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findOnRoadVehicles();
