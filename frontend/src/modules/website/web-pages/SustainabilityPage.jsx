import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Zap, Globe, ShieldCheck, Heart, Award } from 'lucide-react';
import logo from '../../../assets/logo.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const pillars = [
  {
    icon: <Leaf className="w-6 h-6 text-flexigo-teal" />,
    title: 'Zero Tailpipe Emissions',
    desc: 'Each FlexiGo scooter is 100% electric, replacing highly polluting 100cc-150cc petrol-powered delivery bikes. This translates directly to cleaner air in our cities.',
  },
  {
    icon: <Globe className="w-6 h-6 text-flexigo-teal" />,
    title: 'Battery Circularity & Recycling',
    desc: 'We manage battery lifecycles responsibly. At end-of-life (below 70% state of health), batteries are transitioned to second-life energy storage applications, then safely recycled.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-flexigo-teal" />,
    title: 'Green Grid Integration',
    desc: 'We are actively working with energy providers to power our battery swapping and franchise charging hubs using rooftop solar and renewable electricity.',
  },
];

const impacts = [
  { metric: '200+', label: 'Zero-Emission Vehicles' },
  { metric: '300,000+', label: 'Clean Kilometers Ridden' },
  { metric: '15+ Tons', label: 'CO2 Emissions Prevented' },
  { metric: '12,000+ Liters', label: 'Petrol Displacement' },
];

const SustainabilityPage = () => {
  return (
    <div className="landing-page-theme min-h-screen bg-white font-body text-slate-800 antialiased">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-flexigo-teal transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-slate-200">|</span>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="FlexiGo" className="w-10 h-10 object-contain" />
            <span className="font-heading font-black text-flexigo-primary uppercase tracking-tighter text-lg">
              Flex<span className="text-flexigo-teal">igo E-Mobility</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-flexigo-dark overflow-hidden py-28 lg:py-36">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#052E16_0%,#14532D_70%,#1C1C1C_100%)] opacity-95" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flexigo-teal/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6">
            <Leaf className="w-4 h-4 text-flexigo-teal animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Our Environmental Impact</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-heading text-white leading-[1.1] tracking-tighter mb-8"
          >
            Sustaining Our Cities,
            <br />
            <span className="text-flexigo-teal italic">Protecting Our Future</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            FlexiGo E-Mobility is dedicated to driving a 100% green last-mile ecosystem.
            By removing fossil-fuel dependence, we contribute directly to India’s Net Zero goals.
          </motion.p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-flexigo-primary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {impacts.map((imp, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl md:text-5xl font-black font-heading text-flexigo-teal mb-2">{imp.metric}</div>
                <div className="text-xs md:text-sm text-slate-300 font-medium">{imp.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainable pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Commitment</p>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary tracking-tighter mb-4">
              The Three Pillars of Our Green Operations
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="p-8 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 flex items-center justify-center mb-6">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800 mb-3">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earth Hero */}
      <section className="py-20 bg-flexigo-teal/5 border-y border-flexigo-teal/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <Award className="w-12 h-12 text-flexigo-teal mx-auto mb-6" />
            <h2 className="text-3xl font-black font-heading text-flexigo-primary tracking-tighter mb-4">
              Pune Green Delivery Initiative
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our e-scooters are actively utilized by delivery partners for Swiggy, Zomato, Zepto, and BigBasket. By providing these partners with affordable EV subscriptions, we are transforming commercial delivery in Pune into a silent, eco-friendly operation.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="bg-flexigo-dark border-t border-white/5 py-8 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Flexigo E-Mobility Pvt. Ltd. All rights reserved.</p>
        <div className="flex gap-6 justify-center mt-3 text-sm">
          <Link to="/privacy-policy" className="text-slate-500 hover:text-flexigo-teal transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-slate-500 hover:text-flexigo-teal transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;
