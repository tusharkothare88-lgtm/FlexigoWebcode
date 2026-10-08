import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  Calendar,
  ShieldCheck,
  ZapOff,
  MoreVertical,
  X,
  Target,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

export default function SubscriptionPlansPage() {
  const { 
    plans: allPlans, 
    networkStats,
    fetchPlans, 
    fetchDashboardStats,
    addPlan, 
    updatePlan, 
    deletePlan 
  } = useAdminDataStore();
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sub_plans_active_tab') || 'Rider');
  const [activeFilters, setActiveFilters] = React.useState(() => {
    const saved = localStorage.getItem('sub_plans_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.range === 'Last 7 Days') {
          return { range: 'All Time' };
        }
        return parsed;
      } catch (e) {
        return { range: 'All Time' };
      }
    }
    return { range: 'All Time' };
  });

  React.useEffect(() => {
    localStorage.setItem('sub_plans_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem('sub_plans_filters', JSON.stringify(activeFilters));
  }, [activeFilters]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Daily', price: '', deposit: '', features: [''] });

  React.useEffect(() => {
    fetchPlans(activeFilters);
    fetchDashboardStats(activeFilters);
  }, []);

  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchPlans(newFilters);
    fetchDashboardStats(newFilters);
    console.log('Subscription Plans Sync:', newFilters);
  };

  const filteredPlans = allPlans.filter(p => p.target === activeTab);
  
  const avgTicket = filteredPlans.length > 0 
    ? Math.round(filteredPlans.reduce((acc, p) => acc + p.price, 0) / filteredPlans.length) 
    : 0;

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ 
        name: plan.name, 
        type: plan.type, 
        price: plan.price, 
        deposit: plan.deposit, 
        features: plan.features || [] 
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', type: activeTab === 'Rider' ? 'Daily' : 'Franchise', price: '', deposit: '', features: [''] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const planPayload = {
      name: formData.name,
      type: formData.type,
      price: parseInt(formData.price),
      deposit: parseInt(formData.deposit),
      features: formData.features.filter(f => f.trim() !== ''),
      target: activeTab
    };

    if (editingPlan) {
      await updatePlan(editingPlan._id, planPayload);
    } else {
      await addPlan(planPayload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
        await deletePlan(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
               <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Subscription <span className="text-emerald-500">Plans</span>
               </h1>
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] opacity-60 ml-4">
               Configure and manage service tiers for riders and franchise partners
            </p>
         </div>
         
          <div className="flex items-center gap-3">
            <OpsFilter onFilterChange={handleFilterChange} />
            <button 
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
                <Plus size={16} /> Add Plan
            </button>
          </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <AdminStatCard title="Active Plans" value={filteredPlans.length} icon={Layers} color="emerald" subtitle="Market Offerings" />
         <AdminStatCard title="Avg. Ticket" value={`₹${avgTicket.toLocaleString()}`} icon={IndianRupee} color="blue" subtitle="Revenue Per User" />
         <AdminStatCard title="Churn Rate" value={networkStats.churnRate} icon={ZapOff} color="rose" subtitle="Plan Delta" />
      </div>

      {/* Tab Selector */}
      <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1.5 rounded-2xl shadow-sm w-fit">
        {['Rider', 'Franchise'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === tab 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 key={plan._id || plan.id} 
                 className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group relative flex flex-col h-full"
               >
                  {/* Admin Actions Overlay */}
                  <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                     <button 
                        onClick={() => handleOpenModal(plan)} 
                        className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm"
                     >
                        <Edit3 size={12} />
                     </button>
                     <button 
                        onClick={() => handleDelete(plan._id || plan.id)} 
                        className="p-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm"
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>

                  {/* Plan Header */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-3">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {plan.type === 'Daily' ? '⚡' : plan.type === 'Weekly' ? '📅' : '🏢'} {plan.type} CYCLE
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                      {plan.name}
                    </h3>

                  </div>

                  {/* Pricing Section */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">₹{plan.price.toLocaleString()}</span>
                      <span className="text-xs font-medium text-[var(--text-tertiary)] opacity-60">/{plan.type.toLowerCase()}</span>
                    </div>
                    <div className="mt-1">
                       <span className="text-[9px] font-bold text-[var(--text-tertiary)] opacity-40 uppercase tracking-wider">Deposit: ₹{plan.deposit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[var(--border-subtle)] opacity-50 mb-5" />

                  {/* Features List */}
                  <div className="flex-grow space-y-3 mb-6">
                     <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">Services</p>
                     <div className="space-y-2">
                        {plan.features.map((f, i) => (
                           <div key={i} className="flex items-start gap-2.5">
                              <div className="mt-1 p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                 <CheckCircle size={10} className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] leading-snug">{f}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Decorative Gradient */}
                  <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full -z-10" />
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Plan Modal */}
      {typeof document !== 'undefined' && createPortal(
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-md custom-scrollbar overscroll-contain">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.98, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.98, y: 10 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl relative overflow-hidden my-auto"
                  >
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="space-y-0.5">
                           <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                               {editingPlan ? 'Edit' : 'Create'} <span className="text-emerald-500">Plan</span>
                            </h2>
                            <p className="text-[10px] font-medium text-[var(--text-tertiary)] opacity-60 uppercase tracking-widest">Config Tier v6.0</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={18} />
                        </button>
                     </div>

                     <form onSubmit={handleSave} className="space-y-5 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2 space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--text-primary)] ml-1 uppercase tracking-wider opacity-70">Plan Identity</label>
                              <input 
                                 required
                                 value={formData.name}
                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                                 placeholder="e.g. Gig Economy Heavy"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--text-primary)] ml-1 uppercase tracking-wider opacity-70">Cycle Type</label>
                              <select 
                                 value={formData.type}
                                 onChange={(e) => setFormData({...formData, type: e.target.value})}
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                              >
                                 <option value="Daily">Daily</option>
                                 <option value="Weekly">Weekly</option>
                                 <option value="Monthly">Monthly</option>
                                 <option value="Franchise">Franchise</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--text-primary)] ml-1 uppercase tracking-wider opacity-70">Price (₹)</label>
                              <input 
                                 type="number"
                                 required
                                 value={formData.price}
                                 onChange={(e) => setFormData({...formData, price: e.target.value})}
                                 placeholder="0"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                              />
                           </div>
                           <div className="col-span-2 space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--text-primary)] ml-1 uppercase tracking-wider opacity-70">Deposit (₹)</label>
                              <input 
                                 type="number"
                                 required
                                 value={formData.deposit}
                                 onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                                 placeholder="0"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                              />
                           </div>
                           
                           <div className="col-span-2 space-y-3 pt-1">
                              <div className="flex items-center justify-between ml-1">
                                 <label className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider opacity-70">Included Features</label>
                                 <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, features: [...formData.features, '']})}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-bold hover:bg-emerald-500 hover:text-white transition-all"
                                 >
                                    <Plus size={10} /> Add Feature
                                 </button>
                              </div>
                              
                              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                                 {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                       <input 
                                          required
                                          value={feature}
                                          onChange={(e) => {
                                             const newFeatures = [...formData.features];
                                             newFeatures[index] = e.target.value;
                                             setFormData({...formData, features: newFeatures});
                                          }}
                                          placeholder="e.g. 24h Access"
                                          className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                       />
                                       <button 
                                          type="button"
                                          onClick={() => {
                                             const newFeatures = formData.features.filter((_, i) => i !== index);
                                             setFormData({...formData, features: newFeatures.length ? newFeatures : ['']});
                                          }}
                                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                       >
                                          <Trash2 size={14} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <button 
                           type="submit"
                           className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                        >
                           <Zap size={14} fill="currentColor" /> {editingPlan ? 'Update Plan' : 'Create Plan'}
                        </button>
                     </form>

                     {/* Background Decoration */}
                     <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                     <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
                  </motion.div>
               </div>
            )}
         </AnimatePresence>,
         document.body
      )}
    </div>
  );
}
