import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Zap,
  Download,
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminDataStore } from '../store/adminDataStore';
import api from '../../../lib/axios';
import * as XLSX from 'xlsx';

const Gateways = [
  { name: 'RazorPay', status: 'active', speed: '99ms', type: 'Primary' },
  { name: 'PayU India', status: 'active', speed: '142ms', type: 'Secondary' },
  { name: 'Stripe', status: 'inactive', speed: '---', type: 'Global' },
];

export default function PaymentGatewayPage() {
  const { financeTransactions, financeStats, fetchFinanceData, approveQRPayment, rejectQRPayment } = useAdminDataStore();
  const [activeFilters, setActiveFilters] = React.useState({ range: 'All Time' });
  const [searchQuery, setSearchQuery] = useState('');
  const [dueAlerts, setDueAlerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const handleApprove = async (txnId) => {
    if (window.confirm("Are you sure you want to approve this payment? This will activate the rider's plan/deposit.")) {
      const res = await approveQRPayment(txnId);
      if (res?.success) alert("Payment approved successfully!");
      else alert(res?.message || "Failed to approve payment");
      fetchFinanceData(activeFilters);
    }
  };

  const handleReject = async (txnId) => {
    if (window.confirm("Are you sure you want to reject this payment?")) {
      const res = await rejectQRPayment(txnId);
      if (res?.success) alert("Payment rejected successfully!");
      else alert(res?.message || "Failed to reject payment");
      fetchFinanceData(activeFilters);
    }
  };

  const handleExport = () => {
    if (!financeTransactions || financeTransactions.length === 0) {
      alert("No data available to export");
      return;
    }

    const exportData = financeTransactions.map((txn) => ({
      'Ref Identity': txn.id,
      'Initiator': txn.user,
      'Method': txn.method,
      'Amount': txn.val,
      'Status': txn.status,
      'Sync Date': new Date(txn.date).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, `Payment_Gateway_Data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  const fetchDueAlerts = async () => {
    try {
      const res = await api.get('/admin/payments/due-alerts');
      if (res.data.success) {
        setDueAlerts(res.data.riders);
      }
    } catch (err) {
      console.error("Failed to fetch due alerts:", err);
    }
  };

  React.useEffect(() => {
    fetchFinanceData(activeFilters);
    fetchDueAlerts();
    const interval = setInterval(() => {
      fetchDueAlerts();
      fetchFinanceData(activeFilters);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeFilters]);

  React.useEffect(() => {
    fetchFinanceData(activeFilters);
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchFinanceData(newFilters);
    console.log('Payment Gateway Sync:', newFilters);
  };

  const filteredTransactions = financeTransactions.filter(txn =>
    (txn.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.user || '').toLowerCase().includes(searchQuery.toLowerCase())
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
              Payment <span className="text-emerald-500">Gateway</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Transaction Orchestrator & Settlement Control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OpsFilter onFilterChange={handleFilterChange} />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard title="Daily Volume" value={financeStats.dailyVolume} icon={Zap} color="emerald" subtitle="Gross Transacted" />
      </div>


      {/* Weekly Payment Due Alerts */}
      {dueAlerts.length > 0 && (
        <div className="bg-[var(--bg-secondary)] border-2 border-rose-500/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-rose-500/10 flex items-center justify-between bg-rose-500/5">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" />
              <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-wider leading-none italic">
                Weekly Payment Due ({dueAlerts.length})
              </h3>
            </div>
            <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest">Subscription Expired</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {dueAlerts.map((rider) => (
              <div key={rider._id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertCircle size={18} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                      {rider.name || 'Rider'}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                      {rider.phone} • {rider.planName} • Expired: {new Date(rider.expiredAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-rose-500">₹{rider.amount}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded">DUE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Ledger */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
          <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Transaction Payload Registry</h3>
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ref ID or Rider Name..."
              className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-64 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50 italic"
            />
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                {['Ref Identity', 'Initiator', 'Method', 'Amount', 'Status', 'Sync'].map((header) => (
                  <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {paginatedTransactions.map((txn) => (
                <tr key={txn.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                  <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{txn.id}</td>
                  <td className="py-2 px-4">
                    <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{txn.user}</span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={10} className="text-[var(--text-tertiary)]/50" />
                      <span className="font-medium text-[var(--text-tertiary)]">{txn.method}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 font-medium text-[var(--text-primary)]">{txn.val}</td>
                  <td className="py-2 px-4">
                    <div className={`inline-flex px-1.5 py-0.5 rounded font-medium border ${txn.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                        txn.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/10'
                      }`}>
                      {txn.status}
                    </div>
                    {/* Manual approval removed as requested */}
                  </td>
                  <td className="py-2 px-4 font-bold text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">
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
