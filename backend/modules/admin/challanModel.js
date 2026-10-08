import mongoose from 'mongoose';

const ChallanSchema = new mongoose.Schema({
  challanId: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  issueType: { type: String, required: true },
  amount: { type: Number, required: true },
  rtoNode: { type: String, default: 'KA-01 (BLR)' },
  status: {
    type: String,
    enum: ['auto-paid', 'pending', 'disputed'],
    default: 'pending'
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Challan || mongoose.model('Challan', ChallanSchema);
