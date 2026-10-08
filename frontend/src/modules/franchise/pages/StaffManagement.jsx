import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Activity, 
  Smartphone, 
  Settings,
  Lock,
  Unlock,
  ChevronRight,
  UserPlus,
  X,
  Mail
} from 'lucide-react';
import GlassTable from '../components/GlassTable';
import StatusBadge from '../components/StatusBadge';
import { useStaffStore } from '../store/staffStore';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';

export default function StaffManagement() {
  const { staff, fetchStaff, addStaff, deleteStaff, updateStaffStatus } = useStaffStore();
  const { user: franchise } = useFranchiseAuthStore();
  const [isAddStaffOpen, setAddStaffOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Attendant',
  });

  useEffect(() => {
    if (franchise?._id || franchise?.id) {
        fetchStaff(franchise._id || franchise.id);
    }
  }, [franchise, fetchStaff]);

  const handleAddStaff = async () => {
    const res = await addStaff(formData);
    if (res.success) {
        setAddStaffOpen(false);
        setFormData({ name: '', phone: '', role: 'Attendant' });
    } else {
        alert(res.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this personnel node?')) {
        await deleteStaff(id);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateStaffStatus(id, newStatus);
  };

  const columns = [
    {
      header: 'Personnel Identity',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2 w-36 overflow-hidden">
           <div className={`shrink-0 w-8 h-8 rounded border shadow-inner flex items-center justify-center ${
             row.role === 'Partner' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-600' : 
             row.role === 'Manager' ? 'bg-blue-600/10 border-blue-500/20 text-blue-600' : 
             'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-tertiary)]'
           }`}>
             {row.role === 'Partner' ? <ShieldAlert size={12} strokeWidth={3} /> : row.role === 'Manager' ? <Settings size={12} strokeWidth={3} /> : <User size={12} strokeWidth={3} />}
           </div>
           <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-tight italic leading-none truncate">{row.name}</span>
              <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic mt-0.5 leading-none opacity-60 truncate">{row.phone}</span>
           </div>
        </div>
      )
    },
    {
      header: 'Operational Role',
      accessor: 'role',
      render: (row) => (
        <div className="flex flex-col">
           <span className={`text-[9px] font-black uppercase tracking-widest italic leading-none ${
             row.role === 'Partner' ? 'text-emerald-500' : row.role === 'Manager' ? 'text-blue-500' : 'text-[var(--text-primary)]'
           }`}>{row.role}</span>
           <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] italic opacity-40 mt-1 leading-none">NODE_INTEGRITY: HIGH</span>
        </div>
      )
    },
    {
      header: 'Access Scope',
      accessor: 'permissions',
      render: (row) => (
        <span className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] truncate max-w-[140px] italic">
           {row.permissions}
        </span>
      )
    },
    {
      header: 'Network Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Privileges',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
           <button 
             onClick={() => handleStatusToggle(row._id || row.id, row.status)}
             className={`p-1.5 border border-[var(--border-subtle)] rounded transition-all shadow-inner group ${row.status === 'active' ? 'hover:bg-amber-600/10 hover:border-amber-500/20 text-[var(--text-tertiary)] hover:text-amber-500' : 'hover:bg-emerald-600/10 hover:border-emerald-500/20 text-[var(--text-tertiary)] hover:text-emerald-500'}`}
           >
              {row.status === 'active' ? <Lock size={12} strokeWidth={3} /> : <Unlock size={12} strokeWidth={3} />}
           </button>
           <button 
             onClick={() => handleDelete(row._id || row.id)}
             className="p-1.5 border border-[var(--border-subtle)] rounded hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-[var(--text-tertiary)] hover:text-rose-500 shadow-inner group"
           >
              <Trash2 size={12} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-violet-500 rounded-full shadow-sm" />
            <h1 className="text-lg font-black tracking-tighter uppercase text-[var(--text-primary)] italic leading-none">
               Staff <span className="text-violet-500">Registry</span>
            </h1>
          </div>
          <p className="text-[7.5px] font-black uppercase tracking-[0.3em] ml-3 text-[var(--text-tertiary)] italic opacity-40 leading-none">
             MANAGE_ROLES_AND_ACCESS
          </p>
        </div>

        <button 
          onClick={() => setAddStaffOpen(true)}
          className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-[7.5px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-violet-950/20 italic leading-none"
        >
           <UserPlus size={10} strokeWidth={3} /> ADD_NEW_STAFF
        </button>
      </div>

      {/* Access Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] flex flex-col gap-2 shadow-inner hover:border-emerald-500/20 transition-all relative overflow-hidden group">
            <div className="text-emerald-500 flex items-center gap-1.5 relative z-10">
               <ShieldAlert size={10} strokeWidth={3} />
               <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-emerald-500 italic leading-none">LEAD_PARTNERS</span>
            </div>
            <p className="text-xl font-black text-white italic leading-none relative z-10">
                {staff.filter(s => s.role === 'Partner').length.toString().padStart(2, '0')}
            </p>
         </div>
         <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] flex flex-col gap-2 shadow-inner hover:border-blue-500/20 transition-all relative overflow-hidden group">
            <div className="text-blue-500 flex items-center gap-1.5 relative z-10">
               <Settings size={10} strokeWidth={3} />
               <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-blue-500 italic leading-none">OPS_MANAGERS</span>
            </div>
            <p className="text-xl font-black text-white italic leading-none relative z-10">
                {staff.filter(s => s.role === 'Manager').length.toString().padStart(2, '0')}
            </p>
         </div>
         <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] flex flex-col gap-2 shadow-inner hover:border-slate-500/20 transition-all relative overflow-hidden group">
            <div className="text-white flex items-center gap-1.5 relative z-10">
               <Users size={10} strokeWidth={3} />
               <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-white italic leading-none">TOTAL_PERSONNEL</span>
            </div>
            <p className="text-xl font-black text-white italic leading-none relative z-10">
                {staff.length.toString().padStart(2, '0')}
            </p>
         </div>
         <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-violet-500/20 border-l-2 border-l-violet-500 flex flex-col gap-2 shadow-inner hover:border-violet-500/40 transition-all relative overflow-hidden group">
            <div className="text-violet-500 flex items-center gap-1.5 relative z-10">
               <Lock size={10} strokeWidth={3} />
               <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-80 text-violet-500 italic leading-none">RESTRICTED_ACCESS</span>
            </div>
            <p className="text-xl font-black text-violet-500 italic leading-none relative z-10">
                {staff.filter(s => s.status === 'paused').length}
            </p>
         </div>
      </div>

      {/* Main Staff Table */}
      <GlassTable columns={columns} data={staff} emptyMessage="No personnel records found for this operational hub" />

      {/* Operational Audit Decor */}
      <div className="p-6 rounded-xl bg-black border border-[var(--border-subtle)] shadow-inner relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.05] scale-[2.5] pointer-events-none transition-transform duration-1000">
            <Activity size={120} className="text-white" />
         </div>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic leading-none">STAFF_ACTIVITY_LOG</h3>
               <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] leading-relaxed italic opacity-60 mt-1">
                  HUB_OPERATIONAL_SECURITY_AUDIT_TRAIL
               </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[7.5px] font-black uppercase tracking-[0.3em] text-violet-500 hover:text-violet-400 hover:border-violet-500/30 transition-all shadow-inner italic">
               VIEW_ACTIVITY_LOGS
            </button>
         </div>
      </div>

      {/* Onboarding Modal - Professional B2B */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setAddStaffOpen(false)}
               className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[70]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 z-[80] shadow-2xl flex flex-col gap-6"
            >
               <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-inner">
                     <UserPlus size={20} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 px-4">
                     <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">ADD_NEW_STAFF</h3>
                     <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] italic opacity-60 leading-none mt-1">
                        CREATE_A_NEW_ACCOUNT_FOR_YOUR_HUB
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5 px-1">
                     <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-violet-500 italic ml-1">PERSONNEL_LEGAL_NAME</p>
                     <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-2 rounded-xl focus-within:border-violet-500/30 transition-all shadow-inner">
                        <User size={12} className="text-[var(--text-tertiary)]" strokeWidth={3} />
                        <input 
                          type="text" 
                          placeholder="RAHUL_ATTENDANT..." 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-transparent border-none outline-none text-[var(--text-primary)] text-[9px] font-black tracking-widest italic w-full placeholder:text-[var(--text-tertiary)]/50" 
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5 px-1">
                     <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-violet-500 italic ml-1">SECURE_CONTACT_NODE</p>
                     <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-2 rounded-xl focus-within:border-violet-500/30 transition-all shadow-inner">
                        <Smartphone size={12} className="text-[var(--text-tertiary)]" strokeWidth={3} />
                        <input 
                          type="text" 
                          placeholder="+91_00000_00000" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-transparent border-none outline-none text-[var(--text-primary)] text-[9px] font-black tracking-widest italic w-full placeholder:text-[var(--text-tertiary)]/50" 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5 px-1">
                        <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-violet-500 italic ml-1">ASSIGNED_PRIVILEGE</p>
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-2 rounded-xl text-[var(--text-primary)] text-[7.5px] font-black tracking-widest w-full outline-none focus:border-violet-500/30 transition-all shadow-inner appearance-none cursor-pointer italic"
                        >
                           <option value="Attendant">ATTENDANT</option>
                           <option value="Manager">MANAGER</option>
                           <option value="Partner">PARTNER</option>
                        </select>
                     </div>
                     <div className="space-y-1.5 px-1">
                        <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-60 italic ml-1">PROVISIONED_ZONE</p>
                        <div className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between text-[var(--text-tertiary)] opacity-50 shadow-inner">
                           <span className="text-[7.5px] font-black uppercase tracking-[0.2em] italic">HUB-KOR-01</span>
                           <Lock size={10} strokeWidth={3} />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                     <button 
                        onClick={() => setAddStaffOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-inner italic"
                     >
                        DISCARD
                     </button>
                     <button 
                        onClick={handleAddStaff}
                        className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-[7.5px] font-black uppercase tracking-[0.3em] hover:bg-violet-500 transition-all shadow-lg active:scale-95 shadow-violet-950/20 italic"
                     >
                        CONFIRM_NODE
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
