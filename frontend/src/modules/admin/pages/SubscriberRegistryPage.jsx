import React from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Search, 
  Filter, 
  MapPin, 
  Activity, 
  Mail, 
  Phone, 
  CreditCard,
  Target,
  ArrowUpRight,
  MoreVertical,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

export default function SubscriberRegistryPage() {
  const { subscribers, subscriberStats, fetchSubscriberData } = useAdminDataStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });

  React.useEffect(() => {
    fetchSubscriberData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchSubscriberData(newFilters);
    console.log('Subscriber Registry Sync:', newFilters);
  };

  const handleExport = () => {
    const headers = ['Phone', 'Email', 'Persona', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscribers.map(s => [s.phone, s.email, s.persona, s.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscribers = (subscribers || []).filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.name?.toLowerCase() || '').includes(q) || 
      (s.phone || '').includes(q) ||
      (s.email?.toLowerCase() || '').includes(q) ||
      (s.persona?.toLowerCase() || '').includes(q) ||
      (s.vehiclePlate?.toLowerCase() || '').includes(q) ||
      (s.id?.toLowerCase() || '').includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Subscriber <span className="text-emerald-500">Registry</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Registered Users & Network Nodes
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
                 placeholder="Search Persona/ID/Phone/Vehicle No..." 
                 className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-48 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50 italic"
               />
            </div>
            <button 
               onClick={handleExport}
               className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
               Full Export
            </button>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AdminStatCard title="Total Users" value={subscriberStats.totalUsers} icon={Users} color="emerald" subtitle="Active nodes" />
         <AdminStatCard title="Approved Riders" value={subscriberStats.dailyRiders} icon={UserCheck} color="blue" subtitle="Verified Fleet" />
         <AdminStatCard title="KYC Verified" value={subscriberStats.kycVerified} icon={ShieldCheck} color="emerald" subtitle="Identity sync" />
      </div>

      {/* Main Registry Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
         <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Subscriber Database Registry</h3>
            <div className="text-[7.5px] font-black text-emerald-500 uppercase italic animate-pulse">Master Sync Active</div>
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
               <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                     {['User identity', 'Contact Path', 'Assigned Persona', 'Status'].map((header) => (
                        <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredSubscribers.map((user) => (
                     <tr key={user.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                        <td className="py-2 px-4 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{user.name || user.phone}</span>
                           </div>
                        </td>
                        <td className="py-2 px-4">
                           <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-[var(--text-primary)] lowercase group-hover:text-emerald-500 transition-colors">{user.email}</span>
                              <span className="font-medium text-[var(--text-tertiary)]/50">{user.phone}</span>
                           </div>
                        </td>
                        <td className="py-2 px-4 font-medium text-[var(--text-primary)] capitalize">{user.persona}</td>
                        <td className="py-2 px-4">
                           <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${
                              user.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 
                              user.status === 'active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                              user.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/10'
                           }`}>
                              {user.status}
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
