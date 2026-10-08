import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ DB Connected');

const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));
const Rider = mongoose.model('Rider', new mongoose.Schema({}, { strict: false }));
const Assignment = mongoose.model('Assignment', new mongoose.Schema({}, { strict: false }));

// List ALL available vehicles so you can pick one for Ashish
const vehicles = await Vehicle.find({ status: { $in: ['available', null, ''] } }).select('plate model status franchise').lean();
console.log('\n=== AVAILABLE VEHICLES ===');
vehicles.forEach(v => {
  console.log({ _id: v._id, plate: v.plate, model: v.model, status: v.status });
});

// Also show Ashish's current info
const ashish = await Rider.findOne({ name: /Ashish/i }).lean();
console.log('\n=== ASHISH ===');
console.log({ _id: ashish?._id, name: ashish?.name, phone: ashish?.phone, vehicleId: ashish?.vehicleId });

// Check if any assignment already exists for Ashish
const existing = await Assignment.find({ rider: ashish?._id }).lean();
console.log('\n=== ASHISH EXISTING ASSIGNMENTS ===');
console.log(existing.length > 0 ? JSON.stringify(existing, null, 2) : 'None');

process.exit(0);
