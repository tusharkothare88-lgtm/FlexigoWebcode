import mongoose from 'mongoose';

const VendorBillSchema = new mongoose.Schema({
  billId: { type: String, required: true, unique: true },
  supplier: { type: String, default: 'Internal' },
  vehicleNo: { type: String, required: true },
  chasisNo: { type: String, required: true },
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
  partsRepair: { type: String, required: true },
  riderName: { type: String },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.VendorBill || mongoose.model('VendorBill', VendorBillSchema);
