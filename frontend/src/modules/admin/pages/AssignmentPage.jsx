import React, { useState } from 'react';
import { 
  QrCode, 
  UserPlus, 
  Truck, 
  History, 
  ExternalLink, 
  CheckCircle, 
  Search, 
  Filter, 
  Scan,
  Maximize2,
  Clock,
  ArrowRight,
  X,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

export default function AssignmentPage() {
  const { 
    assignments, 
    fetchAssignments, 
    assignVehicle,
    fetchSubscribers
  } = useAdminDataStore();

  const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchAssignments(activeFilters);
    fetchSubscribers();
  }, [activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    console.log('Assignment Sync:', newFilters);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // qr or manual
  const [assignmentData, setAssignmentData] = useState({
    vehicleId: '',
    riderName: '',
    hub: 'Main Gateway'
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignmentData.vehicleId || !assignmentData.riderName) return;

    // Mobile Number Validation (Exactly 10 digits)
    if (!/^\d{10}$/.test(assignmentData.riderName)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const payload = {
      vehiclePlate: assignmentData.vehicleId,
      riderPhone: assignmentData.riderName,
      type: activeTab === 'qr' ? 'QR Scan' : 'Manual',
      hubName: assignmentData.hub
    };

    const res = await assignVehicle(payload);
    if (res.success) {
      setAssignmentData({ vehicleId: '', riderName: '', hub: 'Main Gateway' });
      setIsModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Vehicle <span className="text-emerald-500">Assignment</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Fleet Allocation & Handover
            </p>
         </div>
         
         <div className="flex items-center gap-2">
            <OpsFilter onFilterChange={handleFilterChange} />
            <div className="relative group">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search Rider/Vehicle No..." 
                 className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-48 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50 italic"
               />
            </div>
            <button 
               onClick={() => { setActiveTab('qr'); setIsModalOpen(true); }}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
            >
               <QrCode size={12} strokeWidth={3} /> QR Launch
            </button>
            <button 
               onClick={() => { setActiveTab('manual'); setIsModalOpen(true); }}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:border-emerald-500/30 transition-all active:scale-95"
            >
               <UserPlus size={12} /> External
            </button>
         </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AdminStatCard title="Rentals" value={assignments.filter(a => a.status === 'active').length} icon={Truck} color="emerald" subtitle="Active Units" />
         <AdminStatCard title="QR Sync" value="68%" icon={QrCode} color="blue" subtitle="Auto-Flow" />
         <AdminStatCard title="Velocity" value="4.2m" icon={Clock} color="amber" subtitle="Dispatch Speed" />
         <AdminStatCard title="Integrity" value="99.8%" icon={CheckCircle} color="emerald" subtitle="Success Rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Assignment Registry */}
         <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/5">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     <Target size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none">Allocation Registry</h3>
               </div>
               <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search ID..." 
                    className="pl-8 pr-3 py-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                  />
               </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['ID', 'Asset', 'Host', 'Protocol', 'Time', 'Status'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     <AnimatePresence mode='popLayout'>
                        {assignments.filter(asgn => {
                            const q = searchQuery.toLowerCase();
                            return (
                               (asgn.rider?.name || '').toLowerCase().includes(q) ||
                               (asgn.rider?.phone || '').toLowerCase().includes(q) ||
                               (asgn.vehicle?.plate || '').toLowerCase().includes(q) ||
                               (asgn._id || '').toLowerCase().includes(q)
                            );
                        }).map((asgn) => (
                            <motion.tr 
                               layout
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               exit={{ opacity: 0 }}
                               key={asgn._id} 
                               className="group/row hover:bg-[var(--bg-tertiary)]/20 transition-colors cursor-pointer"
                            >
                               <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{(asgn._id || asgn.id).slice(-8).toUpperCase()}</td>
                               <td className="py-2 px-4 font-medium text-[var(--text-primary)]">{asgn.vehicle?.plate}</td>
                               <td className="py-2 px-4">
                                  <div className="flex flex-col">
                                     <span className="font-medium text-[var(--text-primary)]   leading-tight">{asgn.rider?.name || asgn.rider?.phone}</span>
                                     <span className="font-medium text-[var(--text-tertiary)]   mt-0.5">{asgn.hubName || asgn.hub}</span>
                                  </div>
                               </td>
                               <td className="py-2 px-4">
                                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded  font-medium   border ${
                                     asgn.type === 'QR Scan' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                                  }`}>
                                     {asgn.type === 'QR Scan' ? <Scan size={8} /> : <UserPlus size={8} />}
                                     {asgn.type}
                                  </div>
                               </td>
                               <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{new Date(asgn.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                               <td className="py-2 px-4">
                                  <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border ${
                                     asgn.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                  }`}>
                                     {asgn.status === 'active' && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse mr-1" />}
                                     {asgn.status}
                                  </div>
                               </td>
                            </motion.tr>
                        ))}
                     </AnimatePresence>
                  </tbody>
               </table>
            </div>
         </div>

         {/* Dispatch Control & QR Panel */}
         <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden group border-t-4 border-t-emerald-600">
               <div className="w-full flex items-center justify-between mb-6 pb-2 border-b border-[var(--border-subtle)] relative z-10">
                  <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Fleet Dispatcher</h3>
                  <div className="p-1.5 bg-emerald-600/10 rounded-lg text-emerald-500 animate-pulse">
                     <QrCode size={16} />
                  </div>
               </div>

               <div className="w-36 h-36 bg-[var(--bg-tertiary)] border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-center relative group/qr shadow-inner hover:scale-105 transition-transform">
                  <QrCode size={90} className="text-emerald-500 opacity-90" />
                  <div className="absolute -bottom-2 px-3 py-1 bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/10">
                     SYNC_SIGNAL
                  </div>
               </div>

               <div className="mt-8 w-full space-y-4 relative z-10">
                  <div className="p-3 bg-[var(--bg-tertiary)]/50 rounded-xl space-y-2 border border-[var(--border-subtle)]">
                     <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest text-center">Active Token</p>
                     <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-1.5 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-[8px] font-black text-[var(--text-primary)] tracking-widest italic ml-1 leading-none uppercase">FLX-2026-T4</span>
                        <div className="flex gap-1">
                           <button className="p-1 text-[var(--text-tertiary)] hover:text-emerald-500 transition-all"><Maximize2 size={12} /></button>
                           <button className="p-1 text-[var(--text-tertiary)] hover:text-emerald-500 transition-all"><History size={12} /></button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <button className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm border-l-4 border-l-emerald-600">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600/10 text-emerald-500 rounded-lg">
                     <Globe size={16} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                     <p className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Telemetry Control</p>
                     <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase mt-1 leading-none italic tracking-widest">Route Auditor Flow</p>
                  </div>
               </div>
               <ArrowRight size={14} className="text-[var(--text-tertiary)]/50 group-hover:translate-x-0.5 group-hover:text-emerald-500 transition-all" />
            </button>
            <div className="p-4 bg-[var(--bg-secondary)] shadow-sm border-t-4 border-t-emerald-600 rounded-2xl space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-600/10 text-emerald-500 rounded-lg">
                        <Truck size={16} strokeWidth={2.5} />
                     </div>
                     <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Ready Assets</span>
                  </div>
                  <span className="text-xl font-black text-emerald-500 italic">14</span>
               </div>
               <div className="flex -space-x-2 mt-1">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[7px] font-black text-emerald-500 shadow-sm">
                        {i}
                     </div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[7.5px] font-black text-white shadow-lg shadow-emerald-950/20">
                     +9
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
               >
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Handover <span className="text-emerald-500">Initiator</span></h2>
                        <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{activeTab.toUpperCase()}_DISPATCH_PROTOCOL</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                        <X size={16} />
                     </button>
                  </div>

                  <form onSubmit={handleAssign} className="space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Asset Cipher (Vehicle Plate No.)</label>
                           <input 
                              autoFocus
                              value={assignmentData.vehicleId}
                              onChange={(e) => setAssignmentData({...assignmentData, vehicleId: e.target.value})}
                              placeholder="e.g. DL 01 AB 1234"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                           />
                        </div>

                        <div className="space-y-1.5 relative">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Host Entity (Rider Phone No.)</label>
                           <input 
                              value={assignmentData.riderName}
                              onChange={(e) => {
                                 const val = e.target.value.replace(/\D/g, '');
                                 if (val.length <= 10) {
                                   setAssignmentData({...assignmentData, riderName: val});
                                   setShowSuggestions(true);
                                 }
                              }}
                              onFocus={() => setShowSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                              maxLength={10}
                              placeholder="e.g. 9876543210"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                           />
                           
                           {/* Previous User Suggestions */}
                           <AnimatePresence>
                              {showSuggestions && assignmentData.riderName.length > 2 && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-xl z-[110] overflow-hidden"
                                 >
                                    <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50">
                                       <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">Previous Suggestions</span>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto no-scrollbar">
                                       {(useAdminDataStore.getState().subscribers || [])
                                          .filter(s => s.phone.includes(assignmentData.riderName))
                                          .map(s => (
                                             <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                   setAssignmentData({...assignmentData, riderName: s.phone});
                                                   setShowSuggestions(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-emerald-600/5 flex items-center justify-between group transition-colors"
                                             >
                                                <div className="flex flex-col">
                                                   <span className="text-[9px] font-black text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{s.phone}</span>
                                                   <span className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase">{s.name || 'Anonymous'}</span>
                                                </div>
                                                <div className={`px-1 py-0.5 rounded text-[6px] font-black uppercase border ${s.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'}`}>
                                                   {s.status}
                                                </div>
                                             </button>
                                          ))}
                                       {!(useAdminDataStore.getState().subscribers || []).some(s => s.phone.includes(assignmentData.riderName)) && (
                                          <div className="p-4 text-center">
                                             <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">No matches found</span>
                                          </div>
                                       )}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>

                     <button 
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                        <Zap size={14} fill="white" /> Execute Dispatch Hub Sync
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
