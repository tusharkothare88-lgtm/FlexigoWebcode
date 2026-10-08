import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, LayoutDashboard, Building2, ShieldCheck, Play, Mic } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Import personas
import riderImage from '../../../assets/images/rider_persona.png';
import ownerImage from '../../../assets/images/owner_persona.png';

const PlatformCard = ({ role, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-3xl p-6 md:p-7 border border-slate-100 hover:border-flexigo-teal/20 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
         {role.icon}
      </div>

      {/* Icon Area */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-white mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg shadow-current/5",
        role.bgClass
      )}>
        {React.cloneElement(role.icon, { className: "w-4.5 h-4.5" })}
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-black font-heading text-flexigo-primary tracking-tight mb-1">
          {role.title}
        </h3>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {role.subtitle}
        </p>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">
        {role.description}
      </p>

      <div className="mt-auto space-y-4">
        {/* Compact Insight */}
        <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-colors">
           <div className={cn("w-1 h-1 rounded-full animate-pulse", role.bgClass)} />
           <p className="text-[10px] italic font-bold text-slate-500 truncate">
             "{role.insight}" — <span className="uppercase opacity-60 tracking-tighter">{role.author}</span>
           </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {role.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
              <ShieldCheck className={cn("w-3 h-3", role.textClass)} />
              {stat}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const PlatformEcosystemSection = () => {
  const roles = [
    {
      id: 'rider',
      title: 'The Rider',
      subtitle: 'Field Logistics',
      icon: <Smartphone />,
      description: 'Connected field intelligence for modern riders. Real-time safety and earning synchronization.',
      insight: 'The platform predicts.',
      author: 'Rahul S.',
      stats: ['99% Uptime', 'Instant Payouts'],
      bgClass: 'bg-flexigo-teal',
      textClass: 'text-flexigo-teal'
    },
    {
      id: 'franchise',
      title: 'The Hub Owner',
      subtitle: 'Asset Management',
      icon: <Building2 />,
      description: 'Managing industrial-scale battery movements with zero-latency operational software.',
      insight: 'Total control.',
      author: 'Anjali M.',
      stats: ['FMS Pro', 'live IoT'],
      bgClass: 'bg-emerald-600',
      textClass: 'text-emerald-600'
    },
    {
      id: 'admin',
      title: 'The Optimizer',
      subtitle: 'Data Intelligence',
      icon: <LayoutDashboard />,
      description: 'God-view neural analytics processing city energy flow in high-fidelity precision.',
      insight: 'Anticipate. Automate.',
      author: 'Sys Term',
      stats: ['Scaling', 'Telemetry'],
      bgClass: 'bg-green-600',
      textClass: 'text-green-600'
    }
  ];

  return (
    <section id="ecosystem" className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-flexigo-teal font-black uppercase tracking-[0.25em] text-[9px] mb-4"
            >
              Unified Ecosystem
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black font-heading text-flexigo-primary leading-[0.95] tracking-tighter"
            >
              The DNA <br /> of Movement.
            </motion.h2>
          </div>
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="max-w-xs md:pb-1"
          >
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Three distinct experiences, one unified technological pulse built for the future of urban mobility.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl">
           {roles.map((role, idx) => (
             <PlatformCard key={role.id} role={role} index={idx} />
           ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformEcosystemSection;
