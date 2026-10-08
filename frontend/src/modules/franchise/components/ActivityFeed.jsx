import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  History, 
  Clock, 
  ArrowRight, 
  Zap, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

export default function ActivityFeed() {
  const activities = [
    { id: 1, type: 'return', title: 'EV Return Processed', description: 'KA-01-EF-1234 returned — subscription end', time: '2M AGO', icon: Zap, color: 'text-emerald-600 bg-emerald-600/10' },
    { id: 2, type: 'subscriber', title: 'Subscriber Onboarded', description: 'Rahul assigned Weekly Pro plan at Hub-01', time: '15M AGO', icon: Users, color: 'text-violet-600 bg-violet-600/10' },
    { id: 3, type: 'alert', title: 'Battery Critical', description: 'KA-EF-5678 at 15% SOC — charge required', time: '1H AGO', icon: Zap, color: 'text-rose-600 bg-rose-600/10' },
    { id: 4, type: 'fleet', title: 'Maintenance Queued', description: 'KA-EF-9012 flagged for scheduled service', time: '3H AGO', icon: Truck, color: 'text-amber-600 bg-amber-600/10' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] italic border-l-2 border-emerald-500 pl-2">LIVE_REGISTRY</h3>
          <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] opacity-40 ml-2 italic leading-none mt-1">REAL-TIME_HUB_OPERATIONS</p>
        </div>
        <button className="text-[7px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors italic shadow-inner">VIEW_ALL</button>
      </div>

      <div className="space-y-2 relative">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              className="flex gap-3 p-2.5 rounded-xl bg-[var(--bg-tertiary)]/10 border border-[var(--border-subtle)] hover:border-emerald-500/20 transition-all duration-300 group shadow-inner"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-subtle)] shadow-sm ${item.color} group-hover:scale-105 transition-transform duration-500`}>
                <Icon size={12} strokeWidth={3} />
              </div>
              <div className="flex-1 space-y-0.5">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors uppercase tracking-tight italic truncate">{item.title}</h4>
                    <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1 opacity-60 italic leading-none">
                      <Clock size={8} strokeWidth={3} /> {item.time}
                    </span>
                 </div>
                 <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-tight leading-none italic opacity-40 truncate">
                   {item.description}
                 </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
