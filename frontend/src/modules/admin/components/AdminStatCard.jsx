import React from 'react';
import { motion } from 'framer-motion';

export default function AdminStatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'emerald',
  className = "",
  onClick
}) {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          <div className="space-y-1.5">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                {title}
             </span>
             <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{value}</h3>
                {trend && (
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                    trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                  }`}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                  </div>
                )}
             </div>
          </div>
          {subtitle && (
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
               {subtitle}
            </p>
          )}
        </div>

        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-600/20 ${colorMap[color]}`}>
           {Icon && <Icon size={16} strokeWidth={2.5} />}
        </div>
      </div>
    </div>
  );
}
