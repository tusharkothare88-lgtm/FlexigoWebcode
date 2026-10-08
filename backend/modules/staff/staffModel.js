import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Partner', 'Manager', 'Attendant'],
    default: 'Attendant',
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'terminated'],
    default: 'active',
  },
  permissions: {
    type: String,
    default: 'Intake, Logistics',
  },
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Staff', StaffSchema);
