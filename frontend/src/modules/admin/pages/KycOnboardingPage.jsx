import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   UserCheck,
   FileText,
   Camera,
   CheckCircle,
   Clock,
   Search,
   Filter,
   Eye,
   Download,
   AlertCircle,
   X,
   Zap,
   ShieldCheck,
   UserX,
   MoreVertical,
   Check,
   User,
   ArrowRight,
   ChevronRight,
   Activity,
   Save,
   Paperclip,
   Trash2
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import api from '../../../lib/axios';
import { useAdminDataStore } from '../store/adminDataStore';

export default function KycOnboardingPage() {
   const { kycRecords, fetchKycRecords, updateKycStatus, assignVehicle, toggleBlockKycRecord, vehicles, fetchAllVehicles } = useAdminDataStore();
   const [activeTab, setActiveTab] = useState(() => localStorage.getItem('kyc_active_tab') || 'all');
   const [selectedRecord, setSelectedRecord] = useState(() => {
      const saved = localStorage.getItem('kyc_selected_record');
      return saved ? JSON.parse(saved) : null;
   });
   const [isDetailModalOpen, setIsDetailModalOpen] = useState(() => localStorage.getItem('kyc_modal_open') === 'true');
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const [assignmentData, setAssignmentData] = useState({ vehiclePlate: '', riderPhone: '', riderName: '' });
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editData, setEditData] = useState({ name: '', phone: '', status: '' });
   const [editRecordId, setEditRecordId] = useState(null);
   const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('kyc_search_query') || '');
   const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });
   const [referralAmount, setReferralAmount] = useState('');
   const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedFranchiseRiders, setSelectedFranchiseRiders] = useState({});
   const recordsPerPage = 10;

   React.useEffect(() => {
      localStorage.setItem('kyc_active_tab', activeTab);
   }, [activeTab]);

   React.useEffect(() => {
      localStorage.setItem('kyc_search_query', searchQuery);
   }, [searchQuery]);

   React.useEffect(() => {
      localStorage.setItem('kyc_modal_open', isDetailModalOpen);
      if (selectedRecord) localStorage.setItem('kyc_selected_record', JSON.stringify(selectedRecord));
      else localStorage.removeItem('kyc_selected_record');
   }, [isDetailModalOpen, selectedRecord]);

   React.useEffect(() => {
      fetchKycRecords();
      fetchAllVehicles();
   }, []);

   React.useEffect(() => {
      if (selectedRecord && kycRecords.length > 0) {
         const freshRecord = kycRecords.find(r => {
            const rId = r.id || r._id;
            const sId = selectedRecord.id || selectedRecord._id;
            return rId && sId && rId.toString() === sId.toString();
         });
         if (freshRecord) {
            setSelectedRecord(freshRecord);
         }
      }
   }, [kycRecords]);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchKycRecords(newFilters);
      console.log('KYC Onboarding Sync:', newFilters);
   };

   const filteredRecords = kycRecords.filter(r => {
      let matchesTab = activeTab === 'all';
      if (activeTab === 'drivers') {
         matchesTab = r.role.toLowerCase() === 'rider' || r.role.toLowerCase() === 'driver';
      } else if (activeTab === 'franchises') {
         matchesTab = r.role.toLowerCase() === 'franchise';
      }

      const matchesSearch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (r._id || r.id || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
         (r.vehiclePlate || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
   });

   const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
   const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

   const handleAction = async (id, newStatus) => {
      const payload = {
         status: newStatus,
         referenceName: selectedRecord?.details?.referenceName,
         referenceNumber: selectedRecord?.details?.referenceNumber,
         referenceName2: selectedRecord?.details?.referenceName2,
         referenceNumber2: selectedRecord?.details?.referenceNumber2
      };
      await updateKycStatus(id, payload);
      if (selectedRecord && (selectedRecord.id === id || selectedRecord._id === id)) {
         setSelectedRecord(prev => ({
            ...prev,
            status: newStatus,
            details: {
               ...prev.details,
               referenceName: payload.referenceName,
               referenceNumber: payload.referenceNumber,
               referenceName2: payload.referenceName2,
               referenceNumber2: payload.referenceNumber2
            }
         }));
      }
   };

   const openDetails = (record) => {
      setSelectedRecord(record);
      setIsDetailModalOpen(true);
   };

   const handleExport = () => {
      const headers = ['Record ID', 'Identity', 'Phone', 'Platform', 'Vehicle No', 'Personal', 'Start Date', 'Registry Date', 'Status'];

      const rows = filteredRecords.map(r => [
         r.id || r._id || '',
         r.name || '',
         r.phone || '',
         r.onboardedPlatform || '',
         r.vehiclePlate || 'N/A',
         r.role || '',
         r.adminAssignedStartDate ? r.adminAssignedStartDate.split('T')[0] : '',
         r.date ? new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '',
         r.status || ''
      ]);

      const csvContent = [
         headers.join(','),
         ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `kyc_onboarding_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Identity <span className="text-emerald-500">Terminal</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  KYC Verification & Network Integrity
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
                     placeholder="Search Name/Vehicle No/ID..."
                     className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-56 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                  />
               </div>
               <button className="p-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 transition-all">
                  <Filter size={14} />
               </button>
               <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-[#10b981] hover:bg-[#0f9f6e] text-white font-bold rounded-lg flex items-center gap-1.5 text-[9px] uppercase tracking-widest active:scale-95 transition-all"
               >
                  <Download size={12} className="stroke-[3px]" /> EXPORT CSV
               </button>
            </div>
         </div>

         {/* KPI Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard title="Requests" value={filteredRecords.length} icon={UserCheck} color="emerald" subtitle={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Applications`} />
            <AdminStatCard title="Pending" value={filteredRecords.filter(r => r.status === 'pending').length} icon={Clock} color="blue" subtitle="Awaiting Decision" />
            <AdminStatCard title="Approved" value={filteredRecords.filter(r => r.status === 'approved').length} icon={CheckCircle} color="emerald" subtitle="Cleared Node" />
         </div>

         {/* Tabbed Navigation */}
         <div className="flex border-b border-[var(--border-subtle)] gap-6">
            {['all', 'drivers', 'franchises'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-[9px] font-black uppercase tracking-widest transition-all relative italic ${activeTab === tab ? 'text-emerald-500' : 'text-[var(--text-tertiary)] hover:text-emerald-500'
                     }`}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div layoutId="kyc-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  )}
               </button>
            ))}
         </div>

         {/* KYC Registry */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                        {['Identity', 'Platform', 'Vehicle No', 'Personal', 'Start Date', 'Registry Date', 'Status', 'Actions'].map((header) => (
                           <th key={header} className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     <AnimatePresence mode='popLayout'>
                        {paginatedRecords.map((record) => (
                           <motion.tr
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={record._id || record.id}
                              className="group/row hover:bg-[var(--bg-tertiary)]/20 transition-colors cursor-pointer"
                              onClick={() => openDetails(record)}
                           >
                              <td className="py-2 px-2 whitespace-nowrap">
                                 <div className="flex flex-col">
                                    <span className={`font-medium transition-colors ${record.isBlocked
                                       ? 'text-rose-500 line-through decoration-rose-500/50'
                                       : 'text-[var(--text-primary)] group-hover:text-emerald-500'
                                       }`}>
                                       {record.name}
                                       {record.isBlocked && (
                                          <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-rose-500/15 border border-rose-500/20 text-rose-500 rounded font-black uppercase tracking-wider select-none leading-none">
                                             BLOCKED
                                          </span>
                                       )}
                                    </span>
                                    {record.phone && (
                                       <span className="text-[10px] font-medium text-[var(--text-tertiary)] mt-0.5">{record.phone}</span>
                                    )}
                                 </div>
                              </td>
                              {/* Platform Column */}
                              <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                                 {record.role?.toLowerCase() === 'rider' ? (
                                    <select
                                       value={record.onboardedPlatform || ''}
                                       onChange={async (e) => {
                                          await updateKycStatus(record._id || record.id, { onboardedPlatform: e.target.value });
                                          fetchKycRecords();
                                       }}
                                       className="px-2 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-semibold text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer w-[110px] transition-all"
                                    >
                                       <option value="">Platform</option>
                                       <option value="Zepto">Zepto</option>
                                       <option value="Zomato">Zomato</option>
                                       <option value="Blinkit">Blinkit</option>
                                       <option value="Amazon">Amazon</option>
                                       <option value="Instamart">Instamart</option>
                                       <option value="Flipkart">Flipkart</option>
                                       <option value="Porter">Porter</option>
                                       <option value="Licious">Licious</option>
                                    </select>
                                 ) : (
                                    <span className="text-[10px] text-[var(--text-tertiary)] italic">—</span>
                                 )}
                              </td>
                              <td className="py-2 px-2">
                                 <div className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    {record.vehiclePlate || ''}
                                 </div>
                              </td>
                              <td className="py-2 px-2 font-medium text-[var(--text-tertiary)]" onClick={(e) => e.stopPropagation()}>
                                 <div className="flex flex-col gap-1.5">
                                    <span>{record.role}</span>
                                    {record.role?.toLowerCase() === 'rider' && (
                                       <select
                                          value={record.franchise || ''}
                                          onChange={async (e) => {
                                             const newFranchise = e.target.value;
                                             await updateKycStatus(record._id || record.id, { franchise: newFranchise });
                                          }}
                                          className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-[10px] font-semibold text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer min-w-[120px]"
                                       >
                                          <option value="">No Franchise</option>
                                          {kycRecords
                                             .filter(r => r.role?.toLowerCase() === 'franchise' && r.status === 'approved')
                                             .map(f => (
                                                <option key={f._id || f.id} value={f._id || f.id}>{f.name || f.phone}</option>
                                             ))
                                          }
                                       </select>
                                    )}
                                    {record.role?.toLowerCase() === 'franchise' && (() => {
                                       const franchiseRiders = kycRecords.filter(r => r.role?.toLowerCase() === 'rider' && r.franchise && r.franchise.toString() === (record._id || record.id).toString());
                                       if (franchiseRiders.length === 0) return null;

                                       const selectedRiderId = selectedFranchiseRiders[record._id || record.id] || franchiseRiders[0]?._id || franchiseRiders[0]?.id;

                                       return (
                                          <select
                                             value={selectedRiderId}
                                             onChange={(e) => setSelectedFranchiseRiders(prev => ({ ...prev, [record._id || record.id]: e.target.value }))}
                                             className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-[10px] font-semibold text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer min-w-[160px] max-w-[200px]"
                                          >
                                             {franchiseRiders.map(r => (
                                                <option key={r._id || r.id} value={r._id || r.id}>{r.name || r.phone}</option>
                                             ))}
                                          </select>
                                       );
                                    })()}
                                 </div>
                              </td>
                              <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                                 {record.role?.toLowerCase() === 'franchise' ? (() => {
                                    const franchiseRiders = kycRecords.filter(r => r.role?.toLowerCase() === 'rider' && r.franchise && r.franchise.toString() === (record._id || record.id).toString());
                                    if (franchiseRiders.length === 0) return <span className="text-[10px] text-[var(--text-tertiary)] italic">No Riders</span>;

                                    const selectedRiderId = selectedFranchiseRiders[record._id || record.id] || franchiseRiders[0]?._id || franchiseRiders[0]?.id;
                                    const selectedRider = franchiseRiders.find(r => (r._id || r.id) === selectedRiderId);

                                    return selectedRider ? (
                                       <input
                                          type="date"
                                          value={selectedRider.adminAssignedStartDate ? selectedRider.adminAssignedStartDate.split('T')[0] : ''}
                                          onChange={async (e) => {
                                             await updateKycStatus(selectedRiderId, { adminAssignedStartDate: e.target.value });
                                             fetchKycRecords(); // Refresh to ensure UI updates
                                          }}
                                          className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-[9px] text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer w-[120px]"
                                       />
                                    ) : null;
                                 })() : (
                                    <input
                                       type="date"
                                       value={record.adminAssignedStartDate ? record.adminAssignedStartDate.split('T')[0] : ''}
                                       onChange={async (e) => {
                                          await updateKycStatus(record._id || record.id, { adminAssignedStartDate: e.target.value });
                                          fetchKycRecords();
                                       }}
                                       className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-[10px] text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer"
                                    />
                                 )}
                              </td>
                              <td className="py-2 px-2 font-medium text-[var(--text-tertiary)] whitespace-nowrap">{new Date(record.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                              <td className="py-2 px-2">
                                 <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                    record.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                                       record.status === 'inactive' ? 'bg-gray-500/10 text-gray-500 border-gray-500/10' :
                                          'bg-rose-500/10 text-rose-500 border-rose-500/10'
                                    }`}>
                                    {record.status}
                                 </div>
                              </td>
                              <td className="py-2 px-2">
                                 <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                       onClick={() => openDetails(record)}
                                       className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                    >
                                       <Eye size={12} />
                                    </button>
                                    <button
                                       onClick={() => {
                                          setEditRecordId(record.id || record._id);
                                          setEditData({
                                             name: record.name || '',
                                             phone: record.phone || '',
                                             status: record.status || 'pending'
                                          });
                                          setIsEditModalOpen(true);
                                       }}
                                       className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-blue-500 hover:border-blue-500/30 transition-all"
                                       title="Edit Details"
                                    >
                                       <FileText size={12} />
                                    </button>
                                    <button
                                       onClick={async () => {
                                          const res = await toggleBlockKycRecord(record._id || record.id);
                                          if (res?.success) {
                                             // Zustand store handles updating state automatically
                                          } else {
                                             alert(res?.message || "Failed to toggle block status");
                                          }
                                       }}
                                       className={`p-1.5 border rounded-lg transition-all ${record.isBlocked
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                                          }`}
                                       title={record.isBlocked ? "Unblock User" : "Block User"}
                                    >
                                       {record.isBlocked ? <UserCheck size={12} /> : <UserX size={12} />}
                                    </button>
                                    <button
                                       onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*,.pdf';
                                          input.onchange = async (e) => {
                                             const file = e.target.files[0];
                                             if (!file) return;
                                             const reader = new FileReader();
                                             reader.onloadend = async () => {
                                                try {
                                                   const res = await api.post(`/admin/kyc/${record._id || record.id}/attachment`, {
                                                      file: reader.result,
                                                      fileName: file.name
                                                   });
                                                   if (res.data.success) {
                                                      fetchKycRecords();
                                                   } else {
                                                      alert(res.data.message || 'Upload failed');
                                                   }
                                                } catch (err) {
                                                   alert('Upload failed: ' + (err.response?.data?.message || err.message));
                                                }
                                             };
                                             reader.readAsDataURL(file);
                                          };
                                          input.click();
                                       }}
                                       className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                       title="Add Attachment"
                                    >
                                       <Paperclip size={12} />
                                    </button>
                                    {record.status === 'approved' && record.role?.toLowerCase() === 'rider' && !record.vehicleId && (
                                       <button
                                          onClick={() => {
                                             setAssignmentData({
                                                vehiclePlate: '',
                                                riderPhone: record.phone || '',
                                                riderName: record.name || ''
                                             });
                                             setIsAssignModalOpen(true);
                                          }}
                                          className="p-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                                          title="Assign Vehicle"
                                       >
                                          <Zap size={12} fill="currentColor" />
                                       </button>
                                    )}
                                    {record.status === 'approved' && record.role?.toLowerCase() === 'rider' && record.vehicleId && (
                                       <button
                                          onClick={() => {
                                             setAssignmentData({
                                                vehiclePlate: '',
                                                riderPhone: record.phone || '',
                                                riderName: record.name || ''
                                             });
                                             setIsAssignModalOpen(true);
                                          }}
                                          className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                          title="Reassign Vehicle"
                                       >
                                          <Zap size={12} fill="currentColor" />
                                       </button>
                                    )}
                                    <button
                                       onClick={() => {
                                          setDeleteConfirm({ isOpen: true, id: record._id || record.id, name: record.name });
                                       }}
                                       className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                       title="Delete KYC Record"
                                    >
                                       <Trash2 size={12} />
                                    </button>

                                 </div>
                              </td>
                           </motion.tr>
                        ))}
                     </AnimatePresence>
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                     Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} Entries
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
                           <p className="text-[10px] text-[var(--text-tertiary)] font-bold mt-1 uppercase tracking-widest leading-relaxed">Are you sure you want to permanently delete record {deleteConfirm.name}? This action cannot be undone.</p>
                        </div>
                        <div className="flex w-full gap-3 pt-4">
                           <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })} className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all active:scale-95">Cancel</button>
                           <button onClick={async () => {
                              try {
                                 const res = await api.delete(`/admin/kyc/${deleteConfirm.id}`);
                                 if (res.data.success) {
                                    useAdminDataStore.getState().fetchKycRecords();
                                    setDeleteConfirm({ isOpen: false, id: null, name: '' });
                                 } else {
                                    alert(res.data.message || 'Deletion failed');
                                 }
                              } catch (err) {
                                 alert('Deletion failed: ' + (err.response?.data?.message || err.message));
                              }
                           }} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95 shadow-rose-500/20">Delete</button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* KYC Detail Modal */}
         <AnimatePresence>
            {isDetailModalOpen && selectedRecord && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     className="w-full max-w-xl max-h-[90vh] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
                  >
                     <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <UserCheck size={100} />
                     </div>

                     {/* Header with Back + Close */}
                     <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border-subtle)] relative z-10 shrink-0">
                        <div className="flex items-center gap-3">
                           <button onClick={() => setIsDetailModalOpen(false)} className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
                              <ArrowRight size={14} className="rotate-180" />
                           </button>
                           <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] overflow-hidden">
                              <User size={20} />
                           </div>
                           <div className="space-y-0.5">
                              <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{selectedRecord.name}</h2>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className={`px-1.5 py-0.5 rounded text-xs font-medium border border-[var(--border-subtle)]`}>
                                    {selectedRecord.role}
                                 </div>
                                 {selectedRecord.role?.toLowerCase() === 'rider' && (
                                    <div className="flex items-center gap-1.5 ml-2">
                                       <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-black">Franchise:</span>
                                       <select
                                          value={selectedRecord.franchise || ''}
                                          onChange={async (e) => {
                                             const newFranchise = e.target.value;
                                             const id = selectedRecord.id || selectedRecord._id;
                                             await updateKycStatus(id, { franchise: newFranchise });
                                          }}
                                          className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-[9px] font-semibold text-[var(--text-primary)] outline-none focus:border-emerald-500/50 cursor-pointer min-w-[140px]"
                                       >
                                          <option value="">No Franchise</option>
                                          {kycRecords
                                             .filter(r => r.role?.toLowerCase() === 'franchise' && r.status === 'approved')
                                             .map(f => (
                                                <option key={f._id || f.id} value={f._id || f.id}>
                                                   {f.name || f.phone}
                                                </option>
                                             ))}
                                       </select>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setIsDetailModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={18} />
                        </button>
                     </div>

                     {/* Scrollable Content */}
                     <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">

                        <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                           <div className="space-y-4">
                              <h4 className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 italic leading-none">
                                 <ShieldCheck size={10} className="text-emerald-500" /> Identity Documents
                              </h4>
                              <div className="space-y-1.5">
                                 {[
                                    { label: 'Aadhaar Front', key: 'aadhaarFront', verified: selectedRecord.details?.ekycVerified },
                                    { label: 'Aadhaar Back', key: 'aadhaarBack' },
                                    { label: 'PAN Card', key: 'panCard' },
                                    { label: 'Driving License', key: 'drivingLicense' },
                                    { label: 'Certificate', key: 'certificate', isUploadable: true }
                                 ].map(doc => {
                                    const hasDoc = selectedRecord.details?.[doc.key];
                                    return (
                                       <div
                                          key={doc.label}
                                          className={`p-2.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl flex items-center justify-between group transition-all ${hasDoc ? 'cursor-pointer hover:border-emerald-500/30' : (doc.isUploadable ? 'cursor-pointer border-dashed border-emerald-500/30 hover:bg-emerald-500/5' : 'opacity-50 cursor-not-allowed')}`}
                                          onClick={() => {
                                             if (hasDoc) {
                                                window.open(hasDoc, '_blank');
                                             } else if (doc.isUploadable) {
                                                document.getElementById('certificate-upload').click();
                                             }
                                          }}
                                       >
                                          <div className="flex items-center gap-2">
                                             <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest italic leading-none">{doc.label}</span>
                                             {doc.verified && <Check size={10} className="text-emerald-500" />}
                                          </div>
                                          <div className="flex items-center gap-2">
                                             {hasDoc ? (
                                                <Download size={10} className="text-[var(--text-tertiary)]/50 group-hover:text-emerald-500 transition-all" />
                                             ) : doc.isUploadable ? (
                                                <Camera size={10} className="text-emerald-500 animate-pulse" />
                                             ) : (
                                                <AlertCircle size={10} className="text-rose-500/50" />
                                             )}
                                          </div>
                                       </div>
                                    );
                                 })}
                                 <input
                                    type="file"
                                    id="certificate-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                       const file = e.target.files[0];
                                       if (!file) return;

                                       const id = selectedRecord.id || selectedRecord._id;
                                       if (!id) {
                                          alert("Error: Record ID not found");
                                          return;
                                       }

                                       const reader = new FileReader();
                                       reader.onloadend = async () => {
                                          try {
                                             const res = await useAdminDataStore.getState().uploadKycCertificate(id, reader.result);
                                             if (res?.success) {
                                                setSelectedRecord(prev => ({
                                                   ...prev,
                                                   details: { ...prev.details, certificate: res.certificateUrl }
                                                }));
                                                alert("Certificate Uploaded Successfully!");
                                             } else {
                                                alert(res?.message || "Upload failed. Please try again.");
                                             }
                                          } catch (err) {
                                             alert("Upload Error: " + err.message);
                                          } finally {
                                             e.target.value = ''; // Reset input
                                          }
                                       };
                                       reader.readAsDataURL(file);
                                    }}
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 italic leading-none">
                                 <Camera size={10} className="text-emerald-500" /> Liveness Evidence
                              </h4>
                              <div
                                 onClick={() => selectedRecord.details?.selfie && window.open(selectedRecord.details.selfie, '_blank')}
                                 className="aspect-video bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl relative overflow-hidden flex items-center justify-center group cursor-pointer"
                              >
                                 <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 rounded text-[6px] font-black text-white uppercase tracking-widest z-10 animate-pulse">LIVENESS_OK</div>
                                 {selectedRecord.details?.selfie ? (
                                    <img src={selectedRecord.details.selfie} alt="Liveness" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                 ) : (
                                    <Camera size={20} className="text-[var(--text-tertiary)] group-hover:scale-110 transition-transform opacity-30" />
                                 )}
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Download size={20} className="text-white" />
                                 </div>
                              </div>
                              <div className="p-2.5 bg-emerald-600/5 border border-emerald-500/10 rounded-xl space-y-1.5">
                                 <div className="flex justify-between items-center text-[7px] font-black uppercase italic leading-none">
                                    <span className="text-[var(--text-tertiary)]">Face Match Confidence</span>
                                    <span className="text-emerald-500">98.4%</span>
                                 </div>
                                 <div className="w-full h-0.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[98.4%]" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Reference Details Section */}
                        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
                           <h4 className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 italic leading-none">
                              <User size={10} className="text-emerald-500" /> Reference Details
                           </h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Reference Name</label>
                                 <input
                                    value={selectedRecord.details?.referenceName || ''}
                                    onChange={(e) => {
                                       setSelectedRecord(prev => ({
                                          ...prev,
                                          details: { ...prev.details, referenceName: e.target.value }
                                       }));
                                    }}
                                    placeholder="ENTER NAME"
                                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Reference Number</label>
                                 <div className="relative">
                                    <input
                                       value={selectedRecord.details?.referenceNumber || ''}
                                       onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          if (val.length <= 10) {
                                             setSelectedRecord(prev => ({
                                                ...prev,
                                                details: { ...prev.details, referenceNumber: val }
                                             }));
                                          }
                                       }}
                                       placeholder="10-DIGIT MOBILE"
                                       className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                                    />
                                    {selectedRecord.details?.referenceNumber?.length === 10 && (
                                       <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                          <ShieldCheck size={12} className="text-emerald-500" />
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Reference Name 2</label>
                                 <input
                                    value={selectedRecord.details?.referenceName2 || ''}
                                    onChange={(e) => {
                                       setSelectedRecord(prev => ({
                                          ...prev,
                                          details: { ...prev.details, referenceName2: e.target.value }
                                       }));
                                    }}
                                    placeholder="ENTER NAME"
                                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Reference Number 2</label>
                                 <div className="relative">
                                    <input
                                       value={selectedRecord.details?.referenceNumber2 || ''}
                                       onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          if (val.length <= 10) {
                                             setSelectedRecord(prev => ({
                                                ...prev,
                                                details: { ...prev.details, referenceNumber2: val }
                                             }));
                                          }
                                       }}
                                       placeholder="10-DIGIT MOBILE"
                                       className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                                    />
                                    {selectedRecord.details?.referenceNumber2?.length === 10 && (
                                       <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                          <ShieldCheck size={12} className="text-emerald-500" />
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <button
                              onClick={async () => {
                                 const id = selectedRecord.id || selectedRecord._id;
                                 const res = await useAdminDataStore.getState().updateKycReferences(id, {
                                    referenceName: selectedRecord.details?.referenceName,
                                    referenceNumber: selectedRecord.details?.referenceNumber,
                                    referenceName2: selectedRecord.details?.referenceName2,
                                    referenceNumber2: selectedRecord.details?.referenceNumber2
                                 });
                                 if (res?.success) {
                                    if (res.kycDetails) {
                                       setSelectedRecord(prev => ({ ...prev, details: res.kycDetails }));
                                    }
                                    alert("References Saved!");
                                 }
                                 else alert(res?.message || "Failed to save references");
                              }}
                              className="w-full py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                           >
                              <Save size={12} /> SAVE
                           </button>
                        </div>

                        {/* Referral Bonus Section */}
                        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
                           <h4 className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 italic leading-none">
                              <Zap size={10} className="text-emerald-500" /> Wallet & Referral Bonus
                           </h4>
                           <div className="flex items-center gap-4 bg-[var(--bg-tertiary)]/30 border border-[var(--border-subtle)] rounded-xl p-3">
                              <div className="flex-1 space-y-1">
                                 <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Current Wallet Balance</p>
                                 <p className="text-lg font-black text-emerald-500">₹{selectedRecord.walletBalance || 0}</p>
                              </div>
                              <div className="flex-1 space-y-1.5">
                                 <label className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Add Bonus Amount</label>
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="number"
                                       value={referralAmount}
                                       onChange={(e) => setReferralAmount(e.target.value)}
                                       placeholder="₹0"
                                       className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                                    />
                                    <button
                                       onClick={async () => {
                                          if (!referralAmount || isNaN(referralAmount) || Number(referralAmount) <= 0) return alert("Enter a valid amount");
                                          try {
                                             const id = selectedRecord.id || selectedRecord._id;
                                             const res = await api.post(`/admin/kyc/${id}/referral`, { amount: Number(referralAmount) });
                                             if (res.data.success) {
                                                alert("Referral Bonus Added!");
                                                setReferralAmount('');
                                                setSelectedRecord(prev => ({ ...prev, walletBalance: res.data.walletBalance }));
                                                useAdminDataStore.getState().fetchKycRecords();
                                             } else {
                                                alert(res.data.message || "Failed to add bonus");
                                             }
                                          } catch (err) {
                                             alert("Error adding bonus");
                                          }
                                       }}
                                       className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all whitespace-nowrap"
                                    >
                                       Credit
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-2.5 pt-6 border-t border-[var(--border-subtle)] relative z-10">
                           {/* Uploaded Attachments */}
                           {(selectedRecord.details?.attachments?.length > 0 || selectedRecord.kycDetails?.attachments?.length > 0) && (
                              <div className="w-full mb-4">
                                 <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Attachments ({(selectedRecord.details?.attachments || selectedRecord.kycDetails?.attachments || []).length})</p>
                                 <div className="space-y-2">
                                    {(selectedRecord.details?.attachments || selectedRecord.kycDetails?.attachments || []).map((att, idx) => (
                                       <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--bg-tertiary)]/30 border border-[var(--border-subtle)] rounded-xl">
                                          <div className="flex items-center gap-2 min-w-0">
                                             <Paperclip size={12} className="text-blue-500 shrink-0" />
                                             <span className="text-[9px] font-bold text-[var(--text-primary)] truncate">{att.name || `Attachment ${idx + 1}`}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                             <button
                                                onClick={() => window.open(att.url, '_blank')}
                                                className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                                             >
                                                View
                                             </button>
                                             <a
                                                href={att.url}
                                                download={att.name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                             >
                                                Download
                                             </a>
                                             <button
                                                onClick={async () => {
                                                   try {
                                                      const res = await api.delete(`/admin/kyc/${selectedRecord.id || selectedRecord._id}/attachment/${idx}`);
                                                      if (res.data.success) {
                                                         fetchKycRecords();
                                                         setSelectedRecord(prev => ({
                                                            ...prev,
                                                            details: { ...prev.details, attachments: (prev.details?.attachments || []).filter((_, i) => i !== idx) }
                                                         }));
                                                      }
                                                   } catch (err) {
                                                      alert('Delete failed');
                                                   }
                                                }}
                                                className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                                             >
                                                Delete
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="flex gap-2.5 pt-6 border-t border-[var(--border-subtle)] relative z-10">
                           <button
                              onClick={() => { handleAction(selectedRecord._id || selectedRecord.id, 'approved'); setIsDetailModalOpen(false); }}
                              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                           >
                              <Zap size={14} fill="currentColor" /> {selectedRecord.status === 'approved' ? 'Already Authorized' : 'Authorize Subscriber'}
                           </button>
                           <button
                              onClick={() => { handleAction(selectedRecord._id || selectedRecord.id, 'rejected'); setIsDetailModalOpen(false); }}
                              className="px-5 py-3 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600/20 transition-all active:scale-95 italic"
                           >
                              {selectedRecord.status === 'rejected' ? 'Already Declined' : 'Decline'}
                           </button>
                        </div>
                     </div>{/* End Scrollable Content */}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Vehicle Assignment Modal */}
         <AnimatePresence>
            {isAssignModalOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
                  >
                     {(() => {
                        const riderRecord = kycRecords.find(r => r.phone === assignmentData.riderPhone);
                        const isReassign = !!(riderRecord?.vehicleId || (riderRecord?.vehiclePlate && riderRecord.vehiclePlate !== 'N/A'));
                        return (
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                                    Vehicle <span className={isReassign ? "text-amber-500" : "text-emerald-500"}>{isReassign ? 'Re-assignment' : 'Assignment'}</span>
                                 </h2>
                                 <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                                    {isReassign ? 'REASSIGN_DISPATCH_PROTOCOL' : 'PROVISION_DISPATCH_PROTOCOL'}
                                 </p>
                              </div>
                              <button onClick={() => setIsAssignModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                                 <X size={16} />
                              </button>
                           </div>
                        );
                     })()}

                     <form
                        onSubmit={async (e) => {
                           e.preventDefault();
                           const riderRecord = kycRecords.find(r => r.phone === assignmentData.riderPhone);
                           const isReassign = !!(riderRecord?.vehicleId || (riderRecord?.vehiclePlate && riderRecord.vehiclePlate !== 'N/A'));
                           const res = await assignVehicle({
                              vehiclePlate: assignmentData.vehiclePlate,
                              riderPhone: assignmentData.riderPhone,
                              type: 'Manual',
                              hubName: 'KYC Hub'
                           });
                           if (res.success) {
                              setIsAssignModalOpen(false);
                              alert(isReassign ? "Vehicle Reassigned Successfully!" : "Vehicle Assigned Successfully!");
                           } else {
                              alert(res.message || "Assignment Failed");
                           }
                        }}
                        className="space-y-6"
                     >
                        <div className="space-y-4">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Rider Name</label>
                              <input
                                 value={assignmentData.riderName}
                                 onChange={(e) => setAssignmentData({ ...assignmentData, riderName: e.target.value })}
                                 placeholder="Rider Name"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Mobile Number</label>
                              <input
                                 value={assignmentData.riderPhone}
                                 onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) {
                                       setAssignmentData({ ...assignmentData, riderPhone: val });
                                    }
                                 }}
                                 placeholder="Mobile Number"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Vehicle Plate Number (Unblocked/Available)</label>
                              <select
                                 required
                                 value={assignmentData.vehiclePlate}
                                 onChange={(e) => setAssignmentData({ ...assignmentData, vehiclePlate: e.target.value })}
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                              >
                                 <option value="">Select Vehicle Plate</option>
                                 {vehicles.filter(v => v.status === 'available' || v.status === 'unassigned' || !v.status).map(v => (
                                    <option key={v._id || v.id} value={v.plate}>
                                       {v.plate} — {v.model || 'Vehicle'}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <button
                           type="submit"
                           className={`w-full py-3 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${(() => {
                              const riderRecord = kycRecords.find(r => r.phone === assignmentData.riderPhone);
                              return riderRecord?.vehicleId || (riderRecord?.vehiclePlate && riderRecord.vehiclePlate !== 'N/A')
                                 ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-950/20'
                                 : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20';
                           })()
                              }`}
                        >
                           <Zap size={14} fill="white" /> {
                              (() => {
                                 const riderRecord = kycRecords.find(r => r.phone === assignmentData.riderPhone);
                                 return riderRecord?.vehicleId || (riderRecord?.vehiclePlate && riderRecord.vehiclePlate !== 'N/A')
                                    ? 'Save & Reassign Vehicle'
                                    : 'Save & Assign Vehicle';
                              })()
                           }
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Edit KYC Record Modal */}
         <AnimatePresence>
            {isEditModalOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                              Edit <span className="text-emerald-500">Details</span>
                           </h2>
                           <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">MODIFY_RECORD_PROTOCOL</p>
                        </div>
                        <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={16} />
                        </button>
                     </div>

                     <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                           const res = await api.patch(`/admin/kyc/${editRecordId}`, {
                              status: editData.status,
                              name: editData.name,
                              phone: editData.phone
                           });
                           if (res.data.success) {
                              setIsEditModalOpen(false);
                              fetchKycRecords();
                           } else {
                              alert(res.data.message || 'Update failed');
                           }
                        } catch (err) {
                           alert(err.response?.data?.message || 'Update failed');
                        }
                     }} className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Name</label>
                           <input
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Phone</label>
                           <input
                              value={editData.phone}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Status</label>
                           <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                           >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="inactive">Inactive</option>
                           </select>
                        </div>
                        <button
                           type="submit"
                           className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                           <Save size={14} /> Update Record
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   );
}
