import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Franchise from './modules/franchise/franchiseModel.js';
import FranchiseNotification from './modules/franchise/franchiseNotificationModel.js';

dotenv.config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const franchise = await Franchise.findOne().sort('-createdAt');
    if (!franchise) {
      console.log('No franchise found');
      return;
    }

    console.log(`Seeding notifications for Franchise: ${franchise.hubName} (${franchise._id})`);

    const notifications = [
      {
        franchiseId: franchise._id,
        title: 'System Initialized',
        message: `Welcome to Flexigo! Your hub ${franchise.hubName} is now active in the network.`,
        severity: 'success',
      },
      {
        franchiseId: franchise._id,
        title: 'Low Battery Alert',
        message: 'Vehicle KA-05-EV-9012 battery below 15% SOC. Requires immediate charging.',
        severity: 'danger',
      },
      {
        franchiseId: franchise._id,
        title: 'New Subscriber Assigned',
        message: 'A new rider has been assigned to your hub. Please prepare for handover.',
        severity: 'info',
      }
    ];

    await FranchiseNotification.deleteMany({ franchiseId: franchise._id });
    await FranchiseNotification.insertMany(notifications);

    console.log('Notifications seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
