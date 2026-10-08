import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlexigoStaff',
    required: true
  },
  weekKey: {
    type: String, // format: "YYYY-Www" e.g., "2024-W17"
    required: true
  },
  days: {
    type: [String], // Array of 5 statuses: ['present', 'absent', 'half-day', ...]
    default: ['present', 'present', 'present', 'present', 'present']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one record per staff per week
AttendanceSchema.index({ staffId: 1, weekKey: 1 }, { unique: true });

export default mongoose.models.FlexigoAttendance || mongoose.model('FlexigoAttendance', AttendanceSchema);
