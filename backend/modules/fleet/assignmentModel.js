import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  hubName: {
    type: String,
    default: 'Main Hub'
  },
  type: {
    type: String,
    enum: ['QR Scan', 'Manual'],
    default: 'QR Scan'
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
});

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
