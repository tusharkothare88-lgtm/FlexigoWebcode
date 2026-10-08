import mongoose from 'mongoose';

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Franchise'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  target: {
    type: String,
    enum: ['Rider', 'Franchise'],
    default: 'Rider',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
