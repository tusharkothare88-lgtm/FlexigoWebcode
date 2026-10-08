import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const VehicleSchema = new mongoose.Schema({}, { strict: false });
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

async function assignVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const targetFranchiseId = '69eb6920e8ab306fdf661654';

    // Find vehicles that are not assigned to this franchise and are in "GLOBAL FLEET" (or null)
    const vehiclesToAssign = await Vehicle.find({ 
      franchise: { $ne: new mongoose.Types.ObjectId(targetFranchiseId) } 
    }).limit(3);

    console.log(`Found ${vehiclesToAssign.length} vehicles to assign.`);

    for (const vehicle of vehiclesToAssign) {
      vehicle.franchise = new mongoose.Types.ObjectId(targetFranchiseId);
      await vehicle.save();
      console.log(`Assigned vehicle ${vehicle.plate} to franchise ${targetFranchiseId}`);
    }

    console.log('Operation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignVehicles();
