import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const VehicleSchema = new mongoose.Schema({ plate: String, status: String });
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

const AssignmentSchema = new mongoose.Schema({ vehicle: mongoose.Schema.Types.ObjectId, rider: mongoose.Schema.Types.ObjectId, status: String });
const Assignment = mongoose.model('Assignment', AssignmentSchema);

const RiderSchema = new mongoose.Schema({ name: String, phone: String });
const Rider = mongoose.model('Rider', RiderSchema);

const checkData = async () => {
  await connectDB();

  const vehicles = await Vehicle.find({ plate: { $in: ['KA 03 CJ 1331', '2323'] } });
  console.log('\n--- Vehicles ---');
  console.log(vehicles);

  for (const v of vehicles) {
    const assignments = await Assignment.find({ vehicle: v._id }).populate('rider');
    console.log(`\n--- Assignments for ${v.plate} ---`);
    console.log(assignments);
  }

  const allAssignments = await Assignment.countDocuments();
  console.log(`\nTotal Assignments in DB: ${allAssignments}`);

  process.exit();
};

checkData();
