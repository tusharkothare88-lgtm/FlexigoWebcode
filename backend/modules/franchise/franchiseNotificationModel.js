import mongoose from 'mongoose';

const franchiseNotificationSchema = new mongoose.Schema({
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'success', 'warning', 'danger'],
    default: 'info'
  },
  type: {
    type: String,
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const FranchiseNotification = mongoose.model('FranchiseNotification', franchiseNotificationSchema);
export default FranchiseNotification;
