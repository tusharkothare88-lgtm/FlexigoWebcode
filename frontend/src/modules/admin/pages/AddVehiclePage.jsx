import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  Truck,
  Plus,
  ChevronRight,
  Target,
  Search,
  ZapOff,
  History,
  ArrowRight,
  X,
  Globe,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminDataStore } from '../store/adminDataStore';

function DocUpload({ label, value, onChange, accent = 'emerald' }) {
  const colors = {
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-600/5', icon: 'bg-emerald-600 text-white', idle: 'text-emerald-500 bg-emerald-600/10 border border-emerald-500/20' },
    blue: { border: 'border-blue-500', bg: 'bg-blue-600/5', icon: 'bg-blue-600 text-white', idle: 'text-blue-500 bg-blue-600/10 border border-blue-500/20' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-600/5', icon: 'bg-amber-600 text-white', idle: 'text-amber-500 bg-amber-600/10 border border-amber-500/20' },
  };
  const c = colors[accent] || colors.emerald;
  return (
    <label className={`w-full p-5 border-2 border-dashed rounded-2xl flex items-center gap-5 group transition-all cursor-pointer ${value ? `${c.border} ${c.bg}` : 'border-[var(--border-subtle)] hover:border-[var(--text-tertiary)]/30'}`}>
      <input type="file" accept="image/*,application/pdf" onChange={onChange} className="hidden" />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${value ? c.icon : c.idle}`}>
        {value ? <CheckCircle size={20} /> : <Upload size={20} />}
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">
          {value ? `${label} ✓` : label}
        </p>
        <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60 mt-0.5">
          {value ? 'Image ready — click to replace' : 'JPG, PNG or PDF'}
        </p>
      </div>
    </label>
  );
}

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedHubId = searchParams.get('hubId');
  const { addVehicle, hubs, fetchHubs } = useAdminDataStore();

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem('add_vehicle_step');
    return savedStep ? parseInt(savedStep) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ownershipType, setOwnershipType] = useState('platform');

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('add_vehicle_data');
    return savedData ? JSON.parse(savedData) : {
      plate: '',
      vin: '',
      model: 'FlexiGo Pro v2',
      manufactureDate: '',
      insurancePolicy: '',
      insuranceExpiry: '',
      pUCNumber: '',
      pUCExpiry: '',
      rcImage: '',
      insuranceDocImage: '',
      pucDocImage: '',
      vehicleImages: [],
      franchise: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('add_vehicle_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('add_vehicle_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    fetchHubs();
    if (preSelectedHubId) {
      setOwnershipType('franchise');
      setFormData(prev => ({ ...prev, franchise: preSelectedHubId }));
    }
  }, [preSelectedHubId]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, [field]: base64 }));
    }
  };

  const handleVehicleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const existingImages = formData.vehicleImages || [];

    if (existingImages.length + files.length > 3) {
      alert("MAX_PAYLOAD_BREACH: Total limit is 3 images. You already have " + existingImages.length);
      e.target.value = '';
      return;
    }

    const base64Promises = files.map(file => fileToBase64(file));
    const base64s = await Promise.all(base64Promises);
    setFormData({ ...formData, vehicleImages: [...existingImages, ...base64s] });
    e.target.value = '';
  };

  const removeVehicleImage = (index) => {
    const updatedImages = formData.vehicleImages.filter((_, i) => i !== index);
    setFormData({ ...formData, vehicleImages: updatedImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ownershipType === 'franchise' && !formData.franchise) {
      alert('Please select a franchise for this vehicle.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        franchise: ownershipType === 'platform' ? null : (formData.franchise || null)
      };

      if (submissionData.franchise && typeof submissionData.franchise === 'string') {
        submissionData.franchise = submissionData.franchise.trim().replace(/^\(|\)$/g, '');
      }

      const res = await addVehicle(submissionData);

      if (res.success) {
        setIsSuccess(true);
        localStorage.removeItem('add_vehicle_step');
        localStorage.removeItem('add_vehicle_data');
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('Internal Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-tertiary)] hover:text-emerald-500 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-0.5">
           <h1 className="text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
              Global <span className="text-emerald-500">Provisioning</span>
           </h1>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic leading-none">
              Asset Registration • Admin Protocol
           </p>
        </div>
      </div>

      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--bg-secondary)] border border-emerald-500/20 rounded-[3rem] p-16 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Zap size={120} />
          </div>
          <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
             <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-4">Asset Deployed</h2>
          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto mb-10 italic">
            Vehicle <span className="text-emerald-500 font-extrabold">{formData.plate}</span> has been successfully added to the {ownershipType === 'platform' ? 'Platform' : 'Franchise'} registry.
          </p>
          <button
            onClick={() => navigate('/admin/fleet')}
            className="px-10 py-5 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[.4em] shadow-xl shadow-emerald-950/40 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto group"
          >
            Return to Fleet Oversight <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all border-2 ${
                  step >= s ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
                }`}>
                  {step > s ? <CheckCircle size={14} /> : `0${s}`}
                </div>
                {s < 4 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[var(--border-subtle)]'}`} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tight">Ownership Classification</h3>
                   <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Define asset host assignment</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOwnershipType('platform')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${
                      ownershipType === 'platform'
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-[var(--border-subtle)] hover:border-emerald-500/20 bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      ownershipType === 'platform' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                    }`}>
                      <Globe size={24} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest italic ${ownershipType === 'platform' ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>Platform Asset</p>
                      <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase mt-1 opacity-60">Company owned</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOwnershipType('franchise')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${
                      ownershipType === 'franchise'
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-[var(--border-subtle)] hover:border-emerald-500/20 bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      ownershipType === 'franchise' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                    }`}>
                      <Building2 size={24} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest italic ${ownershipType === 'franchise' ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>Franchise Asset</p>
                      <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase mt-1 opacity-60">Partner assignment</p>
                    </div>
                  </button>
                </div>

                <AnimatePresence>
                  {ownershipType === 'franchise' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Target Franchise / Hub</label>
                        <select
                          required
                          value={formData.franchise}
                          onChange={(e) => setFormData({...formData, franchise: e.target.value})}
                          className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer italic"
                        >
                          <option value="">-- SELECT PARTNER NODE --</option>
                          {hubs.map(hub => (
                            <option key={hub.id || hub._id} value={hub.id || hub._id}>
                              {hub.name || hub.hubName} ({hub.city})
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tight">Technical Identity</h3>
                   <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Base Asset telemetry data</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Number Plate</label>
                    <input
                      required
                      value={formData.plate}
                      onChange={(e) => setFormData({...formData, plate: e.target.value})}
                      placeholder="KA 03 AB 1234"
                      className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50 italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">VIN / Chassis Number</label>
                    <input
                      required
                      value={formData.vin}
                      onChange={(e) => setFormData({...formData, vin: e.target.value})}
                      placeholder="VIN77889900..."
                      className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50 italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Vehicle Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer italic"
                    >
                      <option>FlexiGo Pro v2</option>
                      <option>FlexiGo Heavy 3.0</option>
                      <option>City Commuter Lite</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Date of Manufacture</label>
                    <input
                      type="date"
                      required
                      value={formData.manufactureDate}
                      onChange={(e) => setFormData({...formData, manufactureDate: e.target.value})}
                      className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-secondary)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tight">Compliance Payload</h3>
                   <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">RTO Documentation & Legal Assets</p>
                </div>

                {/* RC Certificate */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">RC Certificate</label>
                  <DocUpload
                    label="RC Certificate"
                    value={formData.rcImage}
                    onChange={e => handleImageUpload(e, 'rcImage')}
                  />
                </div>

                {/* Insurance */}
                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2">Insurance Details</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Policy No.</label>
                      <input
                        required
                        value={formData.insurancePolicy}
                        onChange={(e) => setFormData({...formData, insurancePolicy: e.target.value})}
                        placeholder="POL_7788-99"
                        className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50 italic text-[var(--text-secondary)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={formData.insuranceExpiry}
                        onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                        className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-secondary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <DocUpload
                        label="Insurance Certificate"
                        value={formData.insuranceDocImage}
                        onChange={e => handleImageUpload(e, 'insuranceDocImage')}
                        accent="blue"
                      />
                    </div>
                  </div>
                </div>

                {/* PUC */}
                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] ml-2">PUC Certificate</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">PUC Number</label>
                      <input
                        required
                        value={formData.pUCNumber}
                        onChange={(e) => setFormData({...formData, pUCNumber: e.target.value})}
                        placeholder="PUC_9900/88"
                        className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50 italic text-[var(--text-secondary)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={formData.pUCExpiry}
                        onChange={(e) => setFormData({...formData, pUCExpiry: e.target.value})}
                        className="w-full px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic text-[var(--text-secondary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <DocUpload
                        label="PUC Certificate"
                        value={formData.pucDocImage}
                        onChange={e => handleImageUpload(e, 'pucDocImage')}
                        accent="amber"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Photos */}
                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-2">Vehicle Photos</p>
                  <label className={`w-full p-8 border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 group transition-all cursor-pointer ${
                      (formData.vehicleImages || []).length > 0 ? 'border-emerald-500 bg-emerald-600/5' : 'border-[var(--border-subtle)] hover:border-emerald-500/40 hover:bg-emerald-600/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleVehicleImageUpload}
                      className="hidden"
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                        (formData.vehicleImages || []).length > 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110'
                    }`}>
                       {(formData.vehicleImages || []).length > 0 ? <CheckCircle size={24} /> : <Truck size={24} />}
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest mb-1 italic">
                          {(formData.vehicleImages || []).length > 0 ? `${formData.vehicleImages.length}_PHOTOS_SYNCED_✓` : 'Vehicle Photo Sync (Max 3)'}
                       </p>
                       <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">
                          {(formData.vehicleImages || []).length > 0 ? 'ARRAY_PAYLOAD_READY' : 'Select up to 3 Real-time Photos'}
                       </p>
                    </div>
                  </label>
                  {(formData.vehicleImages || []).length > 0 && (
                    <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                      {formData.vehicleImages.map((img, idx) => (
                        <div key={idx} className="relative group shrink-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-lg">
                            <img src={img} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVehicleImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic tracking-tight">Review Deployment</h3>
                   <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Confirm asset entry protocols</p>
                </div>
                <div className="p-8 bg-emerald-600/5 border border-emerald-500/10 rounded-3xl space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            {ownershipType === 'platform' ? <Globe size={24} /> : <Building2 size={24} />}
                         </div>
                         <div>
                            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight italic">{formData.plate || 'PLATE_REDACTED'}</p>
                            <p className="text-[9px] font-black text-emerald-500 tracking-[.4em] uppercase">{formData.model}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Ownership</p>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter italic">
                            {ownershipType === 'platform' ? 'PLATFORM_UNIT' : `FRANCHISE: ${hubs.find(h => (h.id || h._id) === formData.franchise)?.name || hubs.find(h => (h.id || h._id) === formData.franchise)?.hubName || 'UNKNOWN'}`}
                         </p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
                         <ShieldCheck size={16} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">TLS Encrypted</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl">
                         <Target size={16} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Global Sync</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-10 border-t border-[var(--border-subtle)]">
               {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-10 py-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl text-[10px] font-black uppercase tracking-[.4em] hover:bg-[var(--bg-secondary)] transition-all active:scale-95 italic"
                  >
                    Back
                  </button>
               )}
               <button
                 type={step === 4 ? 'submit' : 'button'}
                 onClick={step === 4 ? undefined : nextStep}
                 disabled={isSubmitting}
                 className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[.4em] shadow-xl shadow-emerald-950/40 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isSubmitting ? (
                   <span className="animate-pulse">Provisioning...</span>
                 ) : (
                   <>
                     {step === 4 ? 'Confirm Asset' : 'Next Protocol'} <ChevronRight size={14} />
                   </>
                 )}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
