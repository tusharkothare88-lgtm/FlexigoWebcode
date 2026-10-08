import React, { useState, useEffect } from 'react';
import { Zap, Check, Plus, Pencil, Trash2, Star, IndianRupee, X, Loader2, RefreshCw } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';

export default function WebsitePlansPage() {
  const { websitePlans, fetchWebsitePlans, addWebsitePlan, updateWebsitePlan, deleteWebsitePlan, isLoading } = useAdminDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', period: '', desc: '', popular: false, cta: '', features: '', order: 0
  });

  useEffect(() => {
    fetchWebsitePlans();
  }, [fetchWebsitePlans]);

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        desc: plan.desc,
        popular: plan.popular,
        cta: plan.cta,
        features: plan.features.join('\n'),
        order: plan.order || 0
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', price: '', period: '', desc: '', popular: false, cta: '', features: '', order: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim() !== '')
    };

    if (editingPlan) {
      await updateWebsitePlan(editingPlan._id, payload);
    } else {
      await addWebsitePlan(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      await deleteWebsitePlan(id);
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
              Plans <span className="text-emerald-500">Page</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Website · Pricing Plans Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] rounded-xl transition-all shadow-sm active:scale-95"
            title="Refresh Page"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus size={14} />
            Add New Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Plans', value: websitePlans.length, icon: Zap, color: 'emerald' },
          { label: 'Featured Plan', value: websitePlans.filter(p => p.popular).length, icon: Star, color: 'amber' },
          { label: 'Status', value: 'Live', icon: IndianRupee, color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plans Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {websitePlans.map((plan) => (
            <div
              key={plan._id}
              className={`relative bg-[var(--bg-secondary)] border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-all duration-200 ${
                plan.popular ? 'border-emerald-500/40 shadow-emerald-500/10 shadow-lg' : 'border-[var(--border-subtle)]'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                  <Star size={10} className="fill-white" /> Recommended
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 max-w-[180px] leading-relaxed">{plan.desc}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => openModal(plan)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(plan._id)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-500">{plan.price}</span>
                <span className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase">{plan.period}</span>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-[var(--text-secondary)]">
                    <Check size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">CTA Button:</span>
                <p className="text-[10px] font-bold text-[var(--text-primary)] mt-0.5">{plan.cta}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
              <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Plan Name</label>
                  <input
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. Daily Pass"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Order Index</label>
                  <input
                    type="number"
                    value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Price (with symbol)</label>
                  <input
                    type="text" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. ₹149"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Period</label>
                  <input
                    type="text" required
                    value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. per day"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description</label>
                <textarea
                  required
                  value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50 min-h-[60px]"
                  placeholder="Brief description of the plan..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">CTA Button Text</label>
                <input
                  type="text" required
                  value={formData.cta} onChange={e => setFormData({...formData, cta: e.target.value})}
                  className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. Rent for Today"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Features (one per line)</label>
                <textarea
                  required
                  value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                  className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50 min-h-[100px]"
                  placeholder="Unlimited battery swaps&#10;Zero maintenance charge&#10;..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <input
                  type="checkbox"
                  checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-tertiary)]"
                />
                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Mark as "Recommended" (Popular)</span>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
