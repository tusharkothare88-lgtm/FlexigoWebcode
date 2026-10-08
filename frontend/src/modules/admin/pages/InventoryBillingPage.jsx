import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
   Boxes,
   Warehouse,
   AlertTriangle,
   ShoppingCart,
   FileText,
   UserCircle,
   History,
   Search,
   Filter,
   ArrowDownLeft,
   ChevronRight,
   ShieldCheck,
   PackageCheck,
   Building,
   Activity,
   Plus,
   Edit,
   Trash2,
   X,
   Wrench,
   Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';
import * as XLSX from 'xlsx';

export default function InventoryBillingPage() {
   const [searchParams, setSearchParams] = useSearchParams();
   const {
      inventory,
      billing,
      parts,
      inventoryStats,
      fetchInventoryData,
      fetchParts,
      addBill,
      updateBill,
      removeBill,
      addPart,
      updatePart,
      removePart,
      fetchRiders,
      billingPagination,
      exportFullInventoryData
   } = useAdminDataStore();
   const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });
   const initialPage = parseInt(searchParams.get('page')) || 1;
   const [billingPage, setBillingPage] = useState(initialPage);

   useEffect(() => {
      setSearchParams(prev => {
         const newParams = new URLSearchParams(prev);
         if (billingPage > 1) {
            newParams.set('page', billingPage);
         } else {
            newParams.delete('page');
         }
         return newParams;
      });
   }, [billingPage, setSearchParams]);

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalType, setModalType] = useState('add');
   const [selectedBill, setSelectedBill] = useState(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [billToDelete, setBillToDelete] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

   const [billForm, setBillForm] = useState({
      vehicleNo: '',
      chasisNo: '',
      partId: '',
      partsRepair: '',
      riderName: '',
      amount: '',
      supplier: ''
   });

   const [isPartsModalOpen, setIsPartsModalOpen] = useState(searchParams.get('view') === 'parts');
   const [newPartName, setNewPartName] = useState('');
   const [editingPartId, setEditingPartId] = useState(null);
   const [editingPartName, setEditingPartName] = useState('');
   const [isPartSubmitting, setIsPartSubmitting] = useState(false);

   useEffect(() => {
      fetchInventoryData({ ...activeFilters, page: billingPage, limit: 10 });
   }, [activeFilters, billingPage]);

   useEffect(() => {
      fetchParts();
      fetchRiders();
      if (searchParams.get('modal') === 'add') {
         handleOpenAdd();
      }
      if (searchParams.get('view') === 'parts') {
         setIsPartsModalOpen(true);
      }
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      setBillingPage(1);
   };

   const handleExportData = async () => {
      if (isExporting) return;
      setIsExporting(true);
      try {
         const data = await exportFullInventoryData();
         if (data && data.success) {
            const wb = XLSX.utils.book_new();

            // Parts Sheet
            if (data.inventory && data.inventory.length > 0) {
               const wsParts = XLSX.utils.json_to_sheet(data.inventory);
               XLSX.utils.book_append_sheet(wb, wsParts, "Inventory");
            }

            // Billing Sheet
            if (data.billing && data.billing.length > 0) {
               const wsBilling = XLSX.utils.json_to_sheet(data.billing);
               XLSX.utils.book_append_sheet(wb, wsBilling, "Repair Bills");
            }

            XLSX.writeFile(wb, `Inventory_Billing_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
         }
      } catch (error) {
         console.error("Export failed", error);
      } finally {
         setIsExporting(false);
      }
   };

   const handleOpenAdd = () => {
      setBillForm({
         vehicleNo: '',
         chasisNo: '',
         partId: '',
         partsRepair: '',
         riderName: '',
         amount: '',
         supplier: 'Internal',
         status: 'pending'
      });
      setModalType('add');
      setIsModalOpen(true);
      setSearchParams({ modal: 'add' });
   };

   const handleOpenEdit = (bill) => {
      setSelectedBill(bill);
      setBillForm({
         vehicleNo: bill.vehicleNo,
         chasisNo: bill.chasisNo,
         partId: bill.partId || '',
         partsRepair: bill.partsRepair,
         riderName: bill.riderName || '',
         amount: bill.amount,
         supplier: bill.supplier,
         status: bill.status || 'pending'
      });
      setModalType('edit');
      setIsModalOpen(true);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
         if (modalType === 'add') {
            await addBill(billForm);
         } else {
            await updateBill(selectedBill._id, billForm);
         }
         setIsModalOpen(false);
         setSearchParams({});
      } catch (error) {
         console.error("Bill Save Error:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDeleteClick = (bill) => {
      setBillToDelete(bill);
      setIsDeleteModalOpen(true);
   };

   const handleConfirmDelete = async () => {
      if (billToDelete) {
         await removeBill(billToDelete._id);
         setBillToDelete(null);
         setIsDeleteModalOpen(false);
      }
   };

   const handleCloseDeleteModal = () => {
      setBillToDelete(null);
      setIsDeleteModalOpen(false);
   };

   const handleOpenPartsModal = () => {
      setIsPartsModalOpen(true);
      setSearchParams({ view: 'parts' });
   };

   const handleClosePartsModal = () => {
      setIsPartsModalOpen(false);
      setSearchParams({});
      setNewPartName('');
      setEditingPartId(null);
      setEditingPartName('');
   };

   const handleAddPartSubmit = async (e) => {
      e.preventDefault();
      if (!newPartName.trim() || isPartSubmitting) return;
      setIsPartSubmitting(true);
      try {
         await addPart({ name: newPartName.trim() });
         setNewPartName('');
      } catch (error) {
         console.error("Failed to add part:", error);
      } finally {
         setIsPartSubmitting(false);
      }
   };

   const handleUpdatePartSubmit = async (id) => {
      if (!editingPartName.trim()) return;
      try {
         await updatePart(id, { name: editingPartName.trim() });
         setEditingPartId(null);
         setEditingPartName('');
      } catch (error) {
         console.error("Failed to update part:", error);
      }
   };

   const handleDeletePart = async (id) => {
      try {
         await removePart(id);
      } catch (error) {
         console.error("Failed to delete part:", error);
      }
   };

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Inventory & <span className="text-emerald-500">Billing</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Spare Parts & Supplier Payments Hub
               </p>
            </div>

            <div className="flex items-center gap-2">
               <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isExporting ? <div className="w-3.5 h-3.5 border-2 border-[var(--text-tertiary)] border-t-emerald-500 rounded-full animate-spin" /> : <Download size={14} />}
                  Export Data
               </button>
               <OpsFilter onFilterChange={handleFilterChange} />
            </div>
         </div>

         {/* KPI Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard title="Spare Items" value={inventoryStats.totalItems} icon={Boxes} color="emerald" subtitle="On Grid Alpha" />
            <AdminStatCard title="Restock Soon" value={inventoryStats.restockCount} icon={AlertTriangle} color="amber" subtitle="Threshold Risk" />
            <AdminStatCard title="Stock Value" value={inventoryStats.stockValue} icon={PackageCheck} color="blue" subtitle="Asset Corpus" />
            <AdminStatCard title="Unpaid Bills" value={inventoryStats.unpaidAmount} icon={FileText} color="emerald" subtitle="Supplier Delta" />
         </div>

         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
               <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Parts Payload Tracker</h3>
               <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
                  <input
                     type="text"
                     placeholder="Search SKU..."
                     className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                  />
               </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['SKU Identity', 'Category', 'Stock Level', 'Min Threshold', 'Supplier Node', 'Status'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {inventory.map((item) => (
                        <tr key={item.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                           <td className="py-2 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{item.name}</span>
                                 <span className="font-medium text-[var(--text-tertiary)]/50   mt-1">{item.id}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4 font-medium text-[var(--text-tertiary)]">{item.category}</td>
                           <td className="py-2 px-4 font-medium text-[var(--text-primary)]">{item.stock} Units</td>
                           <td className="py-2 px-4 font-medium text-[var(--text-tertiary)] opacity-50">{item.minLevel}</td>
                           <td className="py-2 px-4  font-medium text-[var(--text-primary)]">{item.supplier}</td>
                           <td className="py-2 px-4">
                              <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${item.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                                 }`}>
                                 {item.status}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Billing Section */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                     <FileText size={16} />
                  </div>
                  <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Vehicle Repair Bills</h3>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleOpenPartsModal}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                     <Wrench size={14} /> Manage Parts
                  </button>
                  <button
                     onClick={handleOpenAdd}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                     <Plus size={14} /> Add Bill
                  </button>
               </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Bill ID', 'Vehicle Info', 'Service Details', 'Amount', 'Actions'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {billing.map((bill) => (
                        <tr key={bill._id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                           <td className="py-2 px-4 font-medium text-[var(--text-tertiary)]">
                              {bill.id}
                           </td>
                           <td className="py-2 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="font-medium text-[var(--text-primary)] uppercase tracking-tighter italic">{bill.vehicleNo}</span>
                                 <span className="text-[10px] text-[var(--text-tertiary)] opacity-50">{bill.chasisNo}</span>
                                 <span className="text-[10px] text-amber-500/80 italic mt-1 font-semibold leading-none">Rider/Cmnt: {bill.riderName || 'N/A'}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="font-bold text-emerald-500 text-sm tracking-tight">{bill.partName || 'N/A'}</span>
                                 <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{bill.partsRepair}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4 font-black text-emerald-500">
                              <div className="flex flex-col gap-1.5">
                                 <span>{bill.formattedAmount}</span>
                                 <label className="flex items-center gap-1.5 cursor-pointer group/label w-fit">
                                    <input 
                                       type="checkbox" 
                                       checked={bill.status === 'paid'}
                                       onChange={async (e) => {
                                          const newStatus = e.target.checked ? 'paid' : 'pending';
                                          await updateBill(bill._id, { status: newStatus });
                                       }}
                                       className="w-3.5 h-3.5 rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500/20 focus:ring-1 transition-all cursor-pointer accent-emerald-500"
                                    />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] group-hover/label:text-[var(--text-primary)] transition-colors">
                                       {bill.status === 'paid' ? 'Paid' : 'Not Paid'}
                                    </span>
                                 </label>
                              </div>
                           </td>

                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                 <button
                                    onClick={() => handleOpenEdit(bill)}
                                    className="p-1 text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-all"
                                 >
                                    <Edit size={12} />
                                 </button>
                                 <button
                                    onClick={() => handleDeleteClick(bill)}
                                    className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                                 >
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {/* Pagination Controls */}
            {billingPagination && billingPagination.totalPages > 1 && (
               <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                     Showing {((billingPagination.page - 1) * billingPagination.limit) + 1} to {Math.min(billingPagination.page * billingPagination.limit, billingPagination.total)} of {billingPagination.total} Entries
                  </span>
                  <div className="flex items-center gap-1.5">
                     <button
                        disabled={billingPagination.page === 1}
                        onClick={() => setBillingPage(p => p - 1)}
                        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Prev
                     </button>
                     {Array.from({ length: billingPagination.totalPages }, (_, i) => i + 1).map(page => {
                        if (page === 1 || page === billingPagination.totalPages || (page >= billingPagination.page - 1 && page <= billingPagination.page + 1)) {
                           return (
                              <button
                                 key={page}
                                 onClick={() => setBillingPage(page)}
                                 className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${billingPagination.page === page ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                              >
                                 {page}
                              </button>
                           );
                        }
                        if (page === billingPagination.page - 2 || page === billingPagination.page + 2) {
                           return <span key={page} className="text-[var(--text-tertiary)] text-[10px] font-bold">...</span>;
                        }
                        return null;
                     })}
                     <button
                        disabled={billingPagination.page === billingPagination.totalPages}
                        onClick={() => setBillingPage(p => p + 1)}
                        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Next
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* Bill Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                              {modalType === 'add' ? 'Register' : 'Modify'} <span className="text-emerald-500">Repair Bill</span>
                           </h2>
                           <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">SECTION: REPAIR_AUDIT_LOG_V1</p>
                        </div>
                        <button onClick={() => { setIsModalOpen(false); setSearchParams({}); }} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg text-[var(--text-tertiary)]">
                           <X size={18} />
                        </button>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Vehicle Number</label>
                              <input
                                 required
                                 value={billForm.vehicleNo}
                                 onChange={(e) => setBillForm({ ...billForm, vehicleNo: e.target.value })}
                                 placeholder="e.g. DL 1S AB 1234"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)] uppercase"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Chasis Number</label>
                              <input
                                 required
                                 value={billForm.chasisNo}
                                 onChange={(e) => setBillForm({ ...billForm, chasisNo: e.target.value })}
                                 placeholder="CH-XXXXXXXX"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)] uppercase"
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Item Name</label>
                           <select
                              required
                              value={billForm.partId}
                              onChange={(e) => setBillForm({ ...billForm, partId: e.target.value })}
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)] cursor-pointer"
                           >
                              <option value="" disabled>Select Part</option>
                              {parts.map(part => (
                                 <option key={part._id || part.id} value={part._id || part.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                                    {part.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description</label>
                           <input
                              required
                              type="text"
                              value={billForm.partsRepair}
                              onChange={(e) => setBillForm({ ...billForm, partsRepair: e.target.value })}
                              placeholder="e.g. Battery Replacement, Brake Pad sync"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Rider Name / Comments</label>
                           <input
                              type="text"
                              value={billForm.riderName}
                              onChange={(e) => setBillForm({ ...billForm, riderName: e.target.value })}
                              placeholder="e.g. Sanoj Yadav or Custom Comment"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Amount (₹)</label>
                           <input
                              required
                              type="number"
                              value={billForm.amount}
                              onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                              placeholder="0.00"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-emerald-500"
                           />
                        </div>

                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                 <span>PROCESSING...</span>
                              </div>
                           ) : (
                              <>
                                 <Activity size={14} /> {modalType === 'add' ? 'Create Repair Bill' : 'Update Record'}
                              </>
                           )}
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Manage Parts Modal */}
         <AnimatePresence>
            {isPartsModalOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                              Manage <span className="text-emerald-500">Spare Parts</span>
                           </h2>
                           <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">SECTION: SPARE_PARTS_REGISTRY_V1</p>
                        </div>
                        <button onClick={handleClosePartsModal} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg text-[var(--text-tertiary)]">
                           <X size={18} />
                        </button>
                     </div>

                     {/* Add Part Form */}
                     <form onSubmit={handleAddPartSubmit} className="flex gap-2 items-center">
                        <input
                           required
                           value={newPartName}
                           onChange={(e) => setNewPartName(e.target.value)}
                           placeholder="ENTER NEW PART NAME..."
                           className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                        />
                        <button
                           type="submit"
                           disabled={isPartSubmitting}
                           className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md h-full"
                        >
                           <Plus size={12} /> ADD
                        </button>
                     </form>

                     {/* Parts List */}
                     <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar border-t border-[var(--border-subtle)]/50 pt-4">
                        {parts.length === 0 ? (
                           <div className="text-center py-6 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                              No parts found. Add one above!
                           </div>
                        ) : (
                           parts.map((part) => (
                              <div
                                 key={part._id || part.id}
                                 className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)] rounded-xl group/item hover:border-emerald-500/30 transition-all"
                              >
                                 {editingPartId === (part._id || part.id) ? (
                                    <div className="flex-1 flex gap-2 items-center">
                                       <input
                                          required
                                          value={editingPartName}
                                          onChange={(e) => setEditingPartName(e.target.value)}
                                          className="flex-1 px-3 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                                       />
                                       <button
                                          onClick={() => handleUpdatePartSubmit(part._id || part.id)}
                                          className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                       >
                                          SAVE
                                       </button>
                                       <button
                                          onClick={() => { setEditingPartId(null); setEditingPartName(''); }}
                                          className="px-2.5 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-[var(--bg-tertiary)]/80 border border-[var(--border-subtle)] transition-all"
                                       >
                                          CANCEL
                                       </button>
                                    </div>
                                 ) : (
                                    <>
                                       <span className="text-[10px] font-black tracking-widest text-[var(--text-primary)] pl-1">
                                          {part.name}
                                       </span>
                                       <div className="flex items-center gap-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                          <button
                                             onClick={() => { setEditingPartId(part._id || part.id); setEditingPartName(part.name); }}
                                             className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                          >
                                             <Edit size={12} />
                                          </button>
                                          <button
                                             onClick={() => handleDeletePart(part._id || part.id)}
                                             className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                          >
                                             <Trash2 size={12} />
                                          </button>
                                       </div>
                                    </>
                                 )}
                              </div>
                           ))
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
         
         {/* Delete Confirmation Modal */}
         <AnimatePresence>
            {isDeleteModalOpen && (
               <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col p-8 text-center items-center shadow-2xl"
                  >
                     <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                        <AlertTriangle size={32} className="text-rose-500" />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-3">Confirm Deletion</h3>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">
                        Are you sure you want to permanently delete this record? This action cannot be undone.
                     </p>
                     
                     <div className="flex gap-3 w-full">
                        <button
                           onClick={handleCloseDeleteModal}
                           className="flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleConfirmDelete}
                           className="flex-1 py-3.5 px-4 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30"
                        >
                           Delete
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}

