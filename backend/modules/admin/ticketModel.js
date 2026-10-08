import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  entityName: { type: String, required: true },
  category: { type: String, enum: ['Wallet', 'Vehicle', 'Account', 'General'], default: 'General' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  slaTime: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
