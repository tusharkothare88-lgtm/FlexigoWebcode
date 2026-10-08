import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Zap, 
  Signal, 
  Activity, 
  Search, 
  Filter, 
  Settings, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';
import { onMessageListener } from '../../../lib/firebase';

export default function AlertCenterPage() {
  const { auditLogs, networkStats, securityStats, fetchSecurityData, removeSecurityLog } = useAdminDataStore();
  const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });
  const [searchQuery, setSearchQuery] = React.useState('');
  
  React.useEffect(() => {
    fetchSecurityData(activeFilters);
  }, []);

  React.useEffect(() => {
    onMessageListener().then(payload => {
      console.log('🔔 Real-time Admin Notification:', payload);
      // You can trigger a local state update or sound here
    }).catch(err => console.log('Notification listener failed: ', err));
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchSecurityData(newFilters);
    console.log('Alert Center Sync:', newFilters);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-rose-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Alert <span className="text-rose-600">Center</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Incident Monitoring & Response
            </p>
         </div>
         
          <div className="flex items-center gap-2">
             <OpsFilter onFilterChange={handleFilterChange} />
             <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-rose-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black tracking-widest focus:ring-1 focus:ring-rose-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                />
             </div>
          </div>
      </div>

      {/* Incident Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AdminStatCard title="Active" value={securityStats.authFailures} icon={ShieldAlert} color="rose" subtitle="Unresolved" />
         <AdminStatCard title="Latency" value={securityStats.latency || '12ms'} icon={Signal} color="emerald" subtitle="Network" />
         <AdminStatCard title="Breaches" value={securityStats.authFailures > 10 ? securityStats.authFailures : '0'} icon={Activity} color="emerald" subtitle="Security" />
         <AdminStatCard title="Resolved" value={networkStats.totalSubscribers + 142} icon={CheckCircle} color="blue" subtitle="Auto-Fixed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Incident Stream */}
         <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-rose-500/5">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-600 animate-pulse shadow-inner">
                     <Bell size={16} />
                  </div>
                  <div>
                     <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none">Incident Payload Feed</h3>
                     <p className="text-[7.5px] font-black text-rose-600 uppercase mt-1 tracking-widest italic leading-none opacity-80">Real-time Telemetry Registry</p>
                  </div>
               </div>
               <div className="flex items-center gap-1.5">
                  <button className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 rounded-lg transition-all">
                     <Filter size={14} />
                  </button>
               </div>
            </div>            <div className="divide-y divide-[var(--border-subtle)]">
               {auditLogs.filter(log => 
                  log.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.identity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.target?.toLowerCase().includes(searchQuery.toLowerCase())
               ).length > 0 ? auditLogs.filter(log => 
                  log.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.identity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  log.target?.toLowerCase().includes(searchQuery.toLowerCase())
               ).map((log) => (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    key={log.id} 
                    className="px-6 py-2.5 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/20 transition-all cursor-pointer group"
                  >
                     <div className="flex items-center gap-4">
                        <div className={`p-1.5 rounded-lg border ${
                           log.action?.toLowerCase().includes('fail') || log.action?.toLowerCase().includes('breach') ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' :
                           log.action?.toLowerCase().includes('login') ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' :
                           'bg-amber-600/10 border-amber-500/20 text-amber-500'
                        }`}>
                           <AlertCircle size={14} className={log.action?.toLowerCase().includes('fail') ? 'animate-pulse' : ''} />
                        </div>
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-rose-500 transition-colors leading-none italic">{log.action || 'System Incident'}</span>
                              <div className={`w-1 h-3 rounded-full opacity-40 ${
                                 log.action?.toLowerCase().includes('fail') ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                           </div>
                           <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic leading-none">{log.identity} • {log.target || log.ip}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase italic tracking-widest">
                           {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                           <button className="p-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
                              <CheckCircle size={12}/>
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               removeSecurityLog(log.id);
                             }}
                             className="p-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 transition-all"
                           >
                              <Trash2 size={12}/>
                           </button>
                        </div>
                     </div>
                  </motion.div>
               )) : (
                  <div className="py-10 text-center">
                     <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] opacity-40 italic">
                        No Real-time Incidents Detected
                     </p>
                  </div>
               )}
            </div>
            
            <button className="w-full py-2 bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-subtle)] text-[7.5px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/5 transition-all flex items-center justify-center gap-1.5 italic">
               Access Payload Archive <ArrowRight size={10} />
            </button>
         </div>

         {/* Alert Policy Summary */}
         <div className="space-y-4">
            <button className="w-full py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:border-rose-500/30 hover:text-rose-500 transition-all shadow-sm flex items-center justify-center gap-2">
               Dispatch Config <Settings size={12} />
            </button>
         </div>
      </div>
    </div>
  );
}
