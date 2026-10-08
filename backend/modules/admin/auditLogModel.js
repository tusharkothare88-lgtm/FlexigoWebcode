import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  identity: { type: String, required: true },
  actionProfile: { type: String, required: true },
  objectTarget: { type: String, required: true },
  originIp: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
