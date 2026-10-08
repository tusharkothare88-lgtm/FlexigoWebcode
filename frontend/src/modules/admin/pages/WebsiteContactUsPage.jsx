import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Search, CheckCircle2, Circle, Trash2, Loader2, RefreshCcw, Pencil, X, Save, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';

export default function WebsiteContactUsPage() {
  const {
    websiteInquiries, fetchWebsiteInquiries, updateInquiryStatus, deleteInquiry,
    websiteContactInfo, fetchWebsiteContactInfo, updateWebsiteContactInfo,
    isLoading
  } = useAdminDataStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '', phone: '', address: '', workingHours: '',
    socialLinks: { instagram: '', linkedin: '', twitter: '' }
  });

  useEffect(() => {
    fetchWebsiteInquiries();
    fetchWebsiteContactInfo();
  }, [fetchWebsiteInquiries, fetchWebsiteContactInfo]);

  useEffect(() => {
    if (websiteContactInfo) {
      setFormData({
        email: websiteContactInfo.email || '',
        phone: websiteContactInfo.phone || '',
        address: websiteContactInfo.address || '',
        workingHours: websiteContactInfo.workingHours || '',
        socialLinks: websiteContactInfo.socialLinks || { instagram: '', linkedin: '', twitter: '' }
      });
    }
  }, [websiteContactInfo]);

  const filtered = websiteInquiries.filter(i => {
    const matchesSearch =
      (i.name?.toLowerCase().includes(search.toLowerCase())) ||
      (i.subject?.toLowerCase().includes(search.toLowerCase())) ||
      (i.email?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || i.status === filter;
    return matchesSearch && matchesFilter;
  });

  const openCount = websiteInquiries.filter(i => i.status === 'open').length;
  const resolvedCount = websiteInquiries.filter(i => i.status === 'resolved').length;

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
    await updateInquiryStatus(id, newStatus);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      await deleteInquiry(id);
    }
  };

  const handleUpdateContactInfo = async () => {
    await updateWebsiteContactInfo(formData);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-600 rounded-full" />
            <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
              Contact <span className="text-emerald-500">Us</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Website · Inquiry Management & Contact Info
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Pencil size={14} />
            Edit Contact Info
          </button>
          <button
            onClick={() => fetchWebsiteInquiries()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Contact Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', value: websiteInquiries.length, icon: Mail, color: 'blue' },
          { label: 'Open', value: openCount, icon: Circle, color: 'amber' },
          { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'emerald' },
          { label: 'Success Rate', value: websiteInquiries.length ? `${Math.round((resolvedCount / websiteInquiries.length) * 100)}%` : '0%', icon: Clock, color: 'purple' },
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

      {/* Published Contact Details */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Published Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: 'Address', value: websiteContactInfo?.address || 'Baner, Pune' },
            { icon: Phone, label: 'Phone', value: websiteContactInfo?.phone || '+91 99229 68093' },
            { icon: Clock, label: 'Working Hours', value: websiteContactInfo?.workingHours || 'Mon-Sat' },
            { icon: Mail, label: 'Email', value: websiteContactInfo?.email || 'support@flexigo.in' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)]/30 border border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <item.icon size={14} />
              </div>
              <div>
                <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{item.label}</p>
                <p className="text-[10px] font-bold text-[var(--text-primary)] mt-0.5 leading-relaxed line-clamp-2">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Mail size={14} />
            </div>
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">Incoming Inquiries</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {['all', 'open', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:text-emerald-500'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none w-48 text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                  {['Name', 'Email', 'Phone', 'Subject', 'Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap uppercase tracking-tighter">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filtered.map((inq) => (
                  <tr key={inq._id} className="hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{inq.name}</p>
                    </td>
                    <td className="py-2.5 px-4 text-[10px] text-[var(--text-secondary)] font-medium">{inq.email}</td>
                    <td className="py-2.5 px-4 text-[10px] text-[var(--text-secondary)] font-medium">{inq.phone}</td>
                    <td className="py-2.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase italic">{inq.subject}</p>
                        <p className="text-[9px] text-[var(--text-tertiary)] line-clamp-1">{inq.message}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[10px] text-[var(--text-tertiary)] font-bold">{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(inq._id, inq.status)}
                        className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${inq.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500 hover:text-white'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/10 hover:bg-amber-500 hover:text-white'
                          }`}>{inq.status}</button>
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">
                      No inquiries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
              <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                Edit Published Contact Info
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Working Hours</label>
                    <input
                      type="text"
                      value={formData.workingHours} onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                      placeholder="e.g. Mon - Sat: 10AM - 7PM"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Office Address</label>
                    <textarea
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-subtle)]">
                <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  Social Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Instagram size={10} /> Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks.instagram} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Linkedin size={10} /> LinkedIn
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks.linkedin} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Twitter size={10} /> Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks.twitter} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdateContactInfo}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                Save Contact Information
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
