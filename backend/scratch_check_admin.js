import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './modules/admin/adminModel.js';
import dns from 'dns';

// Fix for MongoDB Atlas SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();


const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await Admin.find({});
    console.log('--- Current Admins in DB ---');
    console.log(JSON.stringify(admins, null, 2));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAdmin();
