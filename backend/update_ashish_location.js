import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import axios from 'axios';
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

const RiderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  lastLocation: {
    lat: Number,
    lng: Number,
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: Date
  }
}, { strict: false });

const Rider = mongoose.models.Rider || mongoose.model('Rider', RiderSchema);

const run = async () => {
  await connectDB();
  
  // Accept coordinates dynamically from command-line arguments (e.g., node update_ashish_location.js 18.5755 73.7745)
  // Fallback to Manipal Hospitals Baner coordinates if no arguments are provided
  const targetLat = process.argv[2] ? parseFloat(process.argv[2]) : 18.5755;
  const targetLng = process.argv[3] ? parseFloat(process.argv[3]) : 73.7745;
  
  let targetAddress = "Geocoding Fallback (Google API Offline)"; // Fallback if Google API call fails

  // Dynamically resolve address from coordinates using Google Maps Reverse Geocoding API
  try {
    console.log(`🌐 Calling Google Maps API dynamically to resolve address for coordinates: ${targetLat}, ${targetLng}...`);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${targetLat},${targetLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      targetAddress = response.data.results[0].formatted_address;
      console.log(`✅ Google Maps API returned dynamic address: "${targetAddress}"`);
    } else {
      console.log('⚠️ Google Geocoding API returned non-OK status or empty results, using fallback.');
    }
  } catch (geoError) {
    console.error('❌ Dynamic Geocoding failed, using fallback:', geoError.message);
  }

  console.log(`📡 Updating Ashish's location to ${targetLat}, ${targetLng}...`);

  // Update riders named Ashish to ensure correct test rider is updated
  const updateResult = await Rider.updateMany(
    { name: /Ashish/i },
    {
      $set: {
        lastLocation: {
          lat: targetLat,
          lng: targetLng,
          latitude: targetLat,
          longitude: targetLng,
          address: targetAddress,
          updatedAt: new Date()
        },
        currentSpeed: 0
      }
    }
  );

  console.log('✅ Update Result:', updateResult);

  // Fetch and confirm current state in MongoDB
  const updatedRiders = await Rider.find({ name: /Ashish/i });
  console.log('\n=== CURRENT DATABASE STATE ===');
  updatedRiders.forEach(r => {
    console.log({
      _id: r._id,
      name: r.name,
      phone: r.phone,
      lastLocation: r.lastLocation
    });
  });

  process.exit(0);
};

run();
