import mongoose from 'mongoose';

const PartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.models.Part || mongoose.model('Part', PartSchema);
