import React, { useEffect } from 'react';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCcw, 
  Gavel, 
  FileText, 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2,
  Calendar,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

export default function CompliancePage() {
  const { complianceRecords, complianceStats, fetchComplianceData } = useAdminDataStore();
  const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });

  useEffect(() => {
    fetchComplianceData(activeFilters);
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchComplianceData(newFilters);
    console.log('Compliance Sync:', newFilters);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Compliance <span className="text-emerald-500">Automation</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Regulatory Guard & Settlement
            </p>
         </div>
         
         <div className="flex items-center gap-2">
            <OpsFilter onFilterChange={handleFilterChange} />
         </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <AdminStatCard title="Active Fines" value={complianceStats.activeFines} icon={Gavel} color="rose" subtitle="Unpaid" />
         <AdminStatCard title="Auto Settled" value={complianceStats.autoSettled} icon={IndianRupee} color="emerald" subtitle="MTD Pay" />
         <AdminStatCard title="Compliance" value={complianceStats.complianceRate} icon={ShieldCheck} color="blue" subtitle="Asset Health" />
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
         <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                  <ClipboardCheck size={16} />
               </div>
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none">Vehicle Fine Registry</h3>
            </div>
            <div className="relative group">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Asset..." 
                 className="pl-8 pr-3 py-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none w-32 transition-all text-[var(--text-primary)]"
               />
            </div>
         </div>
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
               <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                     {['ID', 'Asset', 'Issue Type', 'Amount', 'RTO', 'Status'].map((header) => (
                        <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-subtle)]">
                  {complianceRecords.map((chl) => (
                     <tr key={chl.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                        <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{chl.id}</td>
                        <td className="py-2 px-4 font-medium text-[var(--text-primary)]">{chl.vehicle}</td>
                        <td className="py-2 px-4">
                           <div className="flex flex-col">
                              <span className="font-medium text-[var(--text-primary)]   leading-tight">{chl.type}</span>
                              <span className="font-medium text-[var(--text-tertiary)]   mt-0.5">{new Date(chl.date).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="py-2 px-4 font-medium text-rose-500">{chl.amount}</td>
                        <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{chl.rto}</td>
                        <td className="py-2 px-4">
                           <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border ${
                              chl.status === 'auto-paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 
                              chl.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 
                              'bg-rose-500/10 text-rose-500 border-rose-500/10'
                           }`}>
                              {chl.status}
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
