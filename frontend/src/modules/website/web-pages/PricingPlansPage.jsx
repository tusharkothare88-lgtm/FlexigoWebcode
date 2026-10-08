import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, HelpCircle } from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../lib/axios';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const plans = [
  {
    name: 'Daily Pass',
    price: '₹149',
    period: 'per day',
    desc: 'Perfect for part-time delivery executives or checking out our performance.',
    features: [
      'Unlimited battery swaps',
      'Zero maintenance charge',
      'Fully comprehensive insurance',
      'Standard 85km range battery',
      'Real-time GPS security',
    ],
    popular: false,
    cta: 'Rent for Today',
  },
  {
    name: 'Weekly Saver',
    price: '₹949',
    period: 'per week',
    desc: 'Our most balanced plan for professional gig workers looking to maximize profits.',
    features: [
      'Unlimited battery swaps',
      'Zero maintenance charge',
      'Fully comprehensive insurance',
      'Standard 85km range battery',
      'Real-time GPS security',
      'Priority backup swap hubs',
      'No deposit needed',
    ],
    popular: true,
    cta: 'Subscribe Weekly',
  },
  {
    name: 'Monthly Pro',
    price: '₹3,499',
    period: 'per month',
    desc: 'Designed for full-time courier executives with maximum cost-efficiency.',
    features: [
      'Unlimited battery swaps',
      'Zero maintenance charge',
      'Fully comprehensive insurance',
      'Standard 85km range battery',
      'Real-time GPS security',
      'Priority backup swap hubs',
      'No deposit needed',
      'Dedicated 24/7 technical help desk',
      'One free companion rider pass',
    ],
    popular: false,
    cta: 'Subscribe Monthly',
  },
];

const PricingPlansPage = () => {
  const [livePlans, setLivePlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/admin/web/plans');
        if (res.data.success && res.data.plans.length > 0) {
          setLivePlans(res.data.plans);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, []);

  const displayPlans = livePlans.length > 0 ? livePlans : plans;

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
      <section className="relative bg-flexigo-dark overflow-hidden py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-flexigo-primary to-flexigo-dark opacity-95" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-flexigo-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Subscription Plans</p>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4">
            Maximize Earnings, <span className="text-flexigo-teal italic">Eliminate Upfront Cost</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Flexible pricing options with zero maintenance, zero deposit, and unlimited battery swaps.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayPlans.map((plan, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 border ${
                  plan.popular ? 'border-flexigo-teal shadow-xl shadow-flexigo-teal/5 scale-105 z-10' : 'border-slate-100 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-flexigo-teal text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" /> Recommended
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-heading text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed min-h-[40px]">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black font-heading text-slate-800">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-flexigo-teal shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    plan.popular
                      ? 'bg-flexigo-primary hover:bg-flexigo-teal text-white shadow-lg'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
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

export default PricingPlansPage;
