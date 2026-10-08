import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { 
  Users, 
  Search, 
  Calendar, 
  Zap, 
  MoreVertical,
  Navigation,
  MessageSquare,
  ShieldCheck,
  Clock,
  Filter,
  Truck,
  User as UserIcon,
  CreditCard,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { useRiderAssignmentStore } from '../store/riderAssignmentStore';
import { useFleetStore } from '../store/fleetStore';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import GlassTable from '../components/GlassTable';
import StatusBadge from '../components/StatusBadge';
import OpsFilter from '../components/OpsFilter';
import FranchisePaymentModal from '../components/FranchisePaymentModal';

export default function SubscriberConsole() {
  const navigate = useNavigate();
  const { subscribers = [], fetchSubscribers, payRiderPlan, payRiderDeposit } = useRiderAssignmentStore();
  const { vehicles = [], fetchVehicles } = useFleetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, rider: null });
  const [activeFilters, setActiveFilters] = useState({
    range: 'Last 7 Days',
    metrics: {}
  });

  const { user } = useFranchiseAuthStore();

  useEffect(() => {
    fetchSubscribers();
    const fId = user?.id || user?._id;
    if (fId) {
       fetchVehicles(fId);
    }
  }, [fetchSubscribers, fetchVehicles, user]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    console.log('Subscriber Filter Sync:', newFilters);
  };

  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];
    return subscribers.filter(s => {
      const q = searchQuery.toLowerCase();
      return (
        (s.name?.toLowerCase() || '').includes(q) || 
        (s.phone || '').includes(q) ||
        (s._id?.toLowerCase() || s.id?.toLowerCase() || '').includes(q) ||
        (s.licenseNo?.toLowerCase() || '').includes(q) ||
        (s.vehicleId?.toLowerCase() || '').includes(q)
      );
    });
  }, [subscribers, searchQuery]);

  const utilization = vehicles.length > 0 ? ((subscribers.filter(s => s.status === 'active').length / vehicles.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-3 pb-8">
      {/* Page Header omitted for brevity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
              PERSONNEL <span className="text-blue-500">REGISTRY</span>
            </h1>
          </div>
          <p className="text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] ml-3 italic opacity-60 leading-none mt-1">
             NETWORK_ALLOCATION • SUBSCRIBER_PERSISTENCE
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-48 group">
              <Search size={10} className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_PERSONNEL..." 
                className="w-full pl-8 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[7.5px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-600 italic shadow-inner leading-none"
              />
           </div>
           
            <OpsFilter 
              onFilterChange={handleFilterChange}
              filters={[
                { id: 'status', label: 'PERSONNEL_STATUS', options: ['Active', 'Pending', 'Suspended'] },
                { id: 'plan', label: 'SUB_TIER', options: ['Standard', 'Premium', 'Enterprise'] }
              ]}
            />

            <button 
              onClick={() => navigate('/franchise/subscribers/add')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[7.5px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2 italic leading-none"
            >
              <UserPlus size={10} strokeWidth={3} />
              ADD_RIDER
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         {[
           { label: 'ACTIVE_PERSONNEL', val: subscribers.filter(s => s.status === 'active').length.toString().padStart(2, '0'), icon: Users, color: 'emerald' },
           { label: 'NETWORK_UTILIZATION', val: `${utilization}%`, icon: Zap, color: 'blue' },
           { label: 'REGISTRY_QUEUE', val: subscribers.filter(s => s.status === 'pending').length.toString().padStart(2, '0'), icon: Calendar, color: 'amber' }
         ].map((m, i) => (

           <motion.div 
             key={m.label}
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="px-5 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-4 shadow-inner hover:border-[var(--border-subtle)] transition-all group overflow-hidden relative"
           >
              <div className="absolute top-0 right-0 p-3 opacity-[0.03] scale-125 rotate-12 transition-transform group-hover:rotate-45">
                 <m.icon size={60} />
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${m.color}-500/10 flex items-center justify-center text-${m.color}-500 shadow-inner`}>
                 <m.icon size={20} strokeWidth={2.5} />
              </div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic leading-none opacity-80">{m.label}</p>
                 <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none mt-1">{m.val}</h4>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Main Table */}
      <GlassTable 
         columns={[
           {
             header: 'PERSONNEL_PROFILE',
             accessor: 'name',
             render: (row) => (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                     <UserIcon size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9.5px] font-black text-[var(--text-primary)] uppercase italic leading-none tracking-tighter">{row.name}</span>
                     <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mt-1.5 italic leading-none opacity-80">{row.phone}</span>
                  </div>
               </div>
             )
           },
           {
             header: 'NODE_ALLOCATION',
             accessor: 'vehicleId',
             render: (row) => {
               const vehicle = vehicles.find(v => (v._id || v.id) === row.vehicleId);
               return vehicle ? (
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-500 shadow-inner">
                       <Truck size={14} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-emerald-500 text-[9.5px] font-black tracking-tighter italic leading-none">{vehicle.plate || vehicle.licensePlate}</span>
                       <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase italic tracking-[0.2em] mt-1.5 leading-none opacity-80">{vehicle.model}</span>
                    </div>
                 </div>
               ) : (
                 <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] italic opacity-60">NULL_ALLOCATION</span>
               );
             }
           },
           {
             header: 'SUBSCRIPTION_TIER',
             accessor: 'subscriptionPlan',
             render: (row) => (
               <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[8.5px] font-black text-[var(--text-primary)] uppercase italic tracking-[0.2em] leading-none">
                        {row.subscriptionPlan ? (row.subscriptionPlan.name || row.subscriptionPlan.label || 'Standard') : 'No Plan Selected'}
                     </span>
                     {row.subscriptionPlan && (
                        <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-80 leading-none">
                           Plan Price: ₹{row.subscriptionPlan.price || 0}
                        </span>
                     )}
                     <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-80 leading-none">
                        Deposit: ₹2800
                     </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                     {row.depositPaid ? (
                        <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1">
                           <CheckCircle2 size={8} className="text-emerald-500" />
                           <span className="text-[6px] font-black text-emerald-500 uppercase tracking-widest italic">Deposit Paid</span>
                        </div>
                     ) : (
                        <div className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                           <span className="text-[6px] font-black text-rose-500 uppercase tracking-widest italic">Deposit Pending</span>
                        </div>
                     )}
                  </div>
               </div>
             )
           },
           {
             header: 'PROTOCOL_STATUS',
             accessor: 'status',
             render: (row) => <StatusBadge status={row.status} />
           },
           {
             header: 'PAYMENT_DUE',
             accessor: 'subscriptionEnd',
             render: (row) => {
               if (!row.depositPaid) {
                  return <span className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-50">Awaiting Deposit</span>;
               }

               const isOverdue = row.subscriptionEnd && new Date(row.subscriptionEnd) < new Date();
               
               return (
                 <div className="flex flex-col gap-1.5">
                    {row.subscriptionEnd ? (
                      <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] italic leading-none ${isOverdue ? 'text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20' : 'text-amber-500'}`}>
                        <Calendar size={10} strokeWidth={2.5} />
                        DUE {new Date(row.subscriptionEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </div>
                    ) : (
                      <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest italic opacity-70">Plan Pending</span>
                    )}
                 </div>
               );
             }
           },
           {
             header: '',
             accessor: 'actions',
             render: (row) => {
               const isOverdue = row.subscriptionEnd && new Date(row.subscriptionEnd) < new Date();
               const needsPlanPayment = row.depositPaid && (!row.subscriptionEnd || isOverdue);

               return (
                 <div className="flex items-center gap-1.5">
                    {!row.depositPaid && (
                       <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             setModalConfig({ isOpen: true, type: 'deposit', rider: row });
                         }}
                         className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded border border-indigo-500/20 text-[7px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 italic">
                          Pay Deposit
                       </button>
                    )}
                    {needsPlanPayment && (
                       <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             setModalConfig({ isOpen: true, type: 'plan', rider: row });
                         }}
                         className="px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-500/20 text-[7px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 italic">
                          {row.subscriptionPlan ? 'Pay Plan' : 'Select Plan'}
                       </button>
                    )}
                 </div>
               );
             }
           }
         ]} 
         data={filteredSubscribers} 
         onRowClick={(row) => console.log('Viewing Personnel:', row)} 
      />

      <FranchisePaymentModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        rider={modalConfig.rider}
        onClose={() => setModalConfig({ isOpen: false, type: null, rider: null })}
        onSuccess={() => {
          setModalConfig({ isOpen: false, type: null, rider: null });
          fetchSubscribers();
        }}
      />
    </div>
  );
}
