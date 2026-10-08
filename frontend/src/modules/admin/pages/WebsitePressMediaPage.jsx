import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Pencil, Trash2, Tag, Calendar, ExternalLink, Download, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';

const mediaAssets = [
  { title: 'FlexiGo Logo Pack', desc: 'PNG, SVG, and dark/light variants for editorial use.' },
  { title: 'Brand Guidelines', desc: 'Official color palette, typography, and brand standards.' },
  { title: 'Product Screenshots', desc: 'High-res screenshots of Rider App, Franchise Panel, and Dashboard.' },
];

export default function WebsitePressMediaPage() {
  const { websitePressReleases, fetchWebsitePressReleases, addPressRelease, updatePressRelease, deletePressRelease, isLoading } = useAdminDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [formData, setFormData] = useState({
    date: '', tag: '', title: '', excerpt: '', published: true, order: 0, link: ''
  });

  useEffect(() => {
    fetchWebsitePressReleases();
  }, [fetchWebsitePressReleases]);

  const openModal = (release = null) => {
    if (release) {
      setEditingRelease(release);
      setFormData({
        date: release.date,
        tag: release.tag,
        title: release.title,
        excerpt: release.excerpt,
        published: release.published,
        order: release.order || 0,
        link: release.link || ''
      });
    } else {
      setEditingRelease(null);
      setFormData({ date: '', tag: '', title: '', excerpt: '', published: true, order: 0, link: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingRelease) {
      await updatePressRelease(editingRelease._id, formData);
    } else {
      await addPressRelease(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this press release?')) {
      await deletePressRelease(id);
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
              Press & <span className="text-emerald-500">Media</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Website · Newsroom Management
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={14} />
          New Press Release
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Releases', value: websitePressReleases.length, icon: Newspaper },
          { label: 'Published', value: websitePressReleases.filter(r => r.published).length, icon: ExternalLink },
          { label: 'Media Assets', value: mediaAssets.length, icon: Download },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Press Releases */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Newspaper size={14} />
            </div>
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">Press Releases</h3>
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            websitePressReleases.map((pr) => (
              <div key={pr._id} className="p-5 flex items-start gap-4 hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={9} /> {pr.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/10">
                      <Tag size={8} /> {pr.tag}
                    </span>
                    {pr.link && (
                       <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/10 flex items-center gap-1">
                          <LinkIcon size={8} /> Linked
                       </span>
                    )}
                    {pr.published ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/10">
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest border border-rose-500/10">
                        Draft
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-snug mb-1">{pr.title}</h4>
                  <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2">{pr.excerpt}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    onClick={() => openModal(pr)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pr._id)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
          {!isLoading && websitePressReleases.length === 0 && (
            <div className="py-12 text-center text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">
              No press releases found
            </div>
          )}
        </div>
      </div>

      {/* Media Assets (Static) */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Download size={14} />
            </div>
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">Media Kit Assets</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
          {mediaAssets.map((asset) => (
            <div key={asset.title} className="p-5 flex items-start gap-3 group hover:bg-[var(--bg-tertiary)]/10 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Download size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight">{asset.title}</p>
                <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 leading-relaxed">{asset.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-12 bg-black/60 backdrop-blur-sm overflow-y-auto no-scrollbar">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-emerald-500/5">
              <h3 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                {editingRelease ? 'Edit Press Release' : 'New Press Release'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Publish Date</label>
                  <input
                    type="text" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. May 2026"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Tag / Category</label>
                  <input
                    type="text" required
                    value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}
                    className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. Platform Launch"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Title</label>
                <input
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                  placeholder="Headline of the press release..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Redirect Link (Optional)</label>
                <div className="relative">
                   <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                   <input
                     type="url"
                     value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                     className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50"
                     placeholder="https://news-site.com/article"
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Excerpt / Summary</label>
                <textarea
                  required
                  value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-[11px] font-bold focus:outline-none focus:border-emerald-500/50 min-h-[100px]"
                  placeholder="Short summary of the news..."
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Published Status</p>
                  <p className="text-[8px] text-[var(--text-tertiary)]">Toggle whether this release is visible on the public site.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

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
                  {editingRelease ? 'Update Release' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
