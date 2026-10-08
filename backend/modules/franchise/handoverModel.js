import mongoose from 'mongoose';

const HandoverSchema = new mongoose.Schema({
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
  },
  mode: {
    type: String,
    enum: ['dispatch', 'intake'],
    required: true,
  },

  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true,
  },

  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },

  photos: {
    front: String,
    back: String,
    left: String,
    right: String,
  },
  inspection: {
    body: Boolean,
    tires: Boolean,
    mirrors: Boolean,
    lights: Boolean,
    batteryCable: Boolean,
  },

  batteryLevel: Number,
  returnDate: Date,
  finalStatus: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Handover = mongoose.model('Handover', HandoverSchema);
export default Handover;
