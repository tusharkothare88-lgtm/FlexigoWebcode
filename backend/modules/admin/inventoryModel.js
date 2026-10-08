import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 0 },
  minThreshold: { type: Number, default: 10 },
  supplier: { type: String },
  status: {
    type: String,
    enum: ['optimal', 'low-stock', 'out-of-stock'],
    default: 'optimal'
  },
  pricePerUnit: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
