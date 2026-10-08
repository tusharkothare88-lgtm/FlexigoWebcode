import mongoose from 'mongoose';

const AppVersionSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['rider', 'franchise'],
    required: true,
    unique: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  playStoreUrl: {
    type: String,
    default: ''
  },
  forceUpdate: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AppVersion', AppVersionSchema);
