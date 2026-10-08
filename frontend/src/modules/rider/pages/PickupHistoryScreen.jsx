import React from 'react';
import { motion } from 'framer-motion';
import {
  History,
  MapPin,
  TrendingUp,
  Zap,
  ChevronRight,
  Calendar,
  IndianRupee,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { useThemeStore } from '../store/themeStore';

const mockHistory = [
  {
    id: 'SUB-9921',
    planName: 'Weekly Professional',
    pickupDate: '24 Mar, 2026',
    hub: 'FlexiHub Koramangala',
    distance: 482,
    cost: 1450,
    savings: 964,
    status: 'Completed'
  },
  {
    id: 'SUB-9810',
    planName: 'Monthly Delivery Pro',
    pickupDate: '20 Feb, 2026',
    hub: 'HSR Layout Power Station',
    distance: 1840,
    cost: 4200,
    savings: 3680,
    status: 'Completed'
  },
  {
    id: 'SUB-9501',
    planName: 'Daily Quick',
    pickupDate: '15 Feb, 2026',
    hub: 'Indiranagar Swap Point',
    distance: 42,
    cost: 250,
    savings: 84,
    status: 'Completed'
  }
];

export default function PickupHistoryScreen() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const totalSavings = mockHistory.reduce((acc, curr) => acc + curr.savings, 0);
  const totalDistance = mockHistory.reduce((acc, curr) => acc + curr.distance, 0);

  return (
    <PageWrapper className={`min-h-screen pb-24 ${isDark ? 'bg-[#0A1120]' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-20 bg-inherit/90 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}
        >
          <ChevronLeft size={20} className={isDark ? 'text-white' : 'text-slate-800'} />
        </button>
        <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>History & Savings</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="px-6 space-y-6 mt-4">
        {/* Savings Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-50/80 text-xs font-medium uppercase tracking-widest mb-1">
                <Zap size={14} fill="currentColor" /> Lifetime Savings
              </div>
              <div className="text-4xl font-black text-white flex items-baseline gap-1">
                <IndianRupee size={28} strokeWidth={3} />
                {totalSavings.toLocaleString()}
              </div>
              <p className="mt-4 text-emerald-50/70 text-[10px] leading-relaxed max-w-[80%] uppercase font-bold tracking-wider">
                Calculated based on {totalDistance}km traveled vs auto-rickshaw alternatives.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Past Pickups & Subscriptions
            </h3>
            <History size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
          </div>

          {mockHistory.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className={`p-4 border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.planName}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">
                      <Calendar size={12} /> {item.pickupDate}
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {item.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="text-[9px] uppercase font-black text-[var(--text-tertiary)] tracking-widest mb-1">Distance</div>
                    <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.distance} km</div>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="text-[9px] uppercase font-black text-[var(--text-tertiary)] tracking-widest mb-1">Cost</div>
                    <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{item.cost}</div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <TrendingUp size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Savings Profile</span>
                  </div>
                  <div className="text-[11px] font-black text-emerald-500 tracking-tighter">
                    + ₹{item.savings} Saved
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
                  <MapPin size={12} className="text-emerald-500" />
                  <span className="uppercase font-bold tracking-widest">{item.hub}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
