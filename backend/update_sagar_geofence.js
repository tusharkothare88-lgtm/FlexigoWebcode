import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Force DNS servers to resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

const GeofenceSchema = new mongoose.Schema({
  name: String,
  type: String,
  radius: String,
  center: {
    lat: Number,
    lng: Number
  },
  riderId: mongoose.Schema.Types.ObjectId,
  status: String,
  alerts: Number
}, { strict: false });

const Geofence = mongoose.models.Geofence || mongoose.model('Geofence', GeofenceSchema);

const run = async () => {
  await connectDB();

  // Sagar Kher's rider ID: 6a0433350f6d7f3694e231ac
  const sagarRiderId = new mongoose.Types.ObjectId('6a0433350f6d7f3694e231ac');

  // Indore center coordinates (Choti Gwaltoli): 22.7166, 75.8699
  const indoreLat = 22.7166;
  const indoreLng = 75.8699;

  console.log(`📡 Shifting Sagar Kher's geofence center to Indore (${indoreLat}, ${indoreLng})...`);

  // Find and update the geofence document for Sagar Kher
  const updateResult = await Geofence.findOneAndUpdate(
    { riderId: sagarRiderId },
    {
      $set: {
        name: 'INDORE',
        center: {
          lat: indoreLat,
          lng: indoreLng
        },
        radius: '22.4km',
        status: 'active',
        alerts: 0
      }
    },
    { new: true, upsert: true } // Creates it if it doesn't exist
  );

  console.log('✅ Geofence Update Result in MongoDB:', updateResult);
  console.log('\n=== CURRENT DATABASE STATE ===');
  console.log({
    _id: updateResult._id,
    name: updateResult.name,
    riderId: updateResult.riderId,
    center: updateResult.center,
    radius: updateResult.radius,
    status: updateResult.status
  });

  process.exit(0);
};

run();
