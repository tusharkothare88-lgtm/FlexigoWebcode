import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Battery, 
  Zap, 
  MapPin, 
  ShieldCheck, 
  History, 
  Settings, 
  FileText,
  AlertTriangle,
  Clock,
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import StatusBadge from '../components/StatusBadge';

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useFleetStore();

  const vehicle = vehicles.find(v => (v._id || v.id) === vehicleId);
  const [isKillModalOpen, setKillModalOpen] = useState(false);
  const [killCountdown, setKillCountdown] = useState(5);
  const [isExecuting, setIsExecuting] = useState(false);


  if (!vehicle) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
       <AlertTriangle size={48} className="text-red-500 opacity-50" />
       <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Asset Log Missing</h2>
       <p className="text-sm text-[var(--text-tertiary)]">The requested vehicle identifier does not exist in this node.</p>
       <button 
         onClick={() => navigate('/franchise/fleet')} 
         className="mt-2 text-emerald-600 font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4"
       >
         Return to Fleet Inventory
       </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
         <button 
            onClick={() => navigate('/franchise/fleet')}
            className="flex items-center gap-3 group text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
         >
            <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg group-hover:border-emerald-500/30 group-hover:text-emerald-600 transition-all shadow-sm">
               <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Return to Asset Registry</span>
         </button>
         <div className="flex items-center gap-3">
            <StatusBadge status={vehicle.status} />
            <button className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 transition-all shadow-sm">
               <MoreVertical size={18} />
            </button>
         </div>
      </div>

      {/* Main Vehicle Profile Card */}
      <div className="relative p-8 md:p-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-[2.5] rotate-12 pointer-events-none">
            <Zap size={120} className="text-emerald-500" />
         </div>
         
         <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            {/* Asset Visual Placeholder */}
            <div className="w-40 h-40 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner relative shrink-0">
               <Zap size={64} strokeWidth={1.5} />
               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 text-emerald-500 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Telemetry Active
               </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left min-w-0">
               <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                     {vehicle.plate}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                     <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 text-[10px] font-bold uppercase tracking-wider">{vehicle.model}</span>
                     <div className="w-px h-3 bg-[var(--border-subtle)]" />
                     <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono">VIN: {vehicle.vin}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Operations Node</p>
                     <p className="text-xs font-bold text-[var(--text-primary)]">HUB-KOR-01-SEC</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Core OS</p>
                     <p className="text-xs font-bold text-[var(--text-primary)]">v4.2.1-fxg</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Cert. Date</p>
                     <p className="text-xs font-bold text-[var(--text-primary)]">Mar 22, 2026</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Performance</p>
                     <p className="text-xs font-bold text-emerald-600">99.8% Efficiency</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm hover:border-emerald-500/20 transition-all group">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Energy Storage</span>
               <Battery size={20} className={vehicle.battery < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
            </div>
            <div className="flex items-baseline gap-2">
               <h2 className="text-4xl font-bold text-[var(--text-primary)]">{vehicle.battery}%</h2>
               <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Available</span>
            </div>
            <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${vehicle.battery}%` }}
                  className={`h-full ${vehicle.battery < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
               />
            </div>
         </div>

         <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm hover:border-blue-500/20 transition-all group">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Operational Range</span>
               <MapPin size={20} className="text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
               <h2 className="text-4xl font-bold text-[var(--text-primary)]">{vehicle.range}</h2>
               <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">KILOMETERS</span>
            </div>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-tight opacity-60">Estimated based on current diagnostics</p>
         </div>

         <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm hover:border-emerald-500/20 transition-all group">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Safety Index</span>
               <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
               <h2 className="text-4xl font-bold text-[var(--text-primary)]">96.5</h2>
               <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Grade A+</span>
            </div>
            <div className="flex gap-1">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-[var(--bg-tertiary)]'}`} />
               ))}
            </div>
         </div>
      </div>

      {/* Details Tabs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm flex flex-col h-full">
               <div className="px-8 py-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold border-l-2 border-emerald-500 pl-3 leading-none text-[var(--text-primary)] uppercase tracking-wider">Operational Logs</h3>
                    <p className="text-[9px] font-medium text-[var(--text-tertiary)] uppercase ml-3">Node event history & maintenance</p>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
                     View Archive
                  </button>
               </div>

               <div className="p-8 space-y-4 flex-1 overflow-y-auto no-scrollbar max-h-[600px]">
                  {vehicle.maintenanceLogs.length > 0 ? (
                    vehicle.maintenanceLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-[var(--bg-tertiary)]/30 border border-[var(--border-subtle)] rounded-xl group hover:border-emerald-500/20 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                           <History size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{log.type}</h4>
                              <span className="text-[10px] font-bold text-[var(--text-tertiary)] font-mono">{log.date}</span>
                           </div>
                           <p className="text-xs font-medium text-[var(--text-tertiary)] leading-relaxed">
                              Standard inspection protocol completed. Handled by Lead Ops <span className="text-emerald-600 font-bold">{log.staff}</span>.
                           </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center opacity-40">
                       <Clock size={40} className="text-[var(--text-tertiary)]" />
                       <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest">No Recent Logs</p>
                          <p className="text-[10px] font-medium uppercase tracking-tighter">Daily node sync complete</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar Actions Column */}
         <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm space-y-6">
               <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Asset Documentation</h4>
                  <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase opacity-60">Legal Compliance Verification</p>
               </div>
               
               <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3.5 bg-[var(--bg-tertiary)]/50 border rounded-xl group hover:border-emerald-500/30 transition-all ${
                     new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'border-rose-500/30' : 'border-[var(--border-subtle)]'
                  }`}>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase">Insurance Policy</span>
                        <span className={`text-[9px] font-bold tracking-tighter uppercase ${
                           new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-rose-500' : 'text-[var(--text-tertiary)] opacity-60'
                        }`}>
                           Expires {new Date(vehicle.insuranceExpiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                     </div>
                     <FileText size={16} className={`opacity-60 group-hover:opacity-100 transition-opacity ${
                        new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-rose-500' : 'text-emerald-600'
                     }`} />
                  </div>
                  <div className={`flex items-center justify-between p-3.5 bg-[var(--bg-tertiary)]/50 border rounded-xl group hover:border-emerald-500/30 transition-all ${
                     new Date(vehicle.pUCExpiry) < new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) ? 'border-rose-500/30 ring-1 ring-rose-500/10' : 'border-[var(--border-subtle)]'
                  }`}>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Pollution (PUC)</span>
                        <span className={`text-[9px] font-bold tracking-tighter uppercase ${
                           new Date(vehicle.pUCExpiry) < new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) ? 'text-rose-500 animate-pulse' : 'text-[var(--text-tertiary)] opacity-60'
                        }`}>
                           Expires {new Date(vehicle.pUCExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                     </div>
                     <FileText size={16} className={`opacity-60 group-hover:opacity-100 transition-opacity ${
                        new Date(vehicle.pUCExpiry) < new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) ? 'text-rose-500' : 'text-emerald-600'
                     }`} />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)] rounded-xl opacity-40 grayscale">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Ops Permit</span>
                        <span className="text-[9px] font-bold text-red-500 tracking-tighter uppercase">Document Missing</span>
                     </div>
                     <ShieldAlert size={16} className="text-red-500" />
                  </div>
               </div>
               
               <button className="w-full py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-600/20 transition-all shadow-sm">
                  Update Compliance Node
               </button>
            </div>

            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-6">
               <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">Emergency Protocol</h4>
                  <p className="text-[9px] font-medium text-red-500/70 uppercase leading-relaxed">
                     Instantly disable telemetry and operational access for this asset. Authorized Personnel only.
                  </p>
               </div>
               <button 
                  onClick={() => {
                     setKillModalOpen(true);
                     setKillCountdown(5);
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95"
               >
                  Execute Kill Command
               </button>
            </div>
         </div>
      </div>

      {/* Kill Command Secure Terminal */}
      <AnimatePresence>
         {isKillModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.2)]"
               >
                  <div className="w-20 h-20 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto animate-pulse">
                     <ShieldAlert size={40} />
                  </div>
                  
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Secure Terminal</h3>
                     <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em]">Protocol: ASSET_IMMOBILIZE_V4</p>
                  </div>

                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-left space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <span>Target Node</span>
                        <span className="text-white">{vehicle.plate}</span>
                     </div>
                     <p className="text-[9px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                        Executing this command will instantly revoke motor authorization and lock the battery hub. This action is irreversible without Master Root Clearance.
                     </p>
                  </div>

                  <div className="space-y-4">
                     <button 
                        disabled={isExecuting}
                        onClick={() => {
                           setIsExecuting(true);
                           setTimeout(() => {
                              setIsExecuting(false);
                              setKillModalOpen(false);
                              alert("ASSET IMMOBILIZED • Master Node Informed");
                           }, 2000);
                        }}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
                           isExecuting ? 'bg-red-900/50 text-red-500 opacity-50' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-900/40'
                        }`}
                     >
                        {isExecuting ? (
                           <>
                              <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                              Transmitting...
                           </>
                        ) : (
                           "Authorize Immobilization"
                        )}
                     </button>
                     <button 
                        disabled={isExecuting}
                        onClick={() => setKillModalOpen(false)}
                        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors"
                     >
                        Abort Command
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
