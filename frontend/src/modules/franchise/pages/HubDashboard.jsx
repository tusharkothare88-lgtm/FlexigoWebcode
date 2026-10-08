import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  Truck, 
  Users, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Calendar,
  ZapOff,
  Navigation,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import api from '../../../lib/axios';
import DataCard from '../components/DataCard';
import ActivityFeed from '../components/ActivityFeed';
import { useFleetStore } from '../store/fleetStore';
import { useRiderAssignmentStore } from '../store/riderAssignmentStore'; // provides subscribers
import { useFranchiseWalletStore } from '../store/walletStore';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';

export default function HubDashboard() {
  const { vehicles, fetchVehicles } = useFleetStore();
  const { subscribers, fetchSubscribers } = useRiderAssignmentStore();
  const { balance, fetchWallet } = useFranchiseWalletStore();
  const { user: franchise } = useFranchiseAuthStore();
  const [metrics, setMetrics] = useState({
    totalVehicles: 0,
    activeSubscribers: 0,
    availableVehicles: 0,
    issuesVehicles: 0,
    utilization: 0,
    avgPlanValue: 0
  });
  
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fId = franchise?._id || franchise?.id;
    if (fId) {
        fetchVehicles(fId);
        fetchSubscribers(fId);
        fetchWallet();
    }
    
    // Fetch metrics from protected endpoint
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/franchise/dashboard-metrics');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };
    fetchMetrics();

    const ctx = gsap.context(() => {
      gsap.from('.gsap-card', {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, dashboardRef);
    return () => ctx.revert();
  }, []);

  const totalVehicles = metrics.totalVehicles || vehicles.length;
  const activeSubscribers = metrics.activeSubscribers || (subscribers || []).filter(s => s.status === 'active').length;
  const availableVehicles = metrics.availableVehicles || vehicles.filter(v => v.status === 'available').length;
  const issuesVehicles = metrics.issuesVehicles || vehicles.filter(v => v.status === 'in-service' || v.status === 'quarantined').length;


  return (
    <div ref={dashboardRef} className="space-y-6 pb-10">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 gsap-card">
        <div className="space-y-0.5">
           <div className="flex items-center gap-2">
             <div className="w-1 h-3 bg-emerald-500 rounded-full" />
             <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
               Franchise <span className="text-emerald-500">Overview</span>
             </h1>
           </div>
           <p className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] ml-3 italic opacity-40 leading-none">
              OPERATIONAL_REALTIME_METRICS • KORAMANGALA_FRANCHISE
           </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/franchise/fleet/add')}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[7.5px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-950/20 italic leading-none"
          >
             + NEW_VEHICLE
          </button>
          <button className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-[7.5px] font-black uppercase tracking-widest hover:border-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 shadow-inner italic leading-none group">
             OPS_HANDOVER <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gsap-card">
        <DataCard 
          title="Fleet Size" 
          value={totalVehicles} 
          unit="units" 
          icon={Truck} 
          color="#10b981" 
          trend="up" 
          trendValue={5} 
          onClick={() => navigate('/franchise/fleet')}
        />
        <DataCard 
          title="Active Subscribers" 
          value={activeSubscribers} 
          unit="subscribers" 
          icon={Users} 
          color="#3b82f6" 
          trend="up" 
          trendValue={12} 
          onClick={() => navigate('/franchise/tracking')}
        />
        <DataCard 
          title="Available Inventory" 
          value={availableVehicles} 
          unit="EVs" 
          icon={Zap} 
          color="#f59e0b" 
          trend="down" 
          trendValue={2} 
          onClick={() => navigate('/franchise/fleet')}
        />
        <DataCard 
          title="Maintenance Alert" 
          value={issuesVehicles} 
          unit="critical" 
          icon={AlertTriangle} 
          color="#ef4444" 
          trend="up" 
          trendValue={1} 
          onClick={() => navigate('/franchise/maintenance')}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financials & Map */}
        <div className="lg:col-span-2 space-y-6 gsap-card">
          
          {/* Revenue Analysis Card */}
          <div className="relative group p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] scale-[2] pointer-events-none rotate-12">
               <TrendingUp size={100} className="text-emerald-500" />
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="space-y-0.5">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] italic text-[var(--text-primary)] leading-none">OPERATIONAL_REVENUE</h3>
                  <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-40 leading-none">GROSS_COMMISSION: NETWORK_LAYER</p>
               </div>
               <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-subtle)] shadow-inner">
                  <button className="px-3 py-1 rounded-md text-[7px] font-black uppercase tracking-widest bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm italic leading-none">DAILY</button>
                  <button className="px-3 py-1 rounded-md text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors italic leading-none">WEEKLY</button>
               </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2 relative z-10">
               <span className="text-[var(--text-tertiary)] text-sm font-black italic opacity-40">₹</span>
               <h2 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] italic leading-none">
                  {balance.toLocaleString('en-IN')}
               </h2>
               <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[8px] font-black uppercase tracking-widest italic leading-none">
                  <TrendingUp size={10} strokeWidth={3} />
                  +18.5%
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[var(--border-subtle)] relative z-10">
                 <div className="space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-[0.2em] italic text-[var(--text-tertiary)] opacity-40 leading-none">ACTIVE_PLANS</p>
                    <p className="text-lg font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{activeSubscribers}</p>
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-[0.2em] italic text-[var(--text-tertiary)] opacity-40 leading-none">FLEET_UTILIZATION</p>
                    <p className="text-lg font-black text-blue-500 italic tracking-tighter leading-none">{metrics.utilization}%</p>
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[6.5px] font-black uppercase tracking-[0.2em] italic text-[var(--text-tertiary)] opacity-40 leading-none">AVG_PLAN_VALUE</p>
                    <p className="text-lg font-black text-emerald-500 italic tracking-tighter leading-none">₹{metrics.avgPlanValue}</p>
                 </div>
             </div>
          </div>

          {/* Asset Tracking Mock */}
          <div className="relative group h-40 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-inner flex items-center justify-center">
             <div className="absolute inset-0 bg-[var(--bg-tertiary)] opacity-30 pointer-events-none">
                <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-[var(--text-primary)]"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
                
                {/* Status Nodes */}
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-500 rounded-full blur-[2px] opacity-60 animate-pulse" />
                <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
             </div>

             <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="px-2 py-1 bg-[var(--bg-secondary)]/90 border border-[var(--border-subtle)] rounded-md flex items-center gap-1.5 shadow-inner">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[6px] font-black uppercase tracking-[0.2em] italic text-[var(--text-primary)] leading-none">FLEET_TRACKING_LIVE</span>
                </div>
                <div className="px-2 py-1 bg-[var(--bg-secondary)]/90 border border-[var(--border-subtle)] rounded-md flex items-center gap-1.5 shadow-inner">
                   <Navigation size={8} className="text-blue-500" strokeWidth={3} />
                   <span className="text-[6px] font-black uppercase tracking-[0.2em] italic text-blue-500 leading-none">FRANCHISE_PERIMETER</span>
                </div>
             </div>

             <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="space-y-0.5">
                   <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic leading-none">NODE_COVERAGE</h3>
                   <p className="text-[6px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] italic opacity-60 leading-none">8_ASSETS_TRIANGULATED_WITHIN_5.2KM</p>
                </div>
                <button className="p-2 bg-black border border-white/5 text-white rounded-lg hover:border-emerald-500/20 transition-all active:scale-95 shadow-inner group">
                   <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Activity & Peak Forecast */}
        <div className="space-y-6 flex flex-col h-full gsap-card">
           <div className="flex flex-col h-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden p-4 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                 <div className="space-y-0.5">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] italic text-[var(--text-primary)] leading-none">NODE_ACTIVITY</h3>
                    <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-40 leading-none">OPERATIONAL_EVENT_LOG</p>
                 </div>
                 <div className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 transition-colors cursor-pointer rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] shadow-inner">
                    <Clock size={10} strokeWidth={3} />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pr-1 min-h-0">
                 <ActivityFeed />
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                 <button className="w-full py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[7px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] hover:border-emerald-500/20 transition-all italic shadow-inner">
                    FULL_OPERATIONS_LOG
                 </button>
              </div>
           </div>

           {/* Peak Forecast Card */}
           <div className="p-4 rounded-xl bg-black border border-[var(--border-subtle)] shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                    <Calendar size={14} strokeWidth={3} />
                 </div>
                 <div className="space-y-0.5">
                    <h4 className="text-[8px] font-black text-white uppercase tracking-[0.2em] italic leading-none">DEMAND_FORECAST</h4>
                    <p className="text-[6px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none">EFFICIENCY: HIGH</p>
                 </div>
              </div>
              <p className="text-[var(--text-tertiary)] text-[7px] font-black uppercase tracking-widest italic opacity-60 leading-relaxed mb-4">
                 PEAK_DEMAND_WINDOW_DETECTED: <span className="text-white opacity-100">11:00 AM - 15:00 PM</span>. 
                 OPTIMIZE_FRANCHISE_INVENTORY_FOR_HIGH_THROUGHPUT_HANDOVERS.
              </p>
              <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden shadow-inner border border-white/5">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                 />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
