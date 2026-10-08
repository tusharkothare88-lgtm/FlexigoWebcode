import React, { useState } from 'react';
import {
   Users,
   Briefcase,
   Calendar,
   Clock,
   CheckCircle2,
   ChevronLeft,
   ChevronRight,
   Search,
   Filter,
   Plus,
   UserPlus,
   ClipboardCheck,
   MoreVertical,
   Activity,
   History,
   X,
   Zap,
   CreditCard,
   UserCheck,
   ShieldCheck,
   Edit,
   Trash2,
   ChevronDown,
   Download,
   Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import LeavesCalendarView from '../components/LeavesCalendarView';
import { useAdminDataStore } from '../store/adminDataStore';
import api from '../../../lib/axios';

export default function HrManagementPage() {
   const {
      staff,
      staffStats,
      fetchStaff,
      addStaff,
      updateStaff,
      removeStaff,
      fetchWeeklyAttendance,
      updateWeeklyAttendance,
      fetchMonthlyAttendanceReport
   } = useAdminDataStore();

   const handleImageDownload = async (e, url, filename) => {
      e.stopPropagation();
      try {
         const response = await fetch(url);
         const blob = await response.blob();
         const objectUrl = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = objectUrl;
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(objectUrl);
      } catch (error) {
         console.error('Download failed:', error);
         window.open(url, '_blank');
      }
   };

   const handleDownloadReport = async () => {
      const month = prompt("Enter month (YYYY-MM)", new Date().toISOString().slice(0, 7));
      if (!month) return;

      const data = await fetchMonthlyAttendanceReport(month);
      if (!data) return alert("Failed to fetch report data");

      const { staffList, records } = data;

      // Create CSV Header
      let csvContent = "Staff ID,Name,Role,Department,Week,Day 1,Day 2,Day 3,Day 4,Day 5\n";

      staffList.forEach(emp => {
         const empRecords = records.filter(r => r.staffId._id === emp._id);
         if (empRecords.length > 0) {
            empRecords.forEach(rec => {
               const p = rec.days.filter(d => d === 'present').length;
               const a = rec.days.filter(d => d === 'absent').length;
               const h = rec.days.filter(d => d === 'half-day').length;
               csvContent += `${emp._id},${emp.name},${emp.role},${emp.dept},${rec.weekKey},${rec.days.join(',')},P:${p} A:${a} H:${h}\n`;
            });
         } else {
            csvContent += `${emp._id},${emp.name},${emp.role},${emp.dept},N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`;
         }
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Flexigo_Attendance_${month}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const getWeekInfo = (offset = 0, count = 5, baseDate = new Date()) => {
      const startOfWeek = new Date(baseDate);
      const day = startOfWeek.getDay() || 7;
      startOfWeek.setDate(startOfWeek.getDate() - day + 1 + (offset * 7));

      const dates = [];
      for (let i = 0; i < count; i++) {
         const d = new Date(startOfWeek);
         d.setDate(startOfWeek.getDate() + i);
         dates.push({
            label: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
            date: d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }),
            fullDate: d
         });
      }

      const d = new Date(startOfWeek);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      const weekKey = `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
      const monthName = startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' });

      return { weekKey, dates, monthName, weekNo };
   };

   const [activeTab, setActiveTab] = useState('employees');
   const [searchTerm, setSearchTerm] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'payouts', or 'details'
   const [selectedStaff, setSelectedStaff] = useState(null);
   const [newEmployee, setNewEmployee] = useState({
      name: '',
      role: '',
      dept: 'Operations',
      phone: '',
      email: '',
      password: '',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      aadhaarFront: null,
      aadhaarBack: null
   });

   const [emailError, setEmailError] = useState('');
   const [showPassword, setShowPassword] = useState(false);

   const defaultDepartments = ['Operations', 'Logistics', 'Technology', 'Maintenance', 'Admin'];
   const departmentOptions = React.useMemo(() => {
      const uniqueDepts = Array.from(new Set(staff.map((emp) => emp.dept).filter(Boolean)));
      return uniqueDepts.length ? uniqueDepts.sort() : defaultDepartments;
   }, [staff]);

   const currentDeptSelectValue = departmentOptions.includes(newEmployee.dept)
      ? newEmployee.dept
      : '__custom__';

   const [weekOffset, setWeekOffset] = useState(0);
   const [jumpDate, setJumpDate] = useState(new Date());
   const [weeklyData, setWeeklyData] = useState([]);
   const [weekInfo, setWeekInfo] = useState(getWeekInfo(0, 5));
   const [isSubmitting, setIsSubmitting] = useState(false);

   React.useEffect(() => {
      if (selectedStaff && modalType === 'details') {
         const count = selectedStaff.workDaysCount || 5;
         const info = getWeekInfo(weekOffset, count, jumpDate);
         setWeekInfo(info);

         const loadAttendance = async () => {
            const data = await fetchWeeklyAttendance(selectedStaff._id, info.weekKey);
            if (data) {
               setWeeklyData(data.days);
            } else {
               setWeeklyData(Array(count).fill('present'));
            }
         };
         loadAttendance();
      }
   }, [selectedStaff, weekOffset, jumpDate, modalType]);

   const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });
   const filteredStaff = React.useMemo(() => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return staff;
      return staff.filter((emp) => {
         const combined = [emp.name, emp.role, emp.dept, emp.phone, emp.employeeId]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase())
            .join(' ');
         return combined.includes(query);
      });
   }, [staff, searchTerm]);

   React.useEffect(() => {
      fetchStaff();
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchStaff(newFilters);
   };

   const handleEditOpen = (emp) => {
      setSelectedStaff(emp);
      setNewEmployee({
         name: emp.name,
         role: emp.role,
         dept: emp.dept,
         phone: emp.phone || '',
         email: emp.email || '',
         password: '', // never prefill password
         status: emp.status || 'active',
         joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
         aadhaarFront: emp.kycDetails?.aadhaarFront || null,
         aadhaarBack: emp.kycDetails?.aadhaarBack || null
      });
      setEmailError('');
      setModalType('edit');
      setIsModalOpen(true);
   };

   const handleDetailsOpen = (emp) => {
      setSelectedStaff(emp);
      setWeekOffset(0);
      setModalType('details');
      setIsModalOpen(true);
   };

   const handleAddEmployee = async (e) => {
      e.preventDefault();
      if (!newEmployee.name || !newEmployee.role || newEmployee.phone.length !== 10 || isSubmitting) return;

      // Email validation
      if (newEmployee.email) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(newEmployee.email)) {
            setEmailError('Please enter a valid email address');
            return;
         }
      }
      setEmailError('');

      setIsSubmitting(true);
      try {
         const payload = {
            ...newEmployee,
            shift: 'Regular',
            kycDetails: {
               aadhaarFront: newEmployee.aadhaarFront,
               aadhaarBack: newEmployee.aadhaarBack,
               ...(modalType === 'edit' && selectedStaff?.kycDetails?.isVerified !== undefined ? { isVerified: selectedStaff.kycDetails.isVerified } : {})
            }
         };

         if (modalType === 'edit' && selectedStaff) {
            await updateStaff(selectedStaff._id, payload);
         } else {
            await addStaff(payload);
         }

         setNewEmployee({
            name: '',
            role: '',
            dept: 'Operations',
            phone: '',
            email: '',
            password: '',
            status: 'active',
            joiningDate: new Date().toISOString().split('T')[0],
            aadhaarFront: null,
            aadhaarBack: null
         });
         setEmailError('');
         setIsModalOpen(false);
         setSelectedStaff(null);
      } catch (error) {
         console.error("Staff Sync Error:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleUpdateDetails = async (field, value) => {
      if (!selectedStaff) return;
      const res = await updateStaff(selectedStaff._id, { [field]: value });
      if (res.success) {
         setSelectedStaff(res.staff);
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
                     Team <span className="text-emerald-500">Registry</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Staff Management & Access Control
               </p>
            </div>

            <div className="flex items-center gap-2">
               <OpsFilter onFilterChange={handleFilterChange} />
               <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-95 shadow-sm"
               >
                  <Download size={12} strokeWidth={3} /> Download Report
               </button>
               <button
                  onClick={() => { setModalType('add'); setIsModalOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
               >
                  <UserPlus size={14} /> Add Staff
               </button>
            </div>
         </div>

         {/* Stats Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
               title="Total Staff"
               value={staffStats.totalStaff}
               subtitle="Active Team"
               icon={Users}
               color="emerald"
            />
            <AdminStatCard
               title="On Duty"
               value={staffStats.onDuty}
               subtitle="Present Now"
               icon={CheckCircle2}
               color="emerald"
            />
            <AdminStatCard
               title="Performance"
               value={staffStats.performance}
               subtitle="Efficiency Rating"
               icon={Activity}
               color="emerald"
            />
            <AdminStatCard
               title="Leaves"
               value={staffStats.leaves}
               subtitle="Pending Alpha"
               icon={Clock}
               color="rose"
            />
         </div>

         {/* Tabbed Navigation */}
         <div className="flex border-b border-[var(--border-subtle)] gap-6">
            {['employees', 'attendance', 'leaves', 'payroll'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-[9px] font-black uppercase tracking-widest transition-all relative italic ${activeTab === tab ? 'text-emerald-500' : 'text-[var(--text-tertiary)] hover:text-emerald-500'
                     }`}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div layoutId="hr-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                     <Users size={18} className="text-emerald-500" />
                  </div>
                  <h2 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Registry Payload</h2>
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={12} />
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="SEARCH PERSON"
                     className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl py-2 pl-9 pr-4 text-[9px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none w-48 transition-all"
                  />
               </div>
            </div>

            {activeTab === 'employees' ? (
               <div className="overflow-x-auto bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-sm mt-4">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                           {['Staff ID', 'Name & Role', 'Dept', 'Shift', 'Access', 'KYC', 'Status', 'Actions'].map((header) => (
                              <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border-subtle)]">
                        <AnimatePresence mode='popLayout'>
                           {filteredStaff.map((emp, idx) => (
                              <motion.tr
                                 layout
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 key={emp._id || emp.id || idx}
                                 onClick={() => handleDetailsOpen(emp)}
                                 className="group/row hover:bg-emerald-500/5 transition-colors cursor-pointer"
                              >
                                 <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{(emp._id || emp.id).slice(-8).toUpperCase()}</td>
                                 <td className="py-2 px-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                       <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{emp.name}</span>
                                       <span className="font-medium text-[var(--text-tertiary)]  mt-1">{emp.role}</span>
                                    </div>
                                 </td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{emp.dept}</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-primary)]">{emp.shift}</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-primary)]">
                                    {emp.role.includes('Lead') ? 'Level_4' : 'Level_2'}
                                 </td>
                                 <td className="py-2 px-4">
                                    <button 
                                       onClick={async (e) => {
                                          e.stopPropagation();
                                          if(window.confirm(`Change KYC status to ${emp.kycDetails?.isVerified ? 'Pending' : 'Approved'}?`)) {
                                             await updateStaff(emp._id || emp.id, { 
                                                kycDetails: { 
                                                   ...emp.kycDetails, 
                                                   isVerified: !emp.kycDetails?.isVerified 
                                                } 
                                             });
                                          }
                                       }}
                                       className={`inline-flex px-1.5 py-0.5 rounded font-medium border cursor-pointer hover:opacity-80 transition-opacity ${emp.kycDetails?.isVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/10 text-rose-500 border-rose-500/10'
                                       }`}>
                                       {emp.kycDetails?.isVerified ? 'Approved' : 'Pending'}
                                    </button>
                                 </td>
                                 <td className="py-2 px-4">
                                    <div className={`inline-flex px-1.5 py-0.5 rounded font-medium border ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                       }`}>
                                       {emp.status}
                                    </div>
                                 </td>
                                 <td className="py-2 px-4">
                                    <div className="flex flex-col gap-2">
                                       <div className="flex items-center gap-2">
                                          <button
                                             onClick={(e) => { e.stopPropagation(); handleEditOpen(emp); }}
                                             className="p-1 text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-all"
                                             title="Edit Staff"
                                          >
                                             <Edit size={12} />
                                          </button>
                                          <button
                                             onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete staff?')) removeStaff(emp._id); }}
                                             className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                                             title="Delete Staff"
                                          >
                                             <Trash2 size={12} />
                                          </button>
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*,.pdf';
                                                input.onchange = async (e) => {
                                                   const file = e.target.files[0];
                                                   if (!file) return;
                                                   const reader = new FileReader();
                                                   reader.onloadend = async () => {
                                                      try {
                                                         const res = await api.post(`/admin/staff/${emp._id || emp.id}/attachment`, {
                                                            file: reader.result,
                                                            fileName: file.name
                                                         });
                                                         if (res.data.success) {
                                                            fetchStaff();
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
                                             className="p-1 text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 rounded transition-all"
                                             title="Add Attachment"
                                          >
                                             <Paperclip size={12} />
                                          </button>
                                       </div>
                                       {emp.attachments && emp.attachments.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                             {emp.attachments.map((att, idx) => (
                                                <a
                                                   key={idx}
                                                   href={att.url}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   onClick={(e) => e.stopPropagation()}
                                                   className="text-[8px] px-1 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-500 hover:text-white transition-all truncate max-w-[80px]"
                                                   title={att.name}
                                                >
                                                   {att.name}
                                                </a>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>
            ) : activeTab === 'leaves' ? (
               <LeavesCalendarView />
            ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/5 rounded-3xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
                     <Clock size={24} className="text-emerald-500/50" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[11px] font-black text-[var(--text-primary)] uppercase italic tracking-widest">Protocol Initializing</p>
                     <p className="text-[8px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">This module is currently syncing with the main registry.</p>
                  </div>
               </div>
            )}
         </div>

         {/* Staff Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className={`w-full ${modalType === 'details' ? 'max-w-2xl' : 'max-w-md'} bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar`}
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                              {modalType === 'add' ? 'Staff' : modalType === 'edit' ? 'Update' : modalType === 'details' ? 'Staff' : 'Payroll'} <span className="text-emerald-500">{modalType === 'details' ? 'Profile' : 'Initiator'}</span>
                           </h2>
                           <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">SECTION: {modalType === 'details' ? 'STAFF_INTEL_V1' : 'HUB_STAFF_V2'}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={18} />
                        </button>
                     </div>

                     {modalType === 'details' && selectedStaff ? (
                        <div className="space-y-8">
                           <div className="flex items-start gap-6 p-6 bg-[var(--bg-tertiary)]/30 rounded-2xl border border-[var(--border-subtle)]">
                              <div className="w-20 h-20 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                                 <Users size={40} />
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">{selectedStaff.name}</h3>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em]">{selectedStaff.status}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{selectedStaff.role}</p>
                                 <div className="flex items-center gap-4 text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest pt-2">
                                    <span className="flex items-center gap-1.5"><Briefcase size={10} /> {selectedStaff.dept}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={10} /> Joined {new Date(selectedStaff.joiningDate || selectedStaff.createdAt).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-5 bg-[var(--bg-tertiary)]/20 rounded-2xl border border-[var(--border-subtle)] space-y-5">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <Clock size={14} className="text-blue-500" />
                                       <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Operations Config</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <input
                                          type="month"
                                          onChange={(e) => {
                                             if (e.target.value) {
                                                setJumpDate(new Date(e.target.value));
                                                setWeekOffset(0);
                                             }
                                          }}
                                          className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[8px] font-black uppercase text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-emerald-500/20"
                                       />
                                    </div>
                                 </div>

                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Shift Duration</span>
                                       <span className="text-[10px] font-black text-blue-500 italic">{selectedStaff.workingHours || 9}h</span>
                                    </div>
                                    <input
                                       type="range" min="0" max="16" step="0.5"
                                       value={selectedStaff.workingHours || 9}
                                       onChange={(e) => handleUpdateDetails('workingHours', parseFloat(e.target.value))}
                                       className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                 </div>

                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Work Days / Week</span>
                                       <span className="text-[10px] font-black text-emerald-500 italic">{selectedStaff.workDaysCount || 5} Days</span>
                                    </div>
                                    <input
                                       type="range" min="4" max="7" step="1"
                                       value={selectedStaff.workDaysCount || 5}
                                       onChange={(e) => handleUpdateDetails('workDaysCount', parseInt(e.target.value))}
                                       className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-emerald-500"
                                    />
                                 </div>
                              </div>

                              <div className="p-5 bg-[var(--bg-tertiary)]/20 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <ClipboardCheck size={14} className="text-emerald-500" />
                                       <div className="flex flex-col">
                                          <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Attendance Protocol</span>
                                          <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter">{weekInfo.monthName}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)]/40 p-1 rounded-lg border border-[var(--border-subtle)]">
                                       <button type="button" onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 hover:text-emerald-500 transition-all"><ChevronLeft size={12} /></button>
                                       <button type="button" onClick={() => { setWeekOffset(0); setJumpDate(new Date()); }} className="text-[7px] font-black uppercase px-1 transition-all hover:text-emerald-500">Today</button>
                                       <button type="button" onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 hover:text-emerald-500 transition-all"><ChevronRight size={12} /></button>
                                    </div>
                                 </div>

                                 <div className="flex justify-between gap-1.5">
                                    {weekInfo.dates.map((dayInfo, idx) => {
                                       const currentStatus = weeklyData[idx] || 'present';
                                       const nextStatus = currentStatus === 'present' ? 'absent' : currentStatus === 'absent' ? 'half-day' : 'present';

                                       return (
                                          <button
                                             key={dayInfo.label + dayInfo.date}
                                             type="button"
                                             onClick={async () => {
                                                const newArr = [...weeklyData];
                                                newArr[idx] = nextStatus;
                                                setWeeklyData(newArr);
                                                await updateWeeklyAttendance(selectedStaff._id, weekInfo.weekKey, newArr);
                                             }}
                                             className="flex-1 flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 hover:bg-emerald-500/5 transition-all group/day"
                                          >
                                             <div className="text-center">
                                                <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase">{dayInfo.label}</p>
                                                <p className="text-[6px] font-bold text-[var(--text-tertiary)]/50">{dayInfo.date}</p>
                                             </div>
                                             <div className={`w-2.5 h-2.5 rounded-full border ${currentStatus === 'present' ? 'bg-emerald-500 border-emerald-500/20' :
                                                currentStatus === 'absent' ? 'bg-rose-500 border-rose-500/20' :
                                                   'bg-amber-500 border-amber-500/20'
                                                }`} />
                                          </button>
                                       );
                                    })}
                                 </div>

                                 <div className="flex justify-center gap-3 pt-1">
                                    {['present', 'absent', 'half-day'].map(status => (
                                       <div key={status} className="flex items-center gap-1">
                                          <div className={`w-1.5 h-1.5 rounded-full ${status === 'present' ? 'bg-emerald-500' : status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                          <span className="text-[6px] font-black text-[var(--text-tertiary)] uppercase">{status}</span>
                                       </div>
                                    ))}
                                 </div>

                                 <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                                    <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] text-center italic">Weekly protocol summary</p>
                                    <div className="grid grid-cols-3 gap-2">
                                       <div className="bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10 text-center">
                                          <p className="text-[8px] font-black text-emerald-500 leading-none">{weeklyData.filter(d => d === 'present').length}</p>
                                          <p className="text-[5px] font-bold text-[var(--text-tertiary)] uppercase mt-0.5">Present</p>
                                       </div>
                                       <div className="bg-rose-500/5 p-1.5 rounded-lg border border-rose-500/10 text-center">
                                          <p className="text-[8px] font-black text-rose-500 leading-none">{weeklyData.filter(d => d === 'absent').length}</p>
                                          <p className="text-[5px] font-bold text-[var(--text-tertiary)] uppercase mt-0.5">Absent</p>
                                       </div>
                                       <div className="bg-amber-500/5 p-1.5 rounded-lg border border-amber-500/10 text-center">
                                          <p className="text-[8px] font-black text-amber-500 leading-none">{weeklyData.filter(d => d === 'half-day').length}</p>
                                          <p className="text-[5px] font-bold text-[var(--text-tertiary)] uppercase mt-0.5">Leave</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                        </div>
                     ) : modalType !== 'payouts' ? (
                        <form onSubmit={handleAddEmployee} className="space-y-5">
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Staff Identity Name</label>
                                    <input
                                       autoFocus
                                       value={newEmployee.name}
                                       onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                       placeholder="Full Name"
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                       value={newEmployee.phone}
                                       onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          if (val.length <= 10) {
                                             setNewEmployee({ ...newEmployee, phone: val });
                                          }
                                       }}
                                       placeholder="+91 XXXXX XXXXX"
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Role</label>
                                    <input
                                       value={newEmployee.role}
                                       onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                       placeholder="e.g. Senior Technician"
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Date of Joining</label>
                                    <input
                                       type="date"
                                       value={newEmployee.joiningDate}
                                       onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                                    />
                                 </div>
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Department Allocation</label>
                                 <select
                                    value={currentDeptSelectValue}
                                    onChange={(e) => {
                                       const value = e.target.value;
                                       if (value === '__custom__') {
                                          setNewEmployee({ ...newEmployee, dept: '' });
                                       } else {
                                          setNewEmployee({ ...newEmployee, dept: value });
                                       }
                                    }}
                                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                                 >
                                    {departmentOptions.map((deptOption) => (
                                       <option key={deptOption} value={deptOption}>{deptOption}</option>
                                    ))}
                                    <option value="__custom__">Custom Department</option>
                                 </select>
                                 {currentDeptSelectValue === '__custom__' && (
                                    <input
                                       value={newEmployee.dept}
                                       onChange={(e) => setNewEmployee({ ...newEmployee, dept: e.target.value })}
                                       placeholder="e.g. Quality Assurance"
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                                    />
                                 )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                       type="email"
                                       value={newEmployee.email}
                                       onChange={(e) => {
                                          setNewEmployee({ ...newEmployee, email: e.target.value });
                                          if (emailError) setEmailError('');
                                       }}
                                       placeholder="staff@flexigo.in"
                                       className={`w-full px-4 py-2 bg-[var(--bg-tertiary)] border rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 outline-none transition-all italic ${emailError ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[var(--border-subtle)] focus:ring-emerald-500/20'
                                          }`}
                                    />
                                    {emailError && (
                                       <p className="text-[8px] font-black text-rose-500 ml-1 mt-0.5">{emailError}</p>
                                    )}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">
                                       Password {modalType === 'edit' && <span className="text-[7px] normal-case font-bold text-[var(--text-tertiary)]">(leave blank to keep)</span>}
                                    </label>
                                    <div className="relative">
                                       <input
                                          type={showPassword ? 'text' : 'password'}
                                          value={newEmployee.password}
                                          onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                          placeholder="Min. 6 characters"
                                          className="w-full px-4 py-2 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                                       />
                                       <button
                                          type="button"
                                          onClick={() => setShowPassword(!showPassword)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-emerald-500 transition-colors"
                                       >
                                          {showPassword ? (
                                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                             </svg>
                                          ) : (
                                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                             </svg>
                                          )}
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              {modalType === 'edit' && (
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Account Status</label>
                                    <select
                                       value={newEmployee.status}
                                       onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                                       className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-primary)]"
                                    >
                                       <option value="active">Active</option>
                                       <option value="inactive">Inactive</option>
                                    </select>
                                 </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Aadhaar Front</label>
                                    <div
                                       className={`relative w-full h-24 bg-[var(--bg-tertiary)] border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${newEmployee.aadhaarFront ? 'border-emerald-500/50' : 'border-[var(--border-subtle)] hover:border-emerald-500/30'}`}
                                       onClick={() => document.getElementById('aadhaar-front-input').click()}
                                    >
                                       {newEmployee.aadhaarFront ? (
                                          <>
                                             <img src={newEmployee.aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-cover" />
                                             <button 
                                                type="button"
                                                onClick={(e) => handleImageDownload(e, newEmployee.aadhaarFront, `aadhaar_front_${newEmployee.name ? newEmployee.name.replace(/\s+/g, '_') : 'document'}.jpg`)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all backdrop-blur-sm shadow-md"
                                                title="Download Document"
                                             >
                                                <Download size={14} />
                                             </button>
                                          </>
                                       ) : (
                                          <>
                                             <Plus size={20} className="text-[var(--text-tertiary)]" />
                                             <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mt-1">Front Photo</span>
                                          </>
                                       )}
                                       <input
                                          id="aadhaar-front-input"
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={async (e) => {
                                             const file = e.target.files[0];
                                             if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewEmployee({ ...newEmployee, aadhaarFront: reader.result });
                                                reader.readAsDataURL(file);
                                             }
                                          }}
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Aadhaar Back</label>
                                    <div
                                       className={`relative w-full h-24 bg-[var(--bg-tertiary)] border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${newEmployee.aadhaarBack ? 'border-emerald-500/50' : 'border-[var(--border-subtle)] hover:border-emerald-500/30'}`}
                                       onClick={() => document.getElementById('aadhaar-back-input').click()}
                                    >
                                       {newEmployee.aadhaarBack ? (
                                          <>
                                             <img src={newEmployee.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-cover" />
                                             <button 
                                                type="button"
                                                onClick={(e) => handleImageDownload(e, newEmployee.aadhaarBack, `aadhaar_back_${newEmployee.name ? newEmployee.name.replace(/\s+/g, '_') : 'document'}.jpg`)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all backdrop-blur-sm shadow-md"
                                                title="Download Document"
                                             >
                                                <Download size={14} />
                                             </button>
                                          </>
                                       ) : (
                                          <>
                                             <Plus size={20} className="text-[var(--text-tertiary)]" />
                                             <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mt-1">Back Photo</span>
                                          </>
                                       )}
                                       <input
                                          id="aadhaar-back-input"
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={async (e) => {
                                             const file = e.target.files[0];
                                             if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewEmployee({ ...newEmployee, aadhaarBack: reader.result });
                                                reader.readAsDataURL(file);
                                             }
                                          }}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isSubmitting ? (
                                 <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>SYNCING_PROTOCOL...</span>
                                 </div>
                              ) : (
                                 <>
                                    <Zap size={14} fill="white" /> {modalType === 'edit' ? 'Update Staff Member' : 'Execute Staff Sync'}
                                 </>
                              )}
                           </button>
                        </form>
                     ) : (
                        <div className="space-y-6">
                           <div className="text-center py-4 space-y-4">
                              <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/10 shadow-inner">
                                 <CreditCard size={32} className="text-emerald-500" />
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest text-center">Front Side</p>
                                 <div className="aspect-video bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                                    {selectedStaff.kycDetails?.aadhaarFront ? (
                                       <div className="relative w-full h-full group">
                                          <img src={selectedStaff.kycDetails.aadhaarFront} className="w-full h-full object-contain" alt="Aadhaar Front" />
                                          <button 
                                             type="button"
                                             onClick={(e) => handleImageDownload(e, selectedStaff.kycDetails.aadhaarFront, `aadhaar_front_${selectedStaff.name ? selectedStaff.name.replace(/\s+/g, '_') : 'document'}.jpg`)}
                                             className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100"
                                             title="Download Document"
                                          >
                                             <Download size={14} />
                                          </button>
                                       </div>
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white/20 uppercase tracking-widest">No Front Image</div>
                                    )}
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest text-center">Back Side</p>
                                 <div className="aspect-video bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                                    {selectedStaff.kycDetails?.aadhaarBack ? (
                                       <div className="relative w-full h-full group">
                                          <img src={selectedStaff.kycDetails.aadhaarBack} className="w-full h-full object-contain" alt="Aadhaar Back" />
                                          <button 
                                             type="button"
                                             onClick={(e) => handleImageDownload(e, selectedStaff.kycDetails.aadhaarBack, `aadhaar_back_${selectedStaff.name ? selectedStaff.name.replace(/\s+/g, '_') : 'document'}.jpg`)}
                                             className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100"
                                             title="Download Document"
                                          >
                                             <Download size={14} />
                                          </button>
                                       </div>
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white/20 uppercase tracking-widest">No Back Image</div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
