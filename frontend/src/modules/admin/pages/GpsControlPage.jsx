import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Power, 
  Unlock, 
  ShieldCheck, 
  Activity,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Signal,
  Lock
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import LiveFleetMap from '../components/LiveFleetMap';
import OpsFilter from '../components/OpsFilter';
import { motion } from 'framer-motion';
import { useAdminDataStore } from '../store/adminDataStore';

export default function GpsControlPage() {
  const { vehicles, franchiseOps, networkStats, fetchAllVehicles, fetchDashboardStats, fetchFranchiseOpsData } = useAdminDataStore();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });
  
  React.useEffect(() => {
    if (vehicles.length === 0) fetchAllVehicles();
    if (networkStats.totalHubs === 0) fetchDashboardStats();
    fetchFranchiseOpsData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchAllVehicles(newFilters);
    console.log('GPS Control Sync:', newFilters);
  };

  React.useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles]);

  const activeVehicle = selectedVehicle || { id: 'SYNC', rider: 'N/A', location: 'N/A', battery: 0, lastPing: 'N/A' };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  GPS & <span className="text-emerald-500">Control</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Telematics & Fleet Command Registry
            </p>
         </div>
         
         <div className="flex items-center gap-2">
            <OpsFilter onFilterChange={handleFilterChange} />
            <div className="relative group">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Node ID..." 
                 className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
               />
            </div>
            <button className="p-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 transition-all">
               <Filter size={14} />
            </button>
         </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AdminStatCard title="Tracked Units" value={vehicles.length} icon={Navigation} color="emerald" subtitle="On Grid Alpha" />
         <AdminStatCard title="In Motion" value={vehicles.filter(v => v.status === 'in-motion' || v.currentSpeed > 0).length} icon={Activity} color="blue" subtitle="Live Flux" />
         <AdminStatCard title="Low Power" value={vehicles.filter(v => v.battery < 20).length} icon={Zap} color="rose" subtitle="Critical Swap" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Vehicle List */}
         <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm h-fit">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10 flex items-center justify-between">
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Fleet Assets Stream</h3>
               <p className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Polling Active</p>
            </div>
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Asset ID', 'Assigned Persona', 'Geo-Node', 'Power', 'Sync'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {vehicles.map((vehicle) => (
                        <tr 
                           key={vehicle._id || vehicle.id} 
                           onClick={() => setSelectedVehicle(vehicle)}
                           className={`group/row transition-all duration-200 cursor-pointer  ${(activeVehicle._id || activeVehicle.id) === (vehicle._id || vehicle.id) ? 'bg-emerald-600/5' : 'hover:bg-[var(--bg-tertiary)]/20'}`}
                        >
                           <td className="py-2 px-4">
                              <span className={`font-medium   transition-colors   ${(activeVehicle._id || activeVehicle.id) === (vehicle._id || vehicle.id) ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>{vehicle.plate || 'N/A'}</span>
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex flex-col">
                                 <span className="font-medium text-[var(--text-primary)]">{vehicle.rider || 'N/A'}</span>
                                 <span className="font-medium text-[var(--text-tertiary)]/50  mt-1">Asset Identity</span>
                              </div>
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-1.5">
                                 <MapPin size={10} className="text-emerald-500 opacity-60" />
                                 <span className="font-medium text-[var(--text-tertiary)]">{vehicle.location}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-12 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex-shrink-0 border border-[var(--border-subtle)]">
                                    <div className={`h-full ${vehicle.battery < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${vehicle.battery}%` }} />
                                 </div>
                                 <span className={` font-medium  ${vehicle.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>{vehicle.battery}%</span>
                              </div>
                           </td>
                           <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{vehicle.lastPing}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Tactical Grid Map View */}
         <div className="space-y-4">
            <div className="h-[500px] lg:h-full min-h-[500px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl relative overflow-hidden group shadow-sm border-l-4 border-l-emerald-600">
               <LiveFleetMap vehicles={vehicles} franchises={franchiseOps} />
               
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent pointer-events-none">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Live GPS Vector Feed</p>
                        <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">Satellite Connectivity Active</p>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Locked</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
