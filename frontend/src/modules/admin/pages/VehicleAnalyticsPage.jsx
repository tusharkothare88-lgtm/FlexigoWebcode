import React, { useState } from 'react';
import { 
  Settings, 
  Zap, 
  Activity, 
  Battery, 
  AlertCircle, 
  ShieldCheck, 
  BarChart3, 
  TrendingUp, 
  Cpu, 
  Thermometer, 
  CloudLightning, 
  ChevronRight,
  Monitor
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
  CartesianGrid 
} from 'recharts';
import { useAdminDataStore } from '../store/adminDataStore';

const mockHealthData = [
  { id: 'EV-9021', health: 98, temp: '32°C', cycles: 420, voltage: '72.4V', status: 'optimal' },
  { id: 'EV-4412', health: 84, temp: '41°C', cycles: 890, voltage: '71.1V', status: 'warning' },
  { id: 'EV-7721', health: 99, temp: '29°C', cycles: 120, voltage: '72.8V', status: 'optimal' },
  { id: 'EV-1029', health: 72, temp: '48°C', cycles: 1450, voltage: '69.8V', status: 'critical' },
];

const perfSeries = [
  { time: '08:00', load: 45, discharge: 12 },
  { time: '10:00', load: 82, discharge: 28 },
  { time: '12:00', load: 94, discharge: 32 },
  { time: '14:00', load: 78, discharge: 24 },
  { time: '16:00', load: 65, discharge: 18 },
];

export default function VehicleAnalyticsPage() {
  const { vehicleStats, fetchVehicleStats } = useAdminDataStore();
  const [activeView, setActiveView] = useState('real-time');
  const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });

  React.useEffect(() => {
    fetchVehicleStats();
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    console.log('Vehicle Stats Sync:', newFilters);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Vehicle <span className="text-emerald-500">Analytics</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               CAN BUS Telemetry & Predictive BMS Insights
            </p>
         </div>
         
         <div className="flex items-center gap-2">
            <OpsFilter onFilterChange={handleFilterChange} />
         </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         <AdminStatCard title="Fleet Health" value={vehicleStats.fleetHealth} icon={ShieldCheck} color="emerald" subtitle="Avg Battery SOH" />
         <AdminStatCard title="BMS Tags" value={vehicleStats.bmsTags} icon={Activity} color="blue" subtitle="Data Points / Sec" />
         <AdminStatCard title="Thermals" value={vehicleStats.thermals} icon={Thermometer} color="rose" subtitle="Critical Overheat" />
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 bg-emerald-600/10 text-emerald-500 rounded-lg shadow-inner">
               <TrendingUp size={14} />
            </div>
            <div>
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Discharge Matrix</h3>
               <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1 italic leading-none opacity-50">Fleet Mean Load Analysis</p>
            </div>
         </div>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={vehicleStats.perfSeries || []}>
                  <defs>
                     <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 7, fontWeight: 900 }} />
                  <YAxis hide />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                     itemStyle={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Asset BMS Registry */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
         <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">CAN BUS Asset Registry</h3>
            <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-600/5 px-2 py-0.5 rounded border border-emerald-500/10 animate-pulse italic leading-none">LIVE POLLING</span>
         </div>
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
               <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                     {['Asset ID', 'SOH (Health)', 'Thermal', 'Cycles', 'Voltage', 'Status'].map((header) => (
                        <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-subtle)]">
                  {(vehicleStats.assetRegistry || []).map((asset) => (
                     <tr key={asset.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                        <td className="py-2 px-4 font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{asset.id}</td>
                        <td className="py-2 px-4">
                           <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[40px] h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden shadow-inner">
                                 <div className={`h-full ${asset.health < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${asset.health}%` }} />
                              </div>
                              <span className={` font-medium   ${asset.health < 80 ? 'text-rose-500' : 'text-emerald-500'}`}>{asset.health}%</span>
                           </div>
                        </td>
                        <td className="py-2 px-4">
                           <div className="flex items-center gap-1">
                              <Thermometer size={10} className={parseInt(asset.temp) > 45 ? 'text-rose-500' : 'text-blue-500'} />
                              <span className="font-medium text-[var(--text-primary)]">{asset.temp}</span>
                           </div>
                        </td>
                        <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{asset.cycles} Cycles</td>
                        <td className="py-2 px-4 font-medium  text-[var(--text-primary)]">{asset.voltage}</td>
                        <td className="py-2 px-4">
                           <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${
                              asset.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 
                              asset.status === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 
                              'bg-rose-500/10 text-rose-500 border-rose-500/10'
                           }`}>
                              {asset.status}
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
