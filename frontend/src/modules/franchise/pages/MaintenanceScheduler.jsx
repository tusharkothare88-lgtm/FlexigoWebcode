import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  MoreVertical,
  ChevronRight,
  Plus,
  ArrowRight,
  ShieldCheck,
  X,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFleetStore } from '../store/fleetStore';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import { useNavigate } from 'react-router-dom';

export default function MaintenanceScheduler() {
  const navigate = useNavigate();
  const { vehicles, fetchVehicles, addMaintenanceLog, updateVehicleStatus } = useFleetStore();
  const { user } = useFranchiseAuthStore();
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  React.useEffect(() => {
    if (user?._id || user?.id) {
      fetchVehicles(user._id || user.id);
    }
  }, [user, fetchVehicles]);
  
  const maintenanceHistory = vehicles.flatMap(v => 
    (v.maintenanceLogs || []).map(log => ({ ...log, vehicleId: v._id || v.id, plate: v.plate }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    operational: vehicles.length > 0 ? ((vehicles.filter(v => v.status === 'available' || v.status === 'assigned').length / vehicles.length) * 100).toFixed(1) : '0.0',
    alerts: vehicles.filter(v => v.status === 'in-service').length,
    quarantined: vehicles.filter(v => v.status === 'quarantined').length,
    turnaround: '3.4h' // Hardcoded as placeholder for avg calculation
  };

  const [formData, setFormData] = useState({
    type: 'Regular Inspection',
    staff: '',
    notes: '',
    priority: 'Standard'
  });

  const handleBookService = async (e) => {
    e.preventDefault();
    const v = vehicles.find(veh => (veh._id || veh.id) === selectedVehicleId);
    if (!v) return;

    const newLog = {
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      staff: formData.staff,
      description: formData.notes
    };

    const res = await addMaintenanceLog(selectedVehicleId, newLog);
    if (res.success) {
      await updateVehicleStatus(selectedVehicleId, 'in-service');
      setIsModalOpen(false);
      setFormData({ type: 'Regular Inspection', staff: '', notes: '', priority: 'Standard' });
      setSelectedVehicleId('');
    } else {
      alert(res.message || 'Failed to authorize service sync');
    }
  };


  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-3 bg-emerald-500 rounded-full" />
               <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
                  Maintenance <span className="text-emerald-500">Scheduler</span>
               </h1>
            </div>
            <p className="text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] ml-3 italic opacity-40 leading-none">
               VEHICLE_HEALTH_REGISTRY • FLEET_PERSISTENCE_HUB
            </p>
         </div>
         
         <button 
           onClick={() => setIsModalOpen(true)}
           className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[7.5px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/20 active:scale-95 italic leading-none"
         >
            <Plus size={12} strokeWidth={3} /> BOOK_SERVICE_NODE
         </button>
      </div>

      {/* Health Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-between shadow-inner border-l-4 border-l-emerald-500">
            <span className="text-[6.5px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none mb-4">SYSTEM_ONLINE</span>
            <div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{stats.operational}%</h3>
               <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 mt-1 leading-none">FLEET_OPERATIONAL</p>
            </div>
         </div>
         <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-between shadow-inner border-l-4 border-l-amber-500">
            <span className="text-[6.5px] font-black text-amber-500 uppercase tracking-[0.3em] italic leading-none mb-4">REQUIRES_CHECK</span>
            <div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{stats.alerts}</h3>
               <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 mt-1 leading-none">MAINTENANCE_ALERTS</p>
            </div>
         </div>
         <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-between shadow-inner border-l-4 border-l-rose-500">
            <span className="text-[6.5px] font-black text-rose-500 uppercase tracking-[0.3em] italic leading-none mb-4">GROUND_STATUS</span>
            <div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{stats.quarantined}</h3>
               <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 mt-1 leading-none">ASSET_QUARANTINED</p>
            </div>
         </div>
         <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-between shadow-inner border-l-4 border-l-blue-500">
            <span className="text-[6.5px] font-black text-blue-500 uppercase tracking-[0.3em] italic leading-none mb-4">AVG_REPAIR</span>
            <div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{stats.turnaround}</h3>
               <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 mt-1 leading-none">TURNAROUND_TIME</p>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Active/Upcoming Maintenance */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex border-b border-[var(--border-subtle)] gap-8">
               {['upcoming', 'in-service', 'critical'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 text-[7.5px] font-black uppercase tracking-[0.3em] italic transition-all relative ${
                      activeTab === tab ? 'text-emerald-500' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-60'
                    }`}
                  >
                     {tab}
                     {activeTab === tab && (
                        <motion.div layoutId="maint-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                     )}
                  </button>
               ))}
            </div>

            <div className="space-y-3">
               {vehicles.filter(v => 
                  activeTab === 'in-service' ? v.status === 'in-service' :
                  activeTab === 'critical' ? v.status === 'quarantined' :
                  v.status === 'available' || v.status === 'assigned'
               ).map((vehicle) => (
                  <motion.div 
                    layout
                    key={vehicle._id || vehicle.id}
                    className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between hover:border-emerald-500/30 transition-all group cursor-pointer shadow-inner"
                    onClick={() => navigate(`/franchise/fleet/${vehicle._id || vehicle.id}`)}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                           vehicle.status === 'quarantined' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                           vehicle.status === 'in-service' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                           'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                           <Wrench size={14} />
                        </div>
                        <div className="space-y-0.5">
                           <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight italic leading-none">{vehicle.plate}</h4>
                           <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 leading-none">{vehicle.model} • VIN: {vehicle.vin.slice(-4)}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                           <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mb-1 italic opacity-60">ENERGY_INDEX</p>
                           <p className={`text-[10px] font-black italic leading-none ${vehicle.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>{vehicle.battery}%</p>
                        </div>
                        <div className="h-6 w-px bg-[var(--border-subtle)] hidden md:block" />
                        <button className="p-1.5 bg-[var(--bg-tertiary)] hover:border-emerald-500/30 border border-transparent rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 transition-all group/btn shadow-inner">
                           <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Log Sidestrip */}
         <div className="space-y-4">
            <div className="p-4 bg-black border border-[var(--border-subtle)] rounded-xl shadow-inner flex flex-col h-full max-h-[700px]">
               <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                     <History size={12} className="text-emerald-500" strokeWidth={3} />
                     <h3 className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic leading-none">NODE_HISTORY</h3>
                  </div>
                  <div className="p-1 px-2 bg-emerald-500/10 rounded-[4px] text-[6px] font-black text-emerald-500 uppercase tracking-[0.3em] border border-emerald-500/20 italic">ARCHIVE_ACTIVE</div>
               </div>

               <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
                  {maintenanceHistory.map((log, i) => (
                     <div key={i} className="flex gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl group hover:border-emerald-500/20 transition-all shadow-inner">
                        <div className="space-y-1.5 flex-1">
                           <div className="flex items-center justify-between">
                              <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-[0.2em] italic leading-none">{log.plate}</span>
                              <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase italic tracking-widest leading-none opacity-60">{log.date}</span>
                           </div>
                           <h4 className="text-[10px] font-black text-white uppercase tracking-tight italic leading-none truncate">{log.type}</h4>
                           <div className="flex items-center gap-1 text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60 leading-none">
                              <User size={8} className="text-emerald-500" /> {log.staff}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               <button className="w-full mt-4 py-2 border border-[var(--border-subtle)] rounded-lg text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all italic shadow-inner bg-[var(--bg-secondary)]">
                  EXPORT_PDF_LOGS
               </button>
            </div>
         </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-6"
               >
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                           Book <span className="text-emerald-500">Service Node</span>
                        </h2>
                        <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.4em] italic leading-none opacity-60">PROTOCOL: MAINT_SYNC_8.0</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:border-emerald-500/30 hover:text-emerald-500 transition-all rounded-lg border border-[var(--border-subtle)] shadow-inner">
                        <X size={14} />
                     </button>
                  </div>

                  <form onSubmit={handleBookService} className="space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic ml-1 opacity-60">TARGET_ASSET</label>
                           <select 
                             required
                             value={selectedVehicleId}
                             onChange={(e) => setSelectedVehicleId(e.target.value)}
                             className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer italic shadow-inner"
                           >
                              <option value="">SELECT_VEHICLE...</option>
                              {vehicles.filter(v => v.status !== 'in-service').map(v => (
                                 <option key={v._id || v.id} value={v._id || v.id}>{v.plate} ({v.model})</option>
                              ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic ml-1 opacity-60">SERVICE_TYPE</label>
                              <select 
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[7.5px] font-black uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer shadow-inner italic"
                              >
                                 <option>REGULAR_INSPECTION</option>
                                 <option>BMS_RECALIBRATION</option>
                                 <option>MOTOR_OPTIMIZATION</option>
                                 <option>TIRE/BRAKE_NODE</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic ml-1 opacity-60">LEAD_TECH</label>
                              <input 
                                required
                                value={formData.staff}
                                onChange={(e) => setFormData({...formData, staff: e.target.value})}
                                placeholder="ENTER_ID..."
                                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-emerald-500/20 outline-none italic transition-all placeholder:text-[var(--text-tertiary)]/50 shadow-inner"
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic ml-1 opacity-60">OBSERVATION_PAYLOAD</label>
                           <textarea 
                             rows={2}
                             value={formData.notes}
                             onChange={(e) => setFormData({...formData, notes: e.target.value})}
                             placeholder="DESCRIBE_MAINTENANCE_REQUIREMENT..."
                             className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[7.5px] font-black uppercase tracking-[0.2em] outline-none shadow-inner italic placeholder:text-[var(--text-tertiary)]/50 resize-none"
                           />
                        </div>
                     </div>

                     <button 
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[7.5px] font-black uppercase tracking-[.3em] shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2 group italic"
                     >
                        <Zap size={10} fill="white" className="group-hover:animate-bounce" strokeWidth={3} /> AUTHORIZE_SERVICE_SYNC
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
