import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const id = "69fb2d8ae56b6ca6cf8e2265";
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const col of collections) {
      const doc = await mongoose.connection.db.collection(col.name).findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (doc) {
        console.log(`\nFound in collection: ${col.name}`);
        console.log(JSON.stringify(doc, null, 2));
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};
run();
