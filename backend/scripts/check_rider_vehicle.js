import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const riderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  vehicleId: mongoose.Schema.Types.ObjectId
});

const vehicleSchema = new mongoose.Schema({
  plate: String,
  status: String
});

const Rider = mongoose.model('Rider', riderSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function checkRiderVehicle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const rider = await Rider.findOne({ phone: '9922968093' });
    if (!rider) {
      console.log('Rider not found');
      process.exit(0);
    }

    console.log(`Rider: ${rider.name}, VehicleID: ${rider.vehicleId || 'None'}`);
    
    if (rider.vehicleId) {
      const vehicle = await Vehicle.findById(rider.vehicleId);
      console.log(`Assigned Vehicle Plate: ${vehicle ? vehicle.plate : 'Vehicle Object Missing'}`);
    } else {
      console.log('No vehicle assigned to this rider in the Rider document.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRiderVehicle();
