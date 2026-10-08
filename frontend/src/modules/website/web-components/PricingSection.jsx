import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

const plans = [
  {
    id: 'daily',
    name: 'Daily Flex',
    price: 'TBA',
    duration: '/day',
    description: 'Perfect for part-time riders testing the waters.',
    features: [
      'Unlimited battery swaps',
      'Basic insurance coverage',
      '24/7 breakdown support',
      'Cancel anytime',
      'Standard Helmet included'
    ],
    recommended: false,
    buttonStyle: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
  },
  {
    id: 'weekly',
    name: 'Weekly Pro',
    price: 'TBA',
    duration: '/week',
    description: 'The sweet spot for regular gig workers.',
    features: [
      'Unlimited battery swaps',
      'Comprehensive insurance',
      'Priority 24/7 breakdown support',
      'Free weekly maintenance check',
      'Premium Helmet included'
    ],
    recommended: true,
    buttonStyle: 'bg-flexigo-primary text-white hover:bg-flexigo-teal shadow-[0_10px_30px_rgba(15,118,110,0.3)]'
  },
  {
    id: 'monthly',
    name: 'Monthly Power',
    price: 'TBA',
    duration: '/month',
    description: 'Maximum value for full-time delivery professionals.',
    features: [
      'Unlimited battery swaps',
      'Zero liability insurance',
      'VIP hub lane access',
      'Free monthly full-servicing',
      'Premium Helmet & Jacket included',
      '2 free days rollover'
    ],
    recommended: false,
    buttonStyle: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
  }
];

const PricingSection = () => {
  return (
    <section id="plans" className="py-24 lg:py-32 bg-slate-50 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
           <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold font-heading text-flexigo-primary leading-tight mb-6"
          >
            Transparent Plans. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-flexigo-teal to-flexigo-accent">Zero Hidden Fees.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            Pay only for what you need. All our plans include the vehicle, maintenance, and insurance. 
            No down payments, no lock-ins.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={cn(
                "relative flex flex-col w-full max-w-md bg-white rounded-3xl p-8 border transition-all duration-300",
                plan.recommended 
                  ? "border-flexigo-teal shadow-2xl shadow-flexigo-teal/10 lg:-translate-y-4" 
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
              )}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-flexigo-teal text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md z-10">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold font-heading text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                <div className="mt-6 flex items-baseline text-slate-900">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-slate-500 font-medium">{plan.duration}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                       <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-slate-600 text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={cn(
                "w-full py-4 rounded-xl font-medium tracking-wide transition-all duration-300",
                plan.buttonStyle,
                plan.recommended ? "hover:scale-105" : "hover:bg-slate-200 bg-slate-100 text-slate-800"
              )}>
                Select {plan.name}
              </button>

              {/* Tooltip info icon concept */}
              <div className="mt-4 flex justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-1 text-xs">
                  <Info className="w-3.5 h-3.5" /> Security deposit structure
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
