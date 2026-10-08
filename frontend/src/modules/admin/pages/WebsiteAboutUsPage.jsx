import React, { useState, useEffect } from 'react';
import { Building2, Users, Target, Heart, Leaf, Shield, TrendingUp, Award, Zap, Pencil, MapPin, Calendar, Plus, X, Loader2, Save, Trash2 } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';

const iconMap = {
  Zap: Zap,
  Leaf: Leaf,
  Shield: Shield,
  TrendingUp: TrendingUp,
  Users: Users,
  Award: Award,
};

export default function WebsiteAboutUsPage() {
  const { websiteAbout, fetchWebsiteAbout, updateWebsiteAbout, isLoading } = useAdminDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'info', 'milestone', 'value'
  const [editingIndex, setEditingIndex] = useState(-1);

  const [formData, setFormData] = useState({
    mission: '', vision: '',
    heroTag: '', heroTitle: '', heroDescription: '',
    whoWeAreTag: '', whoWeAreTitle: '', whoWeAreDescription1: '', whoWeAreDescription2: '',
    addressTitle: '', addressContent: '',
    stats: { activeRiders: '', vehiclesDeployed: '', cities: '' },
    milestone: { year: '', title: '', desc: '' },
    value: { title: '', desc: '', icon: 'Zap', color: 'emerald' }
  });

  useEffect(() => {
    fetchWebsiteAbout();
  }, [fetchWebsiteAbout]);

  useEffect(() => {
    if (websiteAbout) {
      setFormData(prev => ({
        ...prev,
        mission: websiteAbout.mission || '',
        vision: websiteAbout.vision || '',
        heroTag: websiteAbout.heroTag || 'Our Story',
        heroTitle: websiteAbout.heroTitle || "Powering India's Last-Mile Revolution",
        heroDescription: websiteAbout.heroDescription || '',
        whoWeAreTag: websiteAbout.whoWeAreTag || 'Who We Are',
        whoWeAreTitle: websiteAbout.whoWeAreTitle || '',
        whoWeAreDescription1: websiteAbout.whoWeAreDescription1 || '',
        whoWeAreDescription2: websiteAbout.whoWeAreDescription2 || '',
        addressTitle: websiteAbout.addressTitle || 'Headquartered in Pune',
        addressContent: websiteAbout.addressContent || '',
        stats: websiteAbout.stats || { activeRiders: '', vehiclesDeployed: '', cities: '' }
      }));
    }
  }, [websiteAbout]);

  const openModal = (type, data = null, index = -1) => {
    setModalType(type);
    setEditingIndex(index);
    if (type === 'milestone') {
      setFormData(prev => ({ ...prev, milestone: data || { year: '', title: '', desc: '' } }));
    } else if (type === 'value') {
      setFormData(prev => ({ ...prev, value: data || { title: '', desc: '', icon: 'Zap', color: 'emerald' } }));
    }
    setIsModalOpen(true);
  };

  const handleUpdateInfo = async () => {
    const payload = {
      ...websiteAbout,
      mission: formData.mission,
      vision: formData.vision,
      heroTag: formData.heroTag,
      heroTitle: formData.heroTitle,
      heroDescription: formData.heroDescription,
      whoWeAreTag: formData.whoWeAreTag,
      whoWeAreTitle: formData.whoWeAreTitle,
      whoWeAreDescription1: formData.whoWeAreDescription1,
      whoWeAreDescription2: formData.whoWeAreDescription2,
      addressTitle: formData.addressTitle,
      addressContent: formData.addressContent,
      stats: formData.stats
    };
    await updateWebsiteAbout(payload);
    setIsModalOpen(false);
  };

  const handleSaveMilestone = async () => {
    let newMilestones = [...(websiteAbout?.milestones || [])];
    if (editingIndex > -1) {
      newMilestones[editingIndex] = formData.milestone;
    } else {
      newMilestones.push(formData.milestone);
    }
    await updateWebsiteAbout({ ...websiteAbout, milestones: newMilestones });
    setIsModalOpen(false);
  };

  const handleDeleteMilestone = async (index) => {
    if (window.confirm('Delete this milestone?')) {
      let newMilestones = websiteAbout.milestones.filter((_, i) => i !== index);
      await updateWebsiteAbout({ ...websiteAbout, milestones: newMilestones });
    }
  };

  const handleSaveValue = async () => {
    let newValues = [...(websiteAbout?.values || [])];
    if (editingIndex > -1) {
      newValues[editingIndex] = formData.value;
    } else {
      newValues.push(formData.value);
    }
    await updateWebsiteAbout({ ...websiteAbout, values: newValues });
    setIsModalOpen(false);
  };

  const handleDeleteValue = async (index) => {
    if (window.confirm('Delete this value?')) {
      let newValues = websiteAbout.values.filter((_, i) => i !== index);
      await updateWebsiteAbout({ ...websiteAbout, values: newValues });
    }
  };

  if (!websiteAbout && !isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-[var(--text-tertiary)] font-black uppercase tracking-widest italic">No data found. Seeding required.</p>
      <button onClick={() => fetchWebsiteAbout()} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Fetch</button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-600 rounded-full" />
            <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
              About <span className="text-emerald-500">Us</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Website · Company Overview Management
          </p>
        </div>
        <button
          onClick={() => openModal('info')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Pencil size={14} />
          Edit Page Content
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* Hero Content Preview */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Hero Section (Our Story)</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{websiteAbout?.heroTag}</p>
                <p className="text-lg font-black text-[var(--text-primary)] tracking-tight uppercase italic">{websiteAbout?.heroTitle}</p>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-tertiary)]/30 rounded-xl p-3 border border-[var(--border-subtle)]">
                {websiteAbout?.heroDescription}
              </p>
            </div>
          </div>

          {/* Who We Are Preview */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Who We Are Section</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{websiteAbout?.whoWeAreTag}</p>
                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{websiteAbout?.whoWeAreTitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed bg-[var(--bg-tertiary)]/30 rounded-xl p-3 border border-[var(--border-subtle)]">
                  {websiteAbout?.whoWeAreDescription1}
                </p>
                <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed bg-[var(--bg-tertiary)]/30 rounded-xl p-3 border border-[var(--border-subtle)]">
                  {websiteAbout?.whoWeAreDescription2}
                </p>
              </div>
            </div>
          </div>

          {/* Address Preview */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Office Address</h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">{websiteAbout?.addressTitle}</p>
                <p className="text-[9px] text-[var(--text-tertiary)] mt-1">{websiteAbout?.addressContent}</p>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Riders', value: websiteAbout?.stats?.activeRiders || '0' },
              { label: 'Vehicles Deployed', value: websiteAbout?.stats?.vehiclesDeployed || '0' },
              { label: 'Cities & Growing', value: websiteAbout?.stats?.cities || '0' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 text-center shadow-sm">
                <p className="text-3xl font-black text-emerald-500 tracking-tight">{stat.value}</p>
                <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Core Values */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Core Values</h3>
              <button onClick={() => openModal('value')} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {websiteAbout?.values?.map((v, i) => {
                const Icon = iconMap[v.icon] || Zap;
                return (
                  <div key={i} className="group relative flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]/30 border border-[var(--border-subtle)]">
                    <div className={`w-8 h-8 rounded-lg bg-${v.color || 'emerald'}-500/10 border border-${v.color || 'emerald'}-500/20 flex items-center justify-center text-${v.color || 'emerald'}-500 shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{v.title}</p>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('value', v, i)} className="p-1 hover:text-emerald-500 transition-colors"><Pencil size={10} /></button>
                      <button onClick={() => handleDeleteValue(i)} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={10} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline / Milestones */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Company Timeline</h3>
              <button onClick={() => openModal('milestone')} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                <Plus size={12} /> Add Milestone
              </button>
            </div>
            <div className="relative pl-6 space-y-5">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-[var(--border-subtle)]" />
              {websiteAbout?.milestones?.map((m, i) => (
                <div key={i} className="relative flex items-start gap-4 group">
                  <div className="absolute -left-4 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-[var(--bg-secondary)] flex items-center justify-center shadow">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{m.year}</span>
                      <Calendar size={9} className="text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">{m.title}</p>
                    <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openModal('milestone', m, i)} className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-emerald-500 transition-all">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDeleteMilestone(i)} className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-rose-500 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-12 bg-black/60 backdrop-blur-sm overflow-y-auto no-scrollbar">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
              <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                {modalType === 'info' ? 'Edit Page Content & Stats' : modalType === 'milestone' ? 'Manage Milestone' : 'Manage Core Value'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {modalType === 'info' && (
                <>
                  {/* Hero Section Editing */}
                  <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)]">
                    <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Hero Section (Our Story)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Tag</label>
                        <input
                          type="text"
                          value={formData.heroTag} onChange={e => setFormData({ ...formData, heroTag: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Title</label>
                        <input
                          type="text"
                          value={formData.heroTitle} onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description</label>
                      <textarea
                        value={formData.heroDescription} onChange={e => setFormData({ ...formData, heroDescription: e.target.value })}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Who We Are Editing */}
                  <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)]">
                    <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Who We Are Section</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Tag</label>
                        <input
                          type="text"
                          value={formData.whoWeAreTag} onChange={e => setFormData({ ...formData, whoWeAreTag: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Headline</label>
                        <input
                          type="text"
                          value={formData.whoWeAreTitle} onChange={e => setFormData({ ...formData, whoWeAreTitle: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Paragraph 1</label>
                        <textarea
                          value={formData.whoWeAreDescription1} onChange={e => setFormData({ ...formData, whoWeAreDescription1: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Paragraph 2</label>
                        <textarea
                          value={formData.whoWeAreDescription2} onChange={e => setFormData({ ...formData, whoWeAreDescription2: e.target.value })}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Editing */}
                  <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)]">
                    <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Office Address</h4>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Section Title</label>
                      <input
                        type="text"
                        value={formData.addressTitle} onChange={e => setFormData({ ...formData, addressTitle: e.target.value })}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Full Address</label>
                      <textarea
                        value={formData.addressContent} onChange={e => setFormData({ ...formData, addressContent: e.target.value })}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Mission/Vision & Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Mission Statement</label>
                        <textarea
                          value={formData.mission} onChange={e => setFormData({ ...formData, mission: e.target.value })}
                          className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Vision Statement</label>
                        <textarea
                          value={formData.vision} onChange={e => setFormData({ ...formData, vision: e.target.value })}
                          className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Key Stats</h4>
                      {Object.keys(formData.stats).map(key => (
                        <div key={key} className="space-y-1">
                          <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <input
                            type="text"
                            value={formData.stats[key]} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, [key]: e.target.value } })}
                            className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleUpdateInfo} className="w-full py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Save All Changes</button>
                </>
              )}

              {modalType === 'milestone' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Year / Period</label>
                    <input
                      type="text"
                      value={formData.milestone.year} onChange={e => setFormData({ ...formData, milestone: { ...formData.milestone, year: e.target.value } })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                      placeholder="e.g. May 2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Title</label>
                    <input
                      type="text"
                      value={formData.milestone.title} onChange={e => setFormData({ ...formData, milestone: { ...formData.milestone, title: e.target.value } })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={formData.milestone.desc} onChange={e => setFormData({ ...formData, milestone: { ...formData.milestone, desc: e.target.value } })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <button onClick={handleSaveMilestone} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    {editingIndex > -1 ? 'Update Milestone' : 'Add Milestone'}
                  </button>
                </>
              )}

              {modalType === 'value' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Title</label>
                    <input
                      type="text"
                      value={formData.value.title} onChange={e => setFormData({ ...formData, value: { ...formData.value, title: e.target.value } })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Icon (Lucide Name)</label>
                      <select
                        value={formData.value.icon} onChange={e => setFormData({ ...formData, value: { ...formData.value, icon: e.target.value } })}
                        className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                      >
                        {Object.keys(iconMap).map(key => <option key={key} value={key}>{key}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Color Theme</label>
                      <select
                        value={formData.value.color} onChange={e => setFormData({ ...formData, value: { ...formData.value, color: e.target.value } })}
                        className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                      >
                        {['emerald', 'green', 'blue', 'purple', 'amber', 'rose', 'indigo'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={formData.value.desc} onChange={e => setFormData({ ...formData, value: { ...formData.value, desc: e.target.value } })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <button onClick={handleSaveValue} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    {editingIndex > -1 ? 'Update Value' : 'Add Core Value'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
