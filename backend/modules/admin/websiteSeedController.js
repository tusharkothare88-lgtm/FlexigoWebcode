import WebsitePlan from './websitePlanModel.js';
import WebsiteAbout from './websiteAboutModel.js';
import WebsitePressRelease from './websitePressReleaseModel.js';
import WebsiteContactInfo from './websiteContactInfoModel.js';

export const seedWebsiteData = async () => {
  try {
    // 1. Seed Plans
    const planCount = await WebsitePlan.countDocuments();
    if (planCount === 0) {
      const defaultPlans = [
        {
          name: 'Daily Pass',
          price: '₹149',
          period: 'per day',
          desc: 'Perfect for part-time delivery executives or checking out our performance.',
          popular: false,
          cta: 'Rent for Today',
          features: ['Unlimited battery swaps', 'Zero maintenance charge', 'Fully comprehensive insurance', 'Standard 85km range battery', 'Real-time GPS security'],
          order: 1
        },
        {
          name: 'Weekly Saver',
          price: '₹949',
          period: 'per week',
          desc: 'Our most balanced plan for professional gig workers looking to maximize profits.',
          popular: true,
          cta: 'Subscribe Weekly',
          features: ['Unlimited battery swaps', 'Zero maintenance charge', 'Fully comprehensive insurance', 'Standard 85km range battery', 'Real-time GPS security', 'Priority backup swap hubs', 'No deposit needed'],
          order: 2
        },
        {
          name: 'Monthly Pro',
          price: '₹3,499',
          period: 'per month',
          desc: 'Designed for full-time courier executives with maximum cost-efficiency.',
          popular: false,
          cta: 'Subscribe Monthly',
          features: ['Unlimited battery swaps', 'Zero maintenance charge', 'Fully comprehensive insurance', 'Standard 85km range battery', 'Real-time GPS security', 'Priority backup swap hubs', 'No deposit needed', 'Dedicated 24/7 technical help desk', 'One free companion rider pass'],
          order: 3
        }
      ];
      await WebsitePlan.insertMany(defaultPlans);
      console.log('✅ Website Plans Seeded');
    }

    // 2. Seed About
    const aboutCount = await WebsiteAbout.countDocuments();
    if (aboutCount === 0) {
      const defaultAbout = {
        mission: 'To make electric vehicles accessible to every delivery professional in India through flexible, affordable subscription plans backed by world-class service.',
        vision: 'A zero-emission last-mile delivery ecosystem across India, powered by a tech-enabled franchise network.',
        heroTag: 'Our Story',
        heroTitle: "Powering India's Last-Mile Revolution",
        heroDescription: 'FlexiGo E-Mobility is a Pune-based EV subscription platform built for delivery professionals. We provide smart, zero-maintenance electric scooters through flexible plans — so partners earn more, spend less, and ride green.',
        whoWeAreTag: 'Who We Are',
        whoWeAreTitle: 'Redefining How Delivery Partners Own Their Ride',
        whoWeAreDescription1: 'Founded in 2026 and headquartered at Krushna Avenue, Baner, Pune, FlexiGo E-Mobility was born out of a simple observation: delivery partners were trapped paying high EMIs on depreciating petrol bikes while bearing all the risk of ownership.',
        whoWeAreDescription2: 'We flipped the model. With FlexiGo, partners subscribe to a smart EV — we handle everything from servicing and insurance to battery swaps and GPS tracking. Partners focus on earning; we handle the rest.',
        addressTitle: 'Headquartered in Pune',
        addressContent: "'Krushna Avenue', SR NO: 111/10, Baner Pune City, Pune (CB) — 411045, Maharashtra, India.",
        stats: { activeRiders: '200+', vehiclesDeployed: '200+', cities: '2' },
        values: [
          { title: 'Smart Mobility', desc: 'Cutting-edge tech for fleet ops.', icon: 'Zap', color: 'emerald' },
          { title: 'Zero Emissions', desc: '100% green energy future.', icon: 'Leaf', color: 'green' },
          { title: 'Zero Maintenance', desc: 'No more repair bills.', icon: 'Shield', color: 'blue' }
        ],
        milestones: [
          { year: '2026', title: 'Founded in Pune', desc: 'FlexiGo E-Mobility was incorporated in Baner, Pune.' },
          { year: 'May 2026', title: 'Full Tech Platform', desc: 'Released complete platform — Rider App, Franchise Panel, and Admin Dashboard.' }
        ]
      };
      await WebsiteAbout.create(defaultAbout);
      console.log('✅ Website About Seeded');
    }

    // 3. Seed Press Releases
    const pressCount = await WebsitePressRelease.countDocuments();
    if (pressCount === 0) {
      const defaultPress = [
        {
          date: 'May 2026',
          tag: 'Platform Launch',
          title: 'FlexiGo Launches Full Tech Platform',
          excerpt: 'FlexiGo E-Mobility announces the full launch of its integrated technology platform...',
          published: true,
          order: 1
        }
      ];
      await WebsitePressRelease.insertMany(defaultPress);
      console.log('✅ Website Press Seeded');
    }

    // 4. Seed Contact Info
    const contactCount = await WebsiteContactInfo.countDocuments();
    if (contactCount === 0) {
      const defaultContact = {
        email: 'info@flexigo.in',
        phone: '+91 91722 03808',
        address: "'Krushna Avenue', SR NO: 111/10, Baner Pune City, Pune (CB) — 411045, Maharashtra, India.",
        workingHours: 'Mon - Sat: 10:00 AM - 7:00 PM',
        socialLinks: {
          instagram: 'https://instagram.com/flexigo',
          linkedin: 'https://linkedin.com/company/flexigo',
          twitter: 'https://twitter.com/flexigo'
        }
      };
      await WebsiteContactInfo.create(defaultContact);
      console.log('✅ Website Contact Info Seeded');
    }

  } catch (error) {
    console.error('❌ Website Seeding Error:', error.message);
  }
};
