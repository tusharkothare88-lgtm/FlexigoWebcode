import React from 'react';
import {
   Users,
   CreditCard,
   Search,
   Download,
   ArrowUpRight,
   User,
   Activity,
   ShieldCheck,
   Bike,
   Trash2,
   AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';
import api from '../../../lib/axios';

export default function RiderReportPage() {
   const { riderReport, fetchRiderReport, kycRecords, fetchKycRecords, isLoading } = useAdminDataStore();
   const [searchQuery, setSearchQuery] = React.useState('');
   const [activeFilters, setActiveFilters] = React.useState({ range: 'All Time' });
   const [currentPage, setCurrentPage] = React.useState(1);
   const recordsPerPage = 10;
   const [deleteConfirm, setDeleteConfirm] = React.useState({ isOpen: false, id: null, name: '' });

   React.useEffect(() => {
      fetchRiderReport({ range: 'All Time' });
      fetchKycRecords();
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchRiderReport(newFilters);
      fetchKycRecords();
   };

   const handleExport = () => {
      const headers = ['Name', 'Phone', 'Source Franchise', 'Vehicle Number', 'Active Plan', 'Total Payments', 'Wallet Balance', 'Status'];
      const csvContent = [
         headers.join(','),
         ...filteredReport.map(r => [
            r.name,
            r.phone,
            r.franchiseName || 'FLEXIGO',
            r.vehicleNumber,
            r.activePlan,
            r.totalPayments,
            r.walletBalance,
            r.status
         ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rider_detailed_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
   };

   const filteredReport = React.useMemo(() => {
      const q = searchQuery.toLowerCase();
      return (riderReport || []).filter(r => {
         return (
            (r.name?.toLowerCase() || '').includes(q) ||
            (r.phone || '').includes(q) ||
            (r.vehicleNumber?.toLowerCase() || '').includes(q) ||
            (r.activePlan?.toLowerCase() || '').includes(q)
         );
      });
   }, [riderReport, searchQuery]);

   const totalPages = Math.ceil(filteredReport.length / recordsPerPage);
   const paginatedReport = filteredReport.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Rider <span className="text-emerald-500">Detailed Report</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Comprehensive Rider, Vehicle & Payment Sync
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
                     placeholder="Search Rider/Vehicle..."
                     className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-48 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50 italic"
                  />
               </div>
               <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
               >
                  <Download size={12} /> Export CSV
               </button>
            </div>
         </div>

         {/* Main Report Table */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Rider Transactional Registry</h3>
               {isLoading && <div className="text-[7.5px] font-black text-emerald-500 uppercase italic animate-pulse">Fetching Report...</div>}
            </div>

            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Rider Details', 'Source', 'Vehicle Info', 'Active Plan', 'Distance (KM)', 'Total Payments', 'Wallet', 'Status', 'Actions'].map((header) => (
                           <th key={header} className="py-3 px-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {paginatedReport.map((r) => (
                        <tr key={r.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <User size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{r.name}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{r.phone}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                 <ShieldCheck size={12} className={r.franchiseName && r.franchiseName !== 'FLEXIGO' ? 'text-blue-400' : 'text-emerald-500'} />
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${r.franchiseName && r.franchiseName !== 'FLEXIGO' ? 'text-blue-400' : 'text-emerald-500'}`}>
                                    {r.franchiseName || 'FLEXIGO'}
                                 </span>
                              </div>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                 <Bike size={12} className="text-emerald-500" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{r.vehicleNumber}</span>
                                    <span className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">{r.vehicleModel}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-3 px-4">
                              <div className="inline-flex px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                                 {r.activePlan}
                              </div>
                           </td>
                           <td className="py-3 px-4">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black text-blue-500">{r.totalDistance?.toFixed(2) || '0.00'} KM</span>
                                 <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Total Drive</span>
                              </div>
                           </td>
                           <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-black text-emerald-400 drop-shadow-md">₹{(r.totalPayments || 0).toLocaleString()}</span>
                                    {r.latestPaymentMethod && (
                                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                          Via {r.latestPaymentMethod.replace('_', ' ')}
                                       </span>
                                    )}
                                 </div>
                                 <div className="flex flex-col gap-1 mt-0.5">
                                    <span className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Total Successful</span>
                                    {r.recentPayments && r.recentPayments.length > 0 && (
                                       <span className="text-[10px] font-bold text-slate-500 tracking-wider bg-slate-500/10 px-2 py-1 rounded w-fit border border-slate-500/20">
                                          ID: {r.recentPayments[0].txnId} • {new Date(r.recentPayments[0].date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                       </span>
                                    )}
                                    {r.depositPaid && (
                                       <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase tracking-widest border border-blue-500/20 w-fit" title="Deposit Paid">
                                          + Dep: ₹{r.depositAmount || 'Paid'}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="py-3 px-4">
                              <span className={`text-[10px] font-black ${r.walletBalance < 500 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                                 ₹{r.walletBalance.toLocaleString()}
                              </span>
                           </td>
                           <td className="py-3 px-4">
                              <div className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${['active', 'approved'].includes(r.status) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                 ['suspended', 'rejected'].includes(r.status) ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                                    'bg-amber-500/10 text-amber-500 border-amber-500/10'
                                 }`}>
                                 {r.status}
                              </div>
                           </td>
                           <td className="py-3 px-4">
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ isOpen: true, id: r.id, name: r.name });
                                 }}
                                 className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                 title="Delete Rider"
                              >
                                 <Trash2 size={12} />
                              </button>
                           </td>
                        </tr>
                     ))}
                     {filteredReport.length === 0 && !isLoading && (
                        <tr>
                           <td colSpan="8" className="py-12 text-center">
                              <div className="flex flex-col items-center gap-2 opacity-50">
                                 <Activity size={24} className="text-[var(--text-tertiary)]" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">No Records Found Registry</span>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                     Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredReport.length)} of {filteredReport.length} Entries
                  </span>
                  <div className="flex gap-2 items-center">
                     <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)] transition-all text-[var(--text-primary)]"
                     >
                        Prev
                     </button>
                     <div className="flex gap-1 items-center">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                           .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                           .map((page, index, array) => (
                              <React.Fragment key={page}>
                                 {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="text-[10px] font-black text-[var(--text-tertiary)] px-1">...</span>
                                 )}
                                 <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded-lg text-[10px] font-black transition-all border ${
                                       currentPage === page 
                                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                          : 'border-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]'
                                    }`}
                                 >
                                    {page}
                                 </button>
                              </React.Fragment>
                           ))}
                     </div>
                     <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)] transition-all text-[var(--text-primary)]"
                     >
                        Next
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* Delete Confirmation Modal */}
         <AnimatePresence>
            {deleteConfirm.isOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 relative overflow-hidden"
                  >
                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                           <AlertCircle size={32} />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Confirm Deletion</h3>
                           <p className="text-[10px] text-[var(--text-tertiary)] font-bold mt-1 uppercase tracking-widest leading-relaxed">
                              Are you sure you want to permanently delete rider {deleteConfirm.name}? This action cannot be undone.
                           </p>
                        </div>
                        <div className="flex w-full gap-3 pt-4">
                           <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })} className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all active:scale-95">Cancel</button>
                           <button onClick={async () => {
                              try {
                                 const res = await api.delete(`/admin/kyc/${deleteConfirm.id}`);
                                 if (res.data.success) {
                                    fetchRiderReport({ range: 'All Time' });
                                    fetchKycRecords();
                                    setDeleteConfirm({ isOpen: false, id: null, name: '' });
                                 } else {
                                    alert(res.data.message || 'Deletion failed');
                                 }
                              } catch(err) {
                                 alert('Deletion failed: ' + (err.response?.data?.message || err.message));
                              }
                           }} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95 shadow-rose-500/20">Delete</button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
