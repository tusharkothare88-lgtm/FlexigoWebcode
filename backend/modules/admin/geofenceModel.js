import mongoose from 'mongoose';

const GeofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inclusion', 'exclusion', 'speed-cap'],
    default: 'inclusion'
  },
  radius: {
    type: String,
    default: '1.0km'
  },
  center: {
    lat: { type: Number, required: true, default: 28.6139 },
    lng: { type: Number, required: true, default: 77.2090 }
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  alerts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Geofence || mongoose.model('Geofence', GeofenceSchema);
