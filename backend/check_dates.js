import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rider from './modules/rider/riderModel.js';
import Transaction from './modules/rider/transactionModel.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const riders = await Rider.find({ name: { $in: ['Sanoj Yadav', 'Mukund Uddhav Surwase', 'Akshay Ramdas Rathod'] } });
    
    for (const rider of riders) {
        console.log(`Name: ${rider.name}`);
        console.log(`adminAssignedStartDate: ${rider.adminAssignedStartDate}`);
        console.log(`subscriptionPlan: ${rider.subscriptionPlan}`);
        
        const txns = await Transaction.find({ riderId: rider._id, status: 'success' });
        console.log(`Recent Success Txns count: ${txns.length}`);
        if(txns.length > 0) {
            console.log(`Latest Txn Date: ${txns[txns.length-1].createdAt}`);
        }
        console.log('---');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();
