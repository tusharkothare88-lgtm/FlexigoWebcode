import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://flexigo:flexigo@cluster0.mongodb.net/test?retryWrites=true&w=majority');

    const T = (await import('./modules/franchise/franchiseTransactionModel.js')).default;
    const docs = await T.find().sort('-date').limit(5);
    console.log('FranchiseTxns:', docs);

    const R = (await import('./modules/rider/transactionModel.js')).default;
    const rDocs = await R.find().sort('-createdAt').limit(5);
    console.log('RiderTxns:', rDocs);

    const Rider = (await import('./modules/rider/riderModel.js')).default;
    const rider = await Rider.findOne().sort('-createdAt');
    console.log('Latest Rider:', rider);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();
