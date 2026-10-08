import React, { useEffect, useState, useMemo } from 'react';
import { Users, Search, Bike, Calendar } from 'lucide-react';
import api from '../../../lib/axios';

export default function RiderHistoryPage() {
   const [history, setHistory] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const recordsPerPage = 10;

   useEffect(() => {
      fetchHistory();
   }, []);

   const fetchHistory = async () => {
      try {
         setIsLoading(true);
         const res = await api.get('/admin/rider-history');
         if (res.data.success) {
            setHistory(res.data.history);
         }
      } catch (err) {
         console.error('Failed to fetch rider history', err);
      } finally {
         setIsLoading(false);
      }
   };

   const filteredHistory = useMemo(() => {
      const q = searchQuery.toLowerCase();
      return history.filter(h => {
         const riderName = h.rider?.name?.toLowerCase() || '';
         const riderPhone = h.rider?.phone || '';
         const vehiclePlate = h.vehicle?.plate?.toLowerCase() || '';
         return riderName.includes(q) || riderPhone.includes(q) || vehiclePlate.includes(q);
      });
   }, [history, searchQuery]);

   const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
   const paginatedHistory = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Rider <span className="text-emerald-500">History</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Vehicle Assignment Registry
               </p>
            </div>

            <div className="flex items-center gap-2">
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
            </div>
         </div>

         {/* Main Table */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Assignment Records</h3>
               {isLoading && <div className="text-[7.5px] font-black text-emerald-500 uppercase italic animate-pulse">Fetching Data...</div>}
            </div>

            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Rider', 'Bank Details', 'Vehicle', 'Assignment Type', 'Start Date', 'End Date', 'Status'].map((header) => (
                           <th key={header} className="py-3 px-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {paginatedHistory.length > 0 ? paginatedHistory.map((h) => (
                        <tr key={h._id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <Users size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{h.rider?.name || 'N/A'}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{h.rider?.phone || 'N/A'}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              {h.rider?.bankDetails ? (
                                 <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase">{h.rider.bankDetails.bankName || 'N/A'}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">A/C: {h.rider.bankDetails.accountNumber || 'N/A'}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">IFSC: {h.rider.bankDetails.ifscCode || 'N/A'}</span>
                                    {h.rider.bankDetails.attachment && (
                                       <a href={h.rider.bankDetails.attachment} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-500 hover:underline">View Proof</a>
                                    )}
                                 </div>
                              ) : (
                                 <span className="text-[9px] font-bold text-[var(--text-tertiary)]">N/A</span>
                              )}
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)]">
                                    <Bike size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">{h.vehicle?.plate || 'Unknown'}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">{h.vehicle?.model || 'Unknown Model'}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
                                 {h.type || 'Manual'}
                              </span>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                 <Calendar size={12} />
                                 <span className="text-[10px] font-bold tracking-wide">
                                    {new Date(h.startTime).toLocaleDateString('en-GB')}
                                 </span>
                              </div>
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              {h.endTime ? (
                                 <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold tracking-wide">
                                       {new Date(h.endTime).toLocaleDateString('en-GB')}
                                    </span>
                                 </div>
                              ) : (
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                              )}
                           </td>
                           <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                 h.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                              }`}>
                                 {h.status || 'Active'}
                              </span>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan="6" className="py-8 text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest italic">
                              No history records found.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 0 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                     Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredHistory.length)} of {filteredHistory.length} Entries
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
      </div>
   );
}
