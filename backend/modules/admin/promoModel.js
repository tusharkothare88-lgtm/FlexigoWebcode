import mongoose from 'mongoose';

const PromoCampaignSchema = new mongoose.Schema({
  campaignId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  usageCount: { type: Number, default: 0 },
  targetNodes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.PromoCampaign || mongoose.model('PromoCampaign', PromoCampaignSchema);
