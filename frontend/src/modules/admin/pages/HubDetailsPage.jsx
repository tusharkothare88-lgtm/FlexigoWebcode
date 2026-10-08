import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Warehouse,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Box,
  IndianRupee,
  Signal,
  MoreHorizontal,
  Settings,
  Battery,
  Map as MapIcon,
  Search,
  Filter,
  Plus,
  Pencil,
  X,
  Save,
  Wallet,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard.jsx';
import OpsFilter from '../components/OpsFilter.jsx';
import { useAdminDataStore } from '../store/adminDataStore.js';

export default function HubDetailsPage() {
  const { hubId } = useParams();
  const navigate = useNavigate();
  const { hubs, fetchHubById, fetchHubVehicles, updateHub, kycRecords, fetchKycRecords, assignVehicle } = useAdminDataStore();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [activeTab, setActiveTab] = useState('riders');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ riderName: '', riderPhone: '', vehiclePlate: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isCrediting, setIsCrediting] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDesc, setCreditDesc] = useState('');
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // First try to find in local store
      let found = hubs.find(h => (h._id || h.id)?.toString() === hubId);
      if (!found) {
        // Fetch from API
        found = await fetchHubById(hubId);
      }
      if (found) {
        setHub(found);
        loadVehicles();
        fetchKycRecords();
      }
      setLoading(false);
    };
    load();
  }, [hubId]);

  const loadVehicles = async () => {
    setLoadingVehicles(true);
    const data = await fetchHubVehicles(hubId);
    setVehicles(data || []);
    setLoadingVehicles(false);
  };

  const handleEditOpen = () => {
    setEditData({
      name: hub.name || hub.hubName || '',
      ownerName: hub.ownerName || '',
      city: hub.city || '',
      phone: hub.phone || '',
      email: hub.email || '',
      fleet: hub.capacity || ''
    });
    setIsEditing(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const id = (hub.id || hub._id)?.toString();
    const result = await updateHub(id, editData);
    if (result?.success) {
      setHub(prev => ({ ...prev, ...result.hub }));
      setIsEditing(false);
    } else {
      alert('Failed to update: ' + (result?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Locating Hub Node...</p>
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Hub not found</p>
          <button onClick={() => navigate('/admin/hubs')} className="text-emerald-500 text-xs font-bold uppercase">← Back to Registry</button>
        </div>
      </div>
    );
  }

  const assignedRiders = (kycRecords || []).filter(r => 
    r.status === 'approved' && 
    r.role?.toLowerCase() === 'rider' && 
    (r.franchiseId === hubId || r.franchise?._id === hubId || r.franchise === hubId)
  );

  const sections = [
    { title: 'Assigned Riders', icon: Users, count: assignedRiders.length, color: 'blue' },
    { title: 'Hub Health', icon: Activity, count: hub.health ?? '100%', color: 'rose' },
    { title: 'Revenue', icon: IndianRupee, count: `₹${((hub.revenue || 0) / 1000).toFixed(0)}k`, color: 'amber' },
  ];

  const handleAction = (e, vehicleId, action) => {
    e.stopPropagation();
    alert(`${action.toUpperCase()} requested for ${vehicleId}`);
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg hover:border-emerald-500/30 transition-all active:scale-95"
        >
          <ArrowLeft size={14} className="text-emerald-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-primary)]">Back to Registry</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <OpsFilter onFilterChange={() => {}} />
          <button
            onClick={handleEditOpen}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-blue-500/30 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-blue-500/10 transition-all active:scale-95"
          >
            <Pencil size={13} /> Edit Franchise
          </button>
          <button
            onClick={() => setIsCrediting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-500/20 transition-all active:scale-95"
          >
            <Wallet size={13} /> Credit Wallet
          </button>
          {/* Add Vehicle button hidden as requested */}
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
          <Warehouse size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <Warehouse size={24} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">{hub.name}</h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                  {hub.status || 'active'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                <span className="flex items-center gap-1"><MapPin size={10} className="text-emerald-500" /> {hub.city}</span>
                <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
                <span className="text-emerald-500">ID: {hub.id || hub._id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">MTD Revenue</p>
              <div className="flex items-center gap-1.5">
                <IndianRupee size={12} className="text-emerald-500" />
                <span className="text-lg font-black text-[var(--text-primary)] italic">{((hub.revenue || 0) / 100000).toFixed(2)}L</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div className="flex gap-2">
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-center space-y-0.5">
                <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest leading-none">Latency</p>
                <div className="flex items-center justify-center gap-1 text-emerald-500">
                  <Signal size={12} />
                  <span className="text-sm font-black">98ms</span>
                </div>
              </div>
              <div className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-center space-y-0.5 shadow-md shadow-emerald-950/10">
                <p className="text-[7px] font-black text-emerald-100 uppercase tracking-widest leading-none opacity-80">Sync</p>
                <div className="flex items-center justify-center gap-1">
                  <Zap size={12} fill="white" />
                  <span className="text-sm font-black uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl hover:border-emerald-500/30 transition-all relative overflow-hidden"
          >
            <div className="absolute -right-2 -bottom-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <section.icon size={60} />
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-${section.color}-500/10 border border-${section.color}-500/20 flex items-center justify-center text-${section.color}-500`}>
                <section.icon size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest leading-none">{section.title}</p>
                <p className="text-xl font-black text-[var(--text-primary)] italic tracking-tight">{section.count}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                Assigned <span className="text-emerald-500">Riders Registry</span>
              </h2>
              <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                {assignedRiders.length} rider{assignedRiders.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                    {activeTab === 'vehicles' ? (
                      <>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Plate</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Model</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Rider</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Plan & Dues</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Battery</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Action</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Plate</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Model</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Rider</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Plan & Dues</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Battery</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {loadingVehicles ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[10px] font-medium text-[var(--text-tertiary)]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                          <span>Loading assignment data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : assignedRiders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No riders assigned</p>
                      </td>
                    </tr>
                  ) : (
                    assignedRiders.map(r => {
                        const rId = r._id || r.id || 'N/A';
                        const displayId = rId.toString().substring(0, 6);
                        
                        let v = null;
                        if (r.vehicleId) {
                           const vId = typeof r.vehicleId === 'object' ? (r.vehicleId._id || r.vehicleId.id) : r.vehicleId;
                           v = vehicles.find(veh => (veh._id || veh.id) === vId);
                        }
                        if (!v && (r.vehiclePlate || r.vehicleNo)) {
                           const plateToFind = (r.vehiclePlate || r.vehicleNo).toLowerCase();
                           v = vehicles.find(veh => veh.plate?.toLowerCase() === plateToFind);
                        }
                        
                        return (
                          <tr key={rId} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                            <td className="px-4 py-2">
                              {v ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)] flex items-center justify-center text-emerald-500 font-medium text-[9px]">EV</div>
                                  <span className="font-medium text-[var(--text-primary)] text-xs">{v.plate}</span>
                                </div>
                              ) : (r.vehiclePlate || r.vehicleNo) ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)] flex items-center justify-center text-emerald-500 font-medium text-[9px]">EV</div>
                                  <span className="font-medium text-[var(--text-primary)] text-xs">{r.vehiclePlate || r.vehicleNo}</span>
                                </div>
                              ) : (
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-xs font-medium text-[var(--text-tertiary)]">{v ? v.model : '—'}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[150px]">{r.name || r.fullName || '—'}</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">ID: {displayId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {v && v.subscriptionPlan ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest italic">{v.subscriptionPlan.name || v.subscriptionPlan.label || 'Plan Active'}</span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-[var(--text-tertiary)] font-black uppercase tracking-widest italic opacity-60">No Plan</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {v ? (
                                <div className="flex items-center gap-2">
                                  <Battery size={12} className={v.battery < 20 ? 'text-rose-500' : 'text-emerald-500'} />
                                  <span className={`text-xs font-medium ${v.battery < 20 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{v.battery ?? '—'}%</span>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-[var(--text-tertiary)]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {v ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${v.status === 'assigned' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : v.status === 'in-service' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                  {v.status}
                                </span>
                              ) : (r.vehiclePlate || r.vehicleNo) ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                  assigned
                                </span>
                              ) : (
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-2 relative">
                              {!v && !r.vehiclePlate && !r.vehicleNo && (
                                <button
                                  onClick={() => {
                                    setAssignmentData({ riderName: r.name || r.fullName, riderPhone: r.phone, vehiclePlate: '' });
                                    setIsAssignModalOpen(true);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                  <Zap size={12} /> Assign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          <div className="space-y-3">
            <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
              Owner <span className="text-emerald-500">Details</span>
            </h2>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Users size={18} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest leading-none">Franchise Owner</p>
                  <h4 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">{hub.ownerName || 'N/A'}</h4>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Phone</span>
                  <span className="text-[10px] font-black text-[var(--text-primary)] tracking-widest">{hub.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email</span>
                  <span className="text-[10px] font-black text-[var(--text-primary)] lowercase">{hub.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">KYC Status</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${hub.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {hub.kycStatus || 'uninitiated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Capacity</span>
                  <span className="text-[10px] font-black text-[var(--text-primary)]">{hub.capacity || hub.fleet || 0} vehicles</span>
                </div>
              </div>

              <button
                onClick={handleEditOpen}
                className="w-full py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[8px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
              >
                <Pencil size={12} /> Edit Franchise Details
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
              Anomaly <span className="text-rose-500">Alerts</span>
            </h2>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-4">
              {[
                { title: 'Geofence Violation', time: '2m', desc: 'EV-9012 left zone', color: 'rose' },
                { title: 'Thermal Warning', time: '14m', desc: 'Station #4 high temp', color: 'amber' },
              ].map((alert, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${alert.color}-500 shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-[var(--text-primary)] uppercase italic leading-none">{alert.title}</p>
                      <span className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{alert.time}</span>
                    </div>
                    <p className="text-[9px] text-[var(--text-tertiary)] font-medium italic">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Franchise Modal */}
      <AnimatePresence>
        {isEditing && (
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
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
                {[
                  { label: 'Hub Name *', key: 'name', placeholder: 'Hub Name' },
                  { label: 'Owner Name *', key: 'ownerName', placeholder: 'Owner Name' },
                  { label: 'City / Location *', key: 'city', placeholder: 'City' },
                  { label: 'Phone', key: 'phone', placeholder: '10-digit mobile' },
                  { label: 'Email', key: 'email', placeholder: 'owner@flexigo.com', type: 'email' },
                  { label: 'Fleet Capacity', key: 'fleet', placeholder: 'e.g. 150', type: 'number' }
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={editData[field.key] || ''}
                      onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  <Save size={16} /> Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Wallet Modal */}
      <AnimatePresence>
        {isCrediting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
                    Credit <span className="text-amber-500">Wallet</span>
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Inject liquidity into node</p>
                </div>
                <button onClick={() => setIsCrediting(false)} className="p-2 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await (await import('../../../lib/axios')).default.post(`/admin/franchise/${hubId}/credit`, {
                      amount: creditAmount,
                      description: creditDesc,
                      type: 'Bonus'
                    });
                    if (res.data.success) {
                      alert(`Successfully credited ₹${creditAmount}`);
                      setIsCrediting(false);
                      setCreditAmount('');
                      setCreditDesc('');
                      // Refresh hub data
                      setHub(prev => ({ ...prev, revenue: (prev.revenue || 0) + Number(creditAmount) }));
                    }
                  } catch (err) {
                    alert(err.response?.data?.message || 'Credit failed');
                  }
                }} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-5 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-lg font-black italic tracking-widest focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500/40 outline-none transition-all placeholder:text-[var(--text-tertiary)]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Description</label>
                  <textarea
                    value={creditDesc}
                    onChange={e => setCreditDesc(e.target.value)}
                    placeholder="Reason for credit..."
                    className="w-full px-5 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500/40 outline-none transition-all min-h-[100px] resize-none placeholder:text-[var(--text-tertiary)]/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  <Save size={16} /> Authorize Credit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
         {isAssignModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
               >
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Vehicle <span className="text-emerald-500">Assignment</span></h2>
                        <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">PROVISION_DISPATCH_PROTOCOL</p>
                     </div>
                     <button onClick={() => setIsAssignModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                        <X size={16} />
                     </button>
                  </div>

                  <form
                     onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await assignVehicle({
                           vehiclePlate: assignmentData.vehiclePlate,
                           riderPhone: assignmentData.riderPhone,
                           type: 'Manual',
                           hubName: hub.name || hub.hubName
                        });
                        if (res.success) {
                           setIsAssignModalOpen(false);
                           alert("Vehicle Assigned Successfully!");
                           fetchKycRecords();
                           loadVehicles();
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
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Vehicle Plate Number</label>
                           <select
                              required
                              value={assignmentData.vehiclePlate}
                              onChange={(e) => setAssignmentData({ ...assignmentData, vehiclePlate: e.target.value })}
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                           >
                              <option value="">Select Vehicle Plate</option>
                              {vehicles.filter(v => v.status !== 'assigned').map(v => (
                                 <option key={v._id || v.id} value={v.plate}>
                                    {v.plate} — {v.model || 'Vehicle'}
                                 </option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                        <Zap size={14} fill="white" /> Save & Assign Vehicle
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
