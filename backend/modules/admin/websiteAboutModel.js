import mongoose from 'mongoose';

const WebsiteAboutSchema = new mongoose.Schema({
  mission: {
    type: String,
    required: true,
  },
  vision: {
    type: String,
    required: true,
  },
  // New Content Fields
  heroTag: { type: String, default: 'Our Story' },
  heroTitle: { type: String, default: "Powering India's Last-Mile Revolution" },
  heroDescription: { type: String, default: 'FlexiGo E-Mobility is a Pune-based EV subscription platform built for delivery professionals.' },
  whoWeAreTag: { type: String, default: 'Who We Are' },
  whoWeAreTitle: { type: String, default: 'Redefining How Delivery Partners Own Their Ride' },
  whoWeAreDescription1: { type: String, default: 'Founded in 2026 and headquartered at Krushna Avenue, Baner, Pune, FlexiGo E-Mobility was born out of a simple observation.' },
  whoWeAreDescription2: { type: String, default: 'We flipped the model. With FlexiGo, partners subscribe to a smart EV — we handle everything.' },
  addressTitle: { type: String, default: 'Headquartered in Pune' },
  addressContent: { type: String, default: "'Krushna Avenue', SR NO: 111/10, Baner Pune City, Pune (CB) — 411045, Maharashtra, India." },
  stats: {
    activeRiders: { type: String, default: '200+' },
    vehiclesDeployed: { type: String, default: '200+' },
    cities: { type: String, default: '2' },
  },
  values: [{
    title: String,
    desc: String,
    icon: String, // lucide icon name
    color: String,
  }],
  milestones: [{
    year: String,
    title: String,
    desc: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WebsiteAbout', WebsiteAboutSchema);
