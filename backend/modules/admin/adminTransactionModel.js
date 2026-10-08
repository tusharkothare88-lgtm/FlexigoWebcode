import mongoose from 'mongoose';

const adminTransactionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  targetRider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider', // or Franchise if backend is shared
    default: null
  },
  targetType: {
    type: String,
    enum: ['Rider', 'Franchise', 'Adhoc', 'Self'],
    default: 'Self'
  },
  transactionId: {
    type: String
  },
  upiId: {
    type: String
  },
  phone: {
    type: String
  },
  barcodeUrl: {
    type: String
  },
  closingBalance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const AdminTransaction = mongoose.models.AdminTransaction || mongoose.model('AdminTransaction', adminTransactionSchema);

export default AdminTransaction;
