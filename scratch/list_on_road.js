import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const VehicleSchema = new mongoose.Schema({
  plate: String,
  status: String,
  model: String
}, { strict: false });

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

async function findOnRoadVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Finding vehicles that are 'assigned' or 'in-transit'
    const onRoadVehicles = await Vehicle.find({
      status: { $in: ['assigned', 'in-transit'] }
    }).select('plate status model');

    console.log(`\nFound ${onRoadVehicles.length} vehicles "On Road":`);
    console.log('-------------------------------------------');
    onRoadVehicles.forEach((v, i) => {
      console.log(`${i + 1}. Plate: ${v.plate} | Status: ${v.status} | Model: ${v.model || 'N/A'}`);
    });
    console.log('-------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findOnRoadVehicles();
