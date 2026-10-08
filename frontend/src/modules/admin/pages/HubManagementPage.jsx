import React, { useState } from 'react';
import {
  Warehouse,
  MapPin,
  Activity,
  Plus,
  Search,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Signal,
  User,
  X,
  Zap,
  Globe,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';

const emptyForm = { name: '', city: '', fleet: '', ownerName: '', phone: '', email: '', password: '' };

const FormInput = ({ label, value, onChange, type = 'text', placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">{label}{required ? ' *' : ''}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-5 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50"
    />
  </div>
);

const HubFormFields = ({ data, setData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[55vh] pr-1 custom-scrollbar">
    <div className="md:col-span-2">
      <FormInput label="Hub Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="e.g. Pune Central Hub" required />
    </div>
    <FormInput label="City / Location" value={data.city} onChange={e => setData({ ...data, city: e.target.value })} placeholder="e.g. Pune, MH" required />
    <FormInput label="Fleet Capacity" value={data.fleet} onChange={e => setData({ ...data, fleet: e.target.value })} type="number" placeholder="e.g. 150" />
    <div className="md:col-span-2 pt-2 border-t border-[var(--border-subtle)]">
      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-2 italic">Owner Credentials</p>
    </div>
    <FormInput label="Owner Name" value={data.ownerName} onChange={e => setData({ ...data, ownerName: e.target.value })} placeholder="Legal Name" required />
    <div className="space-y-2">
      <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Phone Number *</label>
      <input
        type="tel"
        value={data.phone}
        onChange={e => setData({ ...data, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
        placeholder="10-digit mobile"
        required
        className="w-full px-5 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50"
      />
    </div>
    <FormInput label="Email Address" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} type="email" placeholder="owner@flexigo.com" />
    <FormInput label="Password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} type="password" placeholder="••••••••" />
  </div>
);

export default function HubManagementPage() {
  const navigate = useNavigate();
  const { hubs, networkStats, fetchHubs, fetchDashboardStats, addHub, updateHub, removeHub, kycRecords, vehicles, fetchKycRecords, fetchAllVehicles } = useAdminDataStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editHub, setEditHub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  React.useEffect(() => {
    fetchHubs();
    fetchKycRecords();
    fetchAllVehicles();
    if (networkStats.totalHubs === 0) fetchDashboardStats();
    
    // Safety timeout to prevent infinite Syncing...
    const timer = setTimeout(() => setIsInitialLoad(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredHubs = hubs.filter(h =>
    (h.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (h.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    ((h._id || h.id)?.toString().toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleAddHub = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.ownerName || !formData.phone) {
      alert('Please fill in all required fields (Name, City, Owner Name, and Phone)');
      return;
    }
    if (formData.phone.length !== 10) {
      alert('Phone number must be 10 digits');
      return;
    }
    const result = await addHub({
      name: formData.name,
      city: formData.city,
      fleet: parseInt(formData.fleet) || 0,
      ownerName: formData.ownerName,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@flexigo.com`,
      password: formData.password || 'flexigo@123'
    });
    if (result?.success) {
      setFormData(emptyForm);
      setIsAddModalOpen(false);
    } else {
      alert('Failed to add franchise: ' + (result?.message || 'Unknown error'));
    }
  };

  const handleEditOpen = (e, hub) => {
    e.stopPropagation();
    setEditHub(hub);
    setEditFormData({
      name: hub.name || '',
      city: hub.city || '',
      fleet: hub.capacity || hub.fleet || '',
      ownerName: hub.ownerName || '',
      phone: hub.phone || '',
      email: hub.email || '',
      password: ''
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const id = (editHub.id || editHub._id)?.toString();
    const result = await updateHub(id, {
      name: editFormData.name,
      city: editFormData.city,
      fleet: parseInt(editFormData.fleet) || 0,
      ownerName: editFormData.ownerName,
      phone: editFormData.phone,
      email: editFormData.email,
      password: editFormData.password,
    });
    if (result?.success) {
      setEditHub(null);
    } else {
      alert('Failed to update franchise: ' + (result?.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const id = (deleteTarget.id || deleteTarget._id)?.toString();
    const result = await removeHub(id);
    setIsDeleting(false);
    if (result?.success) {
      setDeleteTarget(null);
    } else {
      alert('Failed to delete franchise: ' + (result?.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-600 rounded-full" />
            <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
              Franchise <span className="text-emerald-500">Directory</span>
            </h1>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
            Regional Operational Registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OpsFilter onFilterChange={(newFilters) => {
            setActiveFilters(newFilters);
            fetchHubs(newFilters);
          }} />
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Node..."
              className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-32 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={12} strokeWidth={3} /> Launch Hub
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard title="Total Franchises" value={hubs.length} icon={Warehouse} color="emerald" subtitle="Active nodes" />
        <AdminStatCard title="Utilization" value={networkStats.hubUtilization} icon={TrendingUp} color="blue" subtitle="Avg space" />
        <AdminStatCard title="Connectivity" value={networkStats.connectivity || "98.2%"} icon={Signal} color="emerald" subtitle="Uptime" />
        <AdminStatCard title="System Health" value={networkStats.systemHealth || "94%"} icon={Activity} color="emerald" subtitle="Registry sync" />
      </div>

      {/* Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredHubs.map((hub, idx) => {
            const hubId = (hub._id || hub.id)?.toString();
            const dynamicFleet = hub.fleet;
            const dynamicSubs = hub.subs;

            return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01, y: -2 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
              key={hub._id || hub.id}
              onClick={() => navigate(`/admin/hubs/${hub._id || hub.id}`)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm hover:border-emerald-500/30 transition-all group cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Warehouse size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none">{hub.name}</h3>
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                      <MapPin size={8} className="text-emerald-500" /> {hub.city}
                    </div>
                    {hub.ownerName && (
                      <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest italic opacity-80">
                        <User size={8} className="text-emerald-500" /> {hub.ownerName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${hub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    {hub.status}
                  </div>
                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleEditOpen(e, hub)}
                      className="p-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                      title="Edit franchise"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(hub); }}
                      className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                      title="Delete franchise"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-y border-[var(--border-subtle)]">
                <div>
                  <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Assigned Riders</p>
                  <p className="text-sm font-black text-[var(--text-primary)] tracking-tight">
                    {isInitialLoad ? <span className="text-[var(--text-tertiary)]/50 text-[10px] animate-pulse font-medium">Syncing...</span> : dynamicSubs}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Revenue</p>
                  <p className="text-sm font-black text-emerald-600 tracking-tight">₹{(hub.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: hub.health }} />
                  </div>
                  <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">{hub.health} Health</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/admin/hubs/${hub._id || hub.id}`); }}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:text-emerald-500 transition-colors group/btn active:scale-95"
                >
                  Details <ArrowUpRight size={10} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredHubs.length === 0 && (
          <div className="col-span-full py-20 text-center text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
            No franchises found. Launch a new hub to get started.
          </div>
        )}
      </div>

      {/* Add Hub Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                    Register <span className="text-emerald-500">New Franchise</span>
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Operational Expansion Wizard</p>
                </div>
                <button onClick={() => { setIsAddModalOpen(false); setFormData(emptyForm); }} className="p-2 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddHub} className="space-y-6">
                <HubFormFields data={formData} setData={setFormData} />
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-950/40 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Zap size={16} fill="white" /> Initialize Franchise Protocol
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Hub Modal */}
      <AnimatePresence>
        {editHub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                    Edit <span className="text-blue-400">Franchise</span>
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Update operational parameters</p>
                </div>
                <button onClick={() => setEditHub(null)} className="p-2 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-6">
                <HubFormFields data={editFormData} setData={setEditFormData} />
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Pencil size={16} /> Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[var(--bg-secondary)] border border-rose-500/20 rounded-[2rem] p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-[var(--text-primary)] uppercase italic tracking-tight">Delete Franchise?</h3>
                <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
                  This will permanently remove <span className="text-rose-400">{deleteTarget.name}</span> and cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
