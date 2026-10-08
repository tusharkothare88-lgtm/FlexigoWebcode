import React from 'react';
import * as XLSX from 'xlsx';
import { 
  Truck, 
  MapPin, 
  Activity, 
  Search, 
  Filter, 
  Battery, 
  Signal, 
  Zap, 
  ShieldCheck, 
  Terminal,
  ArrowUpRight,
  Monitor,
  Globe,
  Plus,
  FileUp,
  X,
  CheckCircle2,
  Paperclip,
  Eye,
  Trash2,
  Download as FileDown,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';
import api from '../../../lib/axios';

export default function FleetOversightPage() {
  const navigate = useNavigate();
  const { 
    vehicles, 
    networkStats, 
    fetchAllVehicles, 
    fetchDashboardStats,
    bulkAddVehicles
  } = useAdminDataStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });
  const [deleteConfirm, setDeleteConfirm] = React.useState({ isOpen: false, id: null });
  
  React.useEffect(() => {
    fetchAllVehicles();
    if (networkStats.activeFleet === 0) fetchDashboardStats();
  }, []);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    fetchAllVehicles(newFilters);
    console.log('Fleet Oversight Sync:', newFilters);
  };

  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) throw new Error('File is empty or missing headers');

        // Extract headers and clean them
        const headers = jsonData[0].map(h => 
          String(h || '').trim().toLowerCase().replace(/^["']|["']$/g, '')
        );

        console.log("DEBUG: Detected Headers ->", headers);

        const vehiclesToUpload = jsonData.slice(1).map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              let key = header;
              if (key === 'pate' || key === 'plate_number' || key === 'plate') key = 'plate';
              if (key === 'franshise' || key === 'hub' || key === 'branch' || key === 'franchise') key = 'franchise';
              if (key === 'chasis no' || key === 'chasis_no' || key === 'chassis number' || key === 'chassis_number' || key === 'chassis no' || key === 'chassis') key = 'chassisNo';
              if (key === 'hsn number' || key === 'hsn_number' || key === 'hsn') key = 'hsnNumber';
              obj[key] = String(row[index]).trim();
            }
          });
          return obj;
        }).filter(v => (v.plate || v.plate_number) && (v.vin || v.chassis_number));

        if (vehiclesToUpload.length === 0) {
          throw new Error(`No valid records found. System detected these headers: [${headers.join(', ')}]. Please ensure your file has "Plate" and "VIN" columns.`);
        }

        console.log("DEBUG: Final Payload ->", vehiclesToUpload);

        const res = await bulkAddVehicles(vehiclesToUpload);
        if (res.success) {
          setIsBulkModalOpen(false);
          // Re-fetch data to show the new vehicles in the list immediately
          await fetchAllVehicles(activeFilters);
          alert(`Success: ${res.message}`);
        } else {
          alert(`Error: ${res.message}`);
        }
      } catch (err) {
        console.error("Bulk Upload Error:", err);
        alert("Failed to process CSV: " + err.message);
      } finally {
        setIsUploading(false);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredVehicles = (vehicles || []).filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      (v.plate?.toLowerCase() || '').includes(q) || 
      (v.vin?.toLowerCase() || '').includes(q) || 
      (v._id?.toLowerCase() || '').includes(q) ||
      (v.model?.toLowerCase() || '').includes(q) ||
      (v.rider?.toLowerCase() || '').includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-5 bg-emerald-600 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                  Fleet <span className="text-emerald-500">Addition</span>
               </h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
               Asset Control & Operations
            </p>
         </div>
         
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all flex items-center gap-2 active:scale-95 italic"
            >
               <FileUp size={12} strokeWidth={3} /> BULK_PROVISION
            </button>
            <button 
              onClick={() => navigate('/admin/fleet/add')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-950/20 italic"
            >
               <Plus size={12} strokeWidth={3} /> ADD_VEHICLE
            </button>
            <OpsFilter onFilterChange={handleFilterChange} />
            <div className="relative group">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                 placeholder="Search Vehicle ID/Plate..." 
                 className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[9px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all w-48 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
               />
            </div>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AdminStatCard title="Total Units" value={filteredVehicles.length} icon={Truck} color="emerald" subtitle="Active assets" />
         <AdminStatCard title="In Motion" value={filteredVehicles.filter(v => v.status === 'in-motion').length} icon={Activity} color="blue" subtitle="Live tracking" />
         <AdminStatCard title="Low Battery" value={filteredVehicles.filter(v => v.battery < 20).length} icon={Zap} color="rose" subtitle="Urgent action" />
      </div>

      {/* Detailed Asset Registry */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
         <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Monitor size={16} />
               </div>
                <div>
                   <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none">Global Asset Registry</h3>
                   <p className="text-[7px] font-bold text-emerald-500 uppercase mt-0.5 tracking-widest animate-pulse italic">Real-time Feed</p>
                </div>
            </div>
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
               <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                     {['Plate', 'VIN', 'Model', 'Franchise', 'Chassis No', 'HSN Number', 'Action'].map((header) => (
                        <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredVehicles.map((vehicle, vIdx) => (
                     <tr key={vehicle._id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{vehicle.plate}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest italic">{vehicle.vin}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{vehicle.model || 'Flexigo Pro v2'}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500 italic">
                              {vehicle.franchise?.hubName || 'Global Fleet'}
                           </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{vehicle.chassisNo || '--'}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{vehicle.hsnNumber || '--'}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                           <div className="flex items-center gap-2">
                              {vehicle.attachmentUrl ? (
                                 <div className="flex items-center gap-1.5">
                                    <a 
                                      href={vehicle.attachmentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                      title="View Document"
                                    >
                                       <Eye size={12} strokeWidth={3} />
                                    </a>
                                    <a 
                                      href={vehicle.attachmentUrl.replace('/upload/', '/upload/fl_attachment/')} 
                                      download
                                      className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                      title="Download Document"
                                    >
                                       <FileDown size={12} strokeWidth={3} />
                                    </a>
                                 </div>
                              ) : (
                                 <label className="p-1.5 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded-lg hover:text-emerald-500 hover:border-emerald-500/50 border border-transparent transition-all cursor-pointer shadow-sm">
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                          const base64 = event.target.result;
                                          await useAdminDataStore.getState().updateVehicleAttachment(vehicle._id, base64);
                                          alert("Document synced with registry ✓");
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                    />
                                    <Paperclip size={12} strokeWidth={3} />
                                 </label>
                              )}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const newStatus = vehicle.status === 'assigned' ? 'available' : 'assigned';
                                    try {
                                      await useAdminDataStore.getState().updateVehicleStatus(vehicle._id || vehicle.id, newStatus);
                                    } catch(err) {
                                      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
                                    }
                                  }}
                                  className={`px-2 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all ${
                                    vehicle.status === 'assigned' 
                                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' 
                                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                  }`}
                                  title={vehicle.status === 'assigned' ? "Click to Unblock" : "Click to Block"}
                                >
                                  {vehicle.status === 'assigned' ? 'BLOCKED' : 'UNBLOCKED'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ isOpen: true, id: vehicle._id || vehicle.id });
                                  }}
                                  className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                  title="Delete Vehicle"
                                >
                                  <Trash2 size={12} strokeWidth={3} />
                                </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Confirm Deletion</h3>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-bold mt-1 uppercase tracking-widest leading-relaxed">Are you sure you want to permanently delete this vehicle? This action cannot be undone.</p>
                </div>
                <div className="flex w-full gap-3 pt-4">
                  <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all active:scale-95">Cancel</button>
                  <button onClick={async () => {
                     try {
                        const res = await api.delete(`/fleet/${deleteConfirm.id}`);
                        if (res.data.success) {
                           useAdminDataStore.getState().fetchAllVehicles();
                           setDeleteConfirm({ isOpen: false, id: null });
                        } else {
                           alert(res.data.message || 'Deletion failed');
                        }
                     } catch(err) {
                        alert('Deletion failed: ' + (err.response?.data?.message || err.message));
                     }
                  }} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95 shadow-rose-500/20">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-8 w-full max-w-lg shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-600/10 blur-[80px] rounded-full" />
              
              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                    <FileUp size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Bulk Provisioning <span className="text-emerald-500">Protocol</span></h2>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] opacity-60">System Asset Ingestion</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-2 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 relative">
                <div className="bg-[var(--bg-tertiary)]/50 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-10 flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-all duration-500">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] mb-4 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500 shadow-xl">
                    <Zap size={24} className={isUploading ? 'animate-bounce' : ''} />
                  </div>
                  <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-1 italic">Drop CSV / Excel Registry</h4>
                  <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-6 opacity-60">Columns: plate, vin, model, franchise, chasis no, hsn number</p>
                  
                  <label className="cursor-pointer">
                    <span className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition-all active:scale-95 block italic">
                      {isUploading ? 'INGESTING_DATA...' : 'SELECT_SOURCE_FILE'}
                    </span>
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls" 
                      className="hidden" 
                      onChange={handleCsvUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-start gap-3">
                   <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Provisioning Rules:</p>
                      <ul className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest space-y-1 opacity-80 italic">
                         <li>• Ensure 'plate' and 'vin' are unique across network</li>
                         <li>• Franchise name must match exactly or use ID</li>
                         <li>• Max 500 records per ingestion cycle recommended</li>
                      </ul>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
