import mongoose from 'mongoose';

const WebsitePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  cta: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WebsitePlan', WebsitePlanSchema);
