import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  
  const db = mongoose.connection.db;
  
  // 1. Fetch Sagar Kher Rider
  const rider = await db.collection('riders').findOne({ _id: new mongoose.Types.ObjectId('6a0433350f6d7f3694e231ac') });
  console.log('\n=== SAGAR KHER RIDER DOC ===');
  console.log(rider);

  // 2. Fetch Vehicle
  if (rider && rider.vehicleId) {
    const vehicle = await db.collection('vehicles').findOne({ _id: new mongoose.Types.ObjectId(rider.vehicleId) });
    console.log('\n=== ASSIGNED VEHICLE DOC ===');
    console.log(vehicle);
  }

  // 3. Fetch Assignments for Sagar Kher
  const assignmentsByRider = await db.collection('assignments').find({ rider: new mongoose.Types.ObjectId('6a0433350f6d7f3694e231ac') }).toArray();
  console.log('\n=== VEHICLE ASSIGNMENTS FOR THIS RIDER ===');
  console.log(assignmentsByRider);

  // 4. Fetch Assignments for this Vehicle
  if (rider && rider.vehicleId) {
    const assignmentsByVehicle = await db.collection('assignments').find({ vehicle: new mongoose.Types.ObjectId(rider.vehicleId) }).toArray();
    console.log('\n=== VEHICLE ASSIGNMENTS FOR THIS VEHICLE ===');
    console.log(assignmentsByVehicle);
  }

  process.exit(0);
};

run();
