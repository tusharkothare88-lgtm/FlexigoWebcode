import React from 'react';
import { motion } from 'framer-motion';
import { BatteryCharging, MapPin, Calendar, PenTool, Wallet, Network } from 'lucide-react';

const features = [
  {
    icon: <BatteryCharging className="w-6 h-6" />,
    title: 'Smart Battery Tracking',
    description: 'Monitor range, cell health, and charging status in real-time from your smartphone.',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Real-time GPS',
    description: 'Never lose track of your vehicle. Built-in GPS with anti-theft immobilization.',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Flexible Plans',
    description: 'Subscribe for a day, week, or month. Change plans anytime without penalties.',
  },
  {
    icon: <PenTool className="w-6 h-6" />,
    title: 'Zero Maintenance',
    description: 'We cover all servicing, wear and tear, and insurance. Just ride and earn.',
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: 'Wallet & Payments',
    description: 'Integrated digital wallet for seamless subscription renewals and top-ups.',
  },
  {
    icon: <Network className="w-6 h-6" />,
    title: 'Franchise Network',
    description: 'Growing nationwide network of hubs for quick battery swaps and servicing.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-[#F9FAFB] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Section */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4"
          >
            Why Choose Flexigo
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading text-flexigo-primary leading-[1.15] mb-6 tracking-tight"
          >
            Technology built for <br />
            <span className="text-slate-400">performance & scale</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 font-body leading-relaxed max-w-2xl"
          >
            Our hardware and software ecosystem is designed to maximize your earning potential while minimizing downtime.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-start group"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-flexigo-teal group-hover:border-flexigo-teal/30 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-800 mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-body">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
