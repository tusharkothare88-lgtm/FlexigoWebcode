import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Zap, 
  FileWarning, 
  User, 
  Plus, 
  Edit, 
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { motion, AnimatePresence } from 'framer-motion';

import { useAdminDataStore } from '../store/adminDataStore';

export default function RiderBehaviourPage() {
  const { riderBehaviour, fetchRiderBehaviour, riders, fetchRiders, addRider, updateRider, removeRider, plans, fetchPlans } = useAdminDataStore();
  const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });

  // Modal State
  // Modal State Persistence
  const [isModalOpen, setIsModalOpen] = useState(() => localStorage.getItem('rider_modal_open') === 'true');
  const [modalMode, setModalMode] = useState(() => localStorage.getItem('rider_modal_mode') || 'add');
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('rider_form_data');
    return saved ? JSON.parse(saved) : { name: '', phone: '', email: '', status: 'active', plan: '' };
  });
  const [selectedRiderId, setSelectedRiderId] = useState(() => localStorage.getItem('rider_selected_id'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('rider_modal_open', isModalOpen);
    localStorage.setItem('rider_modal_mode', modalMode);
    localStorage.setItem('rider_form_data', JSON.stringify(formData));
    if (selectedRiderId) localStorage.setItem('rider_selected_id', selectedRiderId);
    else localStorage.removeItem('rider_selected_id');
  }, [isModalOpen, modalMode, formData, selectedRiderId]);

  useEffect(() => {
    fetchRiderBehaviour(activeFilters);
    fetchRiders(activeFilters);
    fetchPlans({ range: 'All Time' }); // Plans are master data, shouldn't be date-filtered for dropdowns
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchRiderBehaviour(newFilters);
    fetchRiders(newFilters);
    // Note: fetchPlans is not called here with newFilters to ensure dropdown stays populated with all plans
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', phone: '', email: '', status: 'active', plan: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (rider) => {
    setModalMode('edit');
    setSelectedRiderId(rider._id);
    setFormData({
      name: rider.name || '',
      phone: rider.phone || '',
      email: rider.email || '',
      status: rider.status || 'active',
      plan: rider.subscriptionPlan?._id || rider.subscriptionPlan || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rider?")) {
      await removeRider(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await addRider(formData);
      } else {
        await updateRider(selectedRiderId, formData);
      }
      setIsModalOpen(false);
      // Clear persistence on success
      localStorage.removeItem('rider_modal_open');
      localStorage.removeItem('rider_form_data');
      localStorage.removeItem('rider_selected_id');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateRider(id, { status: 'active', kycStatus: 'approved' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-6 bg-emerald-600 rounded-full" />
               <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Rider <span className="text-emerald-500">Management</span>
               </h1>
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] ml-3">
               Manage riders, track status, and control access
            </p>
         </div>
         
         <div className="flex items-center gap-3">
            <OpsFilter onFilterChange={handleFilterChange} />
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
            >
               <Plus size={16} /> Add Rider
            </button>
         </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         <AdminStatCard title="Active Alerts" value={riderBehaviour.activeAlerts} icon={Bell} color="rose" subtitle="Requires Dispatch" />
         <AdminStatCard title="Low Balance" value={riderBehaviour.lowBalance} icon={Zap} color="amber" subtitle="Wallet Threshold" />
         <AdminStatCard title="Doc Expiry" value={riderBehaviour.docExpiry} icon={FileWarning} color="blue" subtitle="Insurance Delta" />
      </div>

      <div className="grid grid-cols-1 gap-6">
         {/* Rider Table */}
         <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/5">
               <h3 className="text-base font-semibold text-[var(--text-primary)]">Riders List</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10">
                        {['Rider ID', 'Name', 'Phone', 'Email', 'Plan', 'Status', 'Actions'].map((header) => (
                           <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {(riders || []).map((rider) => (
                        <tr key={rider._id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                           <td className="py-2 px-4 font-normal text-[var(--text-secondary)]">{(rider._id || "").slice(-6).toUpperCase()}</td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
                                    <User size={14} className="text-[var(--text-secondary)]" />
                                 </div>
                                 <span className="font-normal text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors whitespace-nowrap">{rider.name || 'Unnamed Rider'}</span>
                              </div>
                           </td>
                           <td className="py-2 px-4 text-[var(--text-secondary)] whitespace-nowrap">{rider.phone}</td>
                           <td className="py-2 px-4 text-[var(--text-secondary)] whitespace-nowrap">{rider.email || 'N/A'}</td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded text-[10px] font-bold text-blue-500 uppercase tracking-tighter w-fit">
                                 {rider.subscriptionPlan?.name || 'No Plan'}
                              </div>
                           </td>
                           <td className="py-2 px-4">
                              <div className={`inline-flex px-2.5 py-1 rounded-md text-xs font-normal border whitespace-nowrap ${
                                 ['active', 'approved'].includes(rider.status) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                 rider.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}>
                                 {rider.status}
                              </div>
                           </td>
                           <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                 {!['active', 'approved'].includes(rider.status) && (
                                   <button onClick={() => handleApprove(rider._id)} className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Approve Rider">
                                      <CheckCircle2 size={16} />
                                   </button>
                                 )}
                                 <button onClick={() => openEditModal(rider)} className="p-1.5 text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Edit Rider">
                                    <Edit size={16} />
                                 </button>
                                 <button onClick={() => handleDelete(rider._id)} className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete Rider">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {riders?.length === 0 && (
                       <tr>
                         <td colSpan="6" className="py-8 text-center text-[var(--text-tertiary)] text-sm">No riders found. Add a rider to get started.</td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {modalMode === 'add' ? 'Add New Rider' : 'Edit Rider'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter rider name"
                    required
                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setFormData({...formData, phone: val});
                      }
                    }}
                    placeholder="10-digit phone number"
                    required
                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                   </select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-[var(--text-secondary)]">Assigned Plan</label>
                   <select
                     value={formData.plan}
                     onChange={(e) => setFormData({...formData, plan: e.target.value})}
                     className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                   >
                     <option value="">Select a Plan</option>
                     {(plans || []).filter(p => p.target === 'Rider').map(plan => (
                       <option key={plan._id} value={plan._id}>{plan.name} (₹{plan.price})</option>
                     ))}
                   </select>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create Rider' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
