import mongoose from 'mongoose';

const WebsitePressReleaseSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  link: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WebsitePressRelease', WebsitePressReleaseSchema);
