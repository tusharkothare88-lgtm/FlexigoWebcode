import React from 'react';
import { motion } from 'framer-motion';

export default function AdminChartCard({ 
  title, 
  subtitle, 
  children, 
  className = "" 
}) {
  return (
    <div
      className={`p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-sm relative overflow-hidden group ${className}`}
    >
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-500 rounded-full" />
               <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider ml-3">
                 {subtitle}
              </p>
            )}
         </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-64 relative z-10">
         {children}
      </div>
    </div>
  );
}
