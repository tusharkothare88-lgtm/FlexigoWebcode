import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
   Zap,
   Activity,
   Users,
   Warehouse,
   TrendingUp,
   ShieldCheck,
   Signal,
   ArrowUpRight,
   Globe,
   ChevronRight,
   MapPin
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
   PieChart,
   Pie,
   Cell
} from 'recharts';
import { useAdminDataStore } from '../store/adminDataStore';

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
   const {
      networkStats,
      hubs,
      revenueData,
      fleetDistribution,
      fetchDashboardStats,
      fetchHubs,
      fetchDistribution
   } = useAdminDataStore();

   const navigate = useNavigate();

   const [activeFilters, setActiveFilters] = React.useState({
      range: 'Last 7 Days',
      metrics: {}
   });

   React.useEffect(() => {
      fetchDashboardStats(activeFilters);
      fetchHubs(activeFilters);
      fetchDistribution(activeFilters);
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchDashboardStats(newFilters);
      fetchHubs(newFilters);
      fetchDistribution(newFilters);
      console.log('Syncing Filters:', newFilters);
   };


   const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
         return (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xl backdrop-blur-md">
               <p className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1 tracking-wider">{label}</p>
               <p className="text-sm font-bold text-emerald-500 tracking-tight">₹{(payload[0].value || 0).toLocaleString('en-IN')}</p>
               <p className="text-sm font-bold text-emerald-500 tracking-tight">₹{(payload[0].value || 0).toLocaleString('en-IN')}</p>
            </div>
         );
      }
      return null;
   };

   return (
      <div className="space-y-6 pb-12">
         {/* Dashboard Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Admin <span className="text-emerald-500">Dashboard</span>
                  </h1>
               </div>
               <div className="flex items-center gap-3 ml-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                     Flexigo Ops Hub
                  </p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] font-black text-emerald-500 uppercase">
                     <Signal size={8} /> System Online
                  </div>
                  <button
                     onClick={() => alert("SYSTEM FLUSH: SUCCESS")}
                     className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded text-[7px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                  >
                     <Zap size={8} fill="currentColor" /> Flush
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <OpsFilter onFilterChange={handleFilterChange} />

            </div>
         </div>

         {/* Primary KPIs */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard onClick={() => navigate('/admin/financials')} title="Revenue" value={`₹${(networkStats.grossRevenue || 0).toLocaleString('en-IN')}`} trend="up" trendValue={networkStats.revenueTrend || "+0%"} icon={Zap} color="emerald" subtitle="Monthly Earnings" />
            <AdminStatCard onClick={() => navigate('/admin/subscribers')} title="Total Riders" value={networkStats.activeFleet || 0} trend="up" trendValue="+0%" icon={Activity} color="blue" subtitle="Active Vehicles" />
            <AdminStatCard onClick={() => navigate('/admin/hubs')} title="Total Franchises" value={networkStats.totalHubs || 0} icon={Warehouse} color="emerald" subtitle="Operational" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <TrendingUp size={100} />
               </div>

               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <TrendingUp size={16} />
                     </div>
                     <div>
                        <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">Revenue Breakdown</h3>
                        <p className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase mt-0.5">Performance trends over time</p>
                     </div>
                  </div>
               </div>

               <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueData}>
                        <defs>
                           <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.3} />
                        <XAxis
                           dataKey="name"
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: 'var(--text-tertiary)', fontSize: 8, fontWeight: 900 }}
                           dy={8}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Network Node Registry */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/5">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <Warehouse size={16} />
                  </div>
                  <div>
                     <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none">Active Franchise Locations</h3>
                     <p className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase mt-0.5 italic">Live status of all centers</p>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Franchise Name', 'Location', 'Distance', 'Assets', 'Earnings', 'Health', 'Status'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                              {header}
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {hubs.map((hub, idx) => (
                        <tr key={hub.id} className={`group/row hover:bg-[var(--bg-tertiary)]/30 transition-colors ${idx === 0 && hub.distanceKm !== null ? 'bg-emerald-500/[0.03]' : ''}`}>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <MapPin size={14} />
                                 </div>
                                 <span className="font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors tracking-tight">{hub.name}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{hub.city}</td>
                           <td className="py-2 px-4">
                              {hub.distanceKm !== null ? (
                                 <div className="flex items-center gap-1">
                                    <span className={` font-medium ${idx === 0 ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>{hub.distanceKm} km</span>
                                    {idx === 0 && <span className="font-medium text-emerald-500">Nearest</span>}
                                 </div>
                              ) : (
                                 <span className="font-medium text-[var(--text-tertiary)]">—</span>
                              )}
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex justify-between items-baseline">
                                    <span className="font-medium text-[var(--text-primary)]">{hub.fleet}</span>
                                    <span className="font-medium text-[var(--text-tertiary)]">Units</span>
                                 </div>
                                 <div className="w-16 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(hub.fleet / 450) * 100}%` }} />
                                 </div>
                              </div>
                           </td>
                           <td className="py-2 px-4  font-medium text-emerald-500">₹{(hub.revenue / 100000).toFixed(1)}L</td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                 <div className="flex-1 w-12 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                       className={`h-full ${parseInt(hub.health) > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                       style={{ width: hub.health }}
                                    />
                                 </div>
                                 <span className="font-medium text-[var(--text-primary)]">{hub.health}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 w-fit">
                                 <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="font-medium">{hub.status}</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
