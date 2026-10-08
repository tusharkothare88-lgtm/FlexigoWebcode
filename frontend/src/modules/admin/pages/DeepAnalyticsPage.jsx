import React, { useState } from 'react';
import {
   BarChart3,
   TrendingUp,
   Activity,
   Zap,
   Signal,
   Search,
   Filter,
   MapPin,
   ArrowUpRight,
   ArrowRight,
   Globe,
   Monitor,
   LayoutGrid
} from 'lucide-react';
import {
   ResponsiveContainer,
   LineChart,
   Line,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
   BarChart,
   Bar,
   Cell
} from 'recharts';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];

export default function DeepAnalyticsPage() {
   const { networkStats, revenueData, fetchDashboardStats } = useAdminDataStore();
   const [activeSegment, setActiveSegment] = useState('predictive');
   const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchDashboardStats(newFilters);
      console.log('Deep Analytics Sync:', newFilters);
   };

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Deep <span className="text-emerald-500">Analytics</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Neural Engine & Predictive Delta
               </p>
            </div>

            <div className="flex items-center gap-2">
               <OpsFilter onFilterChange={handleFilterChange} />
            </div>
         </div>

         {/* Intelligence KPIs */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard title="Yield Projection" value={networkStats.yieldProjection || "₹0L"} icon={TrendingUp} color="emerald" subtitle="Predictive MTD" />
            <AdminStatCard title="Churn Delta" value={networkStats.churnDelta || "0%"} icon={Zap} color="blue" subtitle="Retention Index" />
            <AdminStatCard title="Node Load" value={networkStats.nodeLoad || "0%"} icon={Signal} color="emerald" subtitle="Cluster Sync" />
            <AdminStatCard title="Risk Scoring" value={networkStats.riskScoring || "0/100"} icon={Activity} color="emerald" subtitle="Grid Stability" />
         </div>

         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col border-t-4 border-t-emerald-600">
            <div className="absolute right-0 top-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
               <Globe size={100} strokeWidth={1} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10 border-b border-[var(--border-subtle)] pb-2">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     <BarChart3 size={16} />
                  </div>
                  <div>
                     <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Grid Demand Matrix</h3>
                     <p className="text-[7.5px] font-black text-emerald-600 uppercase mt-1 tracking-widest italic animate-pulse leading-none">Neural Cluster Registry v2.0</p>
                  </div>
               </div>
               <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] font-black text-emerald-500 uppercase italic">ALPHA_SYNC</div>
            </div>

            <div className="h-52 w-full relative z-10 mt-auto">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.3} />
                     <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 7, fontWeight: 900, textTransform: 'uppercase' }}
                        dy={8}
                     />
                     <YAxis hide />
                     <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: '#10b981' }}
                        labelStyle={{ fontSize: '8px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}
                     />
                     <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 4, strokeWidth: 0 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

      </div>
   );
}
