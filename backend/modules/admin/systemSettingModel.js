import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  securityDepositAmount: {
    type: Number,
    required: true,
    default: 2800
  }
}, { timestamps: true });

export default mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);
