import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  upiId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String, // UTR or Ref number entered by Admin
    default: ''
  },
  processedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
