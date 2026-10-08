import mongoose from 'mongoose';

const FranchiseTransactionSchema = new mongoose.Schema({
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Subscription', 'Payout', 'Bonus', 'Penalty', 'Deposit'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'gateway', 'razorpay', 'upi', 'upi_qr', 'card', 'bank'],
    default: 'gateway'
  },
  subscriberName: String,
  description: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('FranchiseTransaction', FranchiseTransactionSchema);
