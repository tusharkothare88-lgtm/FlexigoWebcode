import mongoose from 'mongoose';

const WebsiteContactInfoSchema = new mongoose.Schema({
  email: { type: String, default: 'info@flexigo.in' },
  phone: { type: String, default: '+91 91722 03808' },
  address: { type: String, default: "'Krushna Avenue', SR NO: 111/10, Baner Pune City, Pune (CB) — 411045, Maharashtra, India." },
  workingHours: { type: String, default: 'Mon - Sat: 10:00 AM - 7:00 PM' },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/flexigo' },
    linkedin: { type: String, default: 'https://linkedin.com/company/flexigo' },
    twitter: { type: String, default: 'https://twitter.com/flexigo' }
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('WebsiteContactInfo', WebsiteContactInfoSchema);
