import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CreditCard, Bike } from 'lucide-react';

const steps = [
  {
    icon: <UserCheck className="w-8 h-8 text-flexigo-teal" />,
    title: 'Register & Verify',
    description: 'Download the app, complete KYC, and get approved in minutes. No complex paperwork.',
    color: 'bg-orange-50',
  },
  {
    icon: <CreditCard className="w-8 h-8 text-flexigo-teal" />,
    title: 'Subscribe & Pay',
    description: 'Choose a daily, weekly, or monthly plan. All maintenance and insurance covered.',
    color: 'bg-orange-50',
  },
  {
    icon: <Bike className="w-8 h-8 text-flexigo-accent" />,
    title: 'Ride & Earn',
    description: 'Pick up your EV from the nearest hub and start delivering immediately.',
    color: 'bg-orange-100',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-flexigo-teal font-medium uppercase tracking-wider mb-4"
          >
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading text-flexigo-primary leading-tight"
          >
            Start your journey in <br className="hidden md:block" />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-flexigo-primary to-flexigo-teal">3 simple steps</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0 text-center">
            {/* Animated dashed line overlay */}
            <svg width="100%" height="2" className="absolute inset-0">
               <line x1="0" y1="1" x2="100%" y2="1" stroke="#F97316" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_60s_linear_infinite] opacity-30"/>
            </svg>
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className={`w-28 h-28 rounded-full ${step.color} flex items-center justify-center mb-8 border border-white shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                   {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-800 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-[280px]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Note: add simple CSS keyframes for line dash if needed, or rely on Tailwind utility via CSS */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
