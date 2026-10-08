import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import './config/cloudinary.js';
import './shared/utils/firebase.js';
import riderRoutes from './modules/rider/riderRoutes.js';
import franchiseRoutes from './modules/franchise/franchiseRoutes.js';
import fleetRoutes from './modules/fleet/vehicleRoutes.js';
import staffRoutes from './modules/staff/staffRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import webhookRoutes from './modules/webhook/webhookRoutes.js';
import { seedDefaultAdmin } from './shared/utils/seedAdmin.js';
import { seedWebsiteData } from './modules/admin/websiteSeedController.js';
import { startPaymentDueCron } from './shared/utils/paymentDueCron.js';
import Rider from './modules/rider/riderModel.js';
import Vehicle from './modules/fleet/vehicleModel.js';


// Load env vars
dotenv.config();

// DNS Servers setup (Commented out to fix ENOTFOUND issues)
// dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Check Surepass Config
if (process.env.SUREPASS_API_KEY) {
  console.log('✅ Surepass eKYC Configured');
} else {
  console.log('❌ Surepass eKYC Not Configured');
}

// Check SMS Hub Config
if (process.env.SMSINDIAHUB_API_KEY) {
  console.log('✅ SMS Hub India Configured');
} else {
  console.log('❌ SMS Hub India Not Configured');
}

// Connect to database
connectDB().then(async () => {
  seedDefaultAdmin();
  seedWebsiteData();
  startPaymentDueCron();
  
  try {
    const riders = await Rider.find({ franchise: { $ne: null }, vehicleId: { $ne: null } });
    let updatedCount = 0;
    for (const rider of riders) {
      const vehicle = await Vehicle.findById(rider.vehicleId);
      if (vehicle && String(vehicle.franchise) !== String(rider.franchise)) {
        vehicle.franchise = rider.franchise;
        await vehicle.save();
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`✅ Synced franchise for ${updatedCount} vehicles based on assigned riders.`);
    }
  } catch (err) {
    console.error("Error syncing rider vehicle franchises:", err);
  }
});


const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    skip: function (req, res) {
      return req.originalUrl.includes('/api/v1/admin/geofencing') || req.originalUrl.includes('/api/v1/admin/notifications-feed');
    }
  }));
}

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Flexigo API',
    status: 'Running'
  });
});

// API Routes
app.use('/api/v1/rider', riderRoutes);
app.use('/api/v1/franchise', franchiseRoutes);
app.use('/api/v1/fleet', fleetRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhook', webhookRoutes);

// App Version Check — used by rider & franchise apps for force update
import AppVersion from './modules/admin/appVersionModel.js';
app.get('/api/v1/app-version', async (req, res) => {
  try {
    const platform = req.query.platform || 'rider';
    let record = await AppVersion.findOne({ platform });

    // Auto-seed if not exists
    if (!record) {
      record = await AppVersion.create({
        platform,
        version: '1.0.0',
        playStoreUrl: platform === 'rider'
          ? 'https://play.google.com/store/apps/details?id=com.flexigo.rider'
          : 'https://play.google.com/store/apps/details?id=com.flexigo.franchise',
        forceUpdate: true
      });
    }

    res.json({
      success: true,
      version: record.version,
      playStoreUrl: record.playStoreUrl,
      forceUpdate: record.forceUpdate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
