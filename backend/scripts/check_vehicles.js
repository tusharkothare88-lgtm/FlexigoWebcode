import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const vehicleSchema = new mongoose.Schema({
  plate: String,
  status: String
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function checkVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const vehicles = await Vehicle.find({}, 'plate status').limit(10);
    console.log('Recent Vehicles:');
    vehicles.forEach(v => console.log(`- Plate: "${v.plate}", Status: ${v.status}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkVehicles();
