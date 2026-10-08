import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: {
    type: Object,
    default: {}
  },
  users: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
