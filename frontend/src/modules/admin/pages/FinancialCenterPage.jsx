import React from 'react';
import {
   Wallet,
   TrendingUp,
   ArrowUpRight,
   ArrowDownLeft,
   Activity,
   Search,
   Filter,
   Download,
   CreditCard,
   ShieldCheck,
   Signal,
   MoreVertical,
   Layers,
   ArrowRight
} from 'lucide-react';
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid
} from 'recharts';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

export default function FinancialCenterPage() {
   const { networkStats, revenueData, financeStats, financeTransactions, fetchFinanceData, fetchDashboardStats } = useAdminDataStore();
   const [activeFilters, setActiveFilters] = React.useState({ range: 'All Time' });
   const [matrixView, setMatrixView] = React.useState('weekly');

   React.useEffect(() => {
      fetchFinanceData(activeFilters);
      fetchDashboardStats(activeFilters); // For gross revenue
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchFinanceData(newFilters);
      fetchDashboardStats(newFilters);
      console.log('Financial Center Sync:', newFilters);
   };

   const chartData = matrixView === 'weekly' ? revenueData : (networkStats.monthlyRevenue || revenueData);
   const [searchQuery, setSearchQuery] = React.useState('');
   const [currentPage, setCurrentPage] = React.useState(1);
   const recordsPerPage = 10;

   const filteredTransactions = financeTransactions.filter(txn =>
      txn.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.hub?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.user?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
   const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Financial <span className="text-emerald-500">Center</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Revenue Optimization & Settled Nodes
               </p>
            </div>

            <div className="flex items-center gap-2">
               <OpsFilter onFilterChange={handleFilterChange} />
               <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
                  <input
                     type="text"
                     placeholder="Search Txn..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                  />
               </div>
            </div>
         </div>

         {/* Financial KPIs */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard title="Total Rev" value={`₹${(networkStats.grossRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" subtitle="Gross Delta" />
         </div>

         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between mb-6 border-b border-[var(--border-subtle)] pb-2">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     <TrendingUp size={16} />
                  </div>
                  <div>
                     <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Revenue Growth Matrix</h3>
                     <p className="text-[7.5px] font-black text-emerald-600 uppercase mt-1 tracking-widest italic animate-pulse leading-none">Net Alpha Flux Registry</p>
                  </div>
               </div>
               <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
                  <button
                     onClick={() => setMatrixView('weekly')}
                     className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${matrixView === 'weekly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--text-tertiary)] hover:text-emerald-500'}`}
                  >
                     Weekly
                  </button>
                  <button
                     onClick={() => setMatrixView('monthly')}
                     className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${matrixView === 'monthly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--text-tertiary)] hover:text-emerald-500'}`}
                  >
                     Monthly
                  </button>
               </div>
            </div>

            <div className="h-52 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.3} />
                     <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 7, fontWeight: 900, textTransform: 'uppercase' }}
                        dy={8}
                     />
                     <YAxis hide />
                     <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: '#10b981' }}
                        labelStyle={{ fontSize: '8px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                     />
                     <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Transaction Log */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     <CreditCard size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Corpus Transactions</h3>
               </div>
               <button className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 rounded-lg transition-all">
                  <Filter size={14} />
               </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Txn identity', 'Settlement Node', 'Quantum', 'Protocol', 'Status', 'Timestamp'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {paginatedTransactions.map((txn) => (
                        <tr key={txn.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                           <td className="py-2 px-4">
                              <div className="flex flex-col">
                                 <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{txn.id}</span>
                                 <span className="font-medium text-[var(--text-tertiary)]/50    mt-1">Registry Locked</span>
                              </div>
                           </td>
                           <td className="py-2 px-4 font-medium text-[var(--text-primary)]">{txn.hub}</td>
                           <td className="py-2 px-4 font-black text-emerald-400 drop-shadow-sm text-[13px]">{txn.val}</td>
                           <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{txn.method}</td>
                           <td className="py-2 px-4">
                              <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border ${txn.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                 txn.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                                    'bg-rose-500/10 text-rose-500 border-rose-500/10'
                                 }`}>
                                 {txn.status}
                              </div>
                           </td>
                           <td className="py-2 px-4 font-bold text-[12px] text-slate-400 whitespace-nowrap">
                              {new Date(txn.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                     Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredTransactions.length)} of {filteredTransactions.length} Entries
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
                                    className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded-lg text-[10px] font-black transition-all border ${currentPage === page
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
