import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { BottomSheet } from '../components/BottomSheet';
import { NeonButton } from '../components/NeonButton';
import { BatteryIndicator } from '../components/BatteryIndicator';
import { StatCard } from '../components/StatCard';
import { useRideStore } from '../store/rideStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { RefreshCw, MapPin, Zap, Info, ChevronRight, Share2, Shield, Scan, X } from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../lib/axios';
import scooterRender from '../../../assets/scooter_render.png';

// Mock data removed as we are going dynamic
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ── Vehicle Section Component (exact Hub page UI) ──
function VehicleSection({ vehicle, currentAddress, isDark }) {
  const [showScanner, setShowScanner] = useState(false);
  const { setUnlocking } = useRideStore();

  const handleUnlockVehicle = () => {
    setUnlocking();
    alert("Vehicle Unlocked! You can now start your work session.");
  };

  return (
    <div className="px-6 pb-6 space-y-6 mt-2">
      {/* Battery Visual */}
      <div className="w-full max-w-[280px] mx-auto py-2 relative">
        <BatteryIndicator percentage={vehicle?.battery || 0} size="lg" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-flexigo-teal/5 rounded-full blur-[100px] pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-40'}`} />
      </div>

      {/* Scooter Image — dynamic from DB, fallback to static */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full h-52 flex items-center justify-center"
      >
        <img
          src={vehicle?.images?.length > 0 ? vehicle.images[0] : scooterRender}
          alt={vehicle?.model || 'Flexigo Electric Scooter'}
          className="w-full h-full object-contain drop-shadow-2xl"
        />
        <div className={`absolute bottom-4 w-32 h-2 rounded-full blur-xl ${isDark ? 'bg-white/5' : 'bg-slate-900/10'}`} />
      </motion.div>

      {/* EST. RANGE + ACTIVE DUTY */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Est. Range"
          value={vehicle?.range || 0}
          unit="KM"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 2v20M2 12h20" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
        <StatCard
          label="Active Duty"
          value={vehicle?.activeDuty || '0'}
          unit="MINS"
          color="#00D4FF"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
      </div>

      {/* Current Hub */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Current Hub</span>
            <span className={`font-black text-xs truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentAddress || vehicle?.location || 'Detecting location...'}
            </span>
          </div>
          <button className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 shadow-sm'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-5 h-5">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </GlassCard>

      {/* QR SWAP + UNLOCK VEHICLE */}
      <div className="flex gap-4">
        <NeonButton variant="outline" className="flex-1" onClick={() => setShowScanner(true)}>
          <div className="flex items-center gap-2">
            <Scan size={16} /> QR Swap
          </div>
        </NeonButton>
        <NeonButton variant="solid" className="flex-1" onClick={handleUnlockVehicle}>
          Unlock Vehicle
        </NeonButton>
      </div>

      {/* HANDOVER VEHICLE & EXIT */}
      <button
        onClick={async () => {
          if (window.confirm('Are you sure you want to request vehicle handover? This will notify the admin.')) {
            const { requestHandover } = useRideStore.getState();
            const res = await requestHandover();
            if (res.success) alert('Handover request sent successfully. Visit the office.');
            else alert(res.message);
          }
        }}
        className={`w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all border-t ${isDark ? 'border-white/5 text-slate-500 hover:text-rose-500' : 'border-slate-100 text-slate-400 hover:text-rose-600'}`}
      >
        Handover Vehicle &amp; Exit
      </button>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] bg-black p-6 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <button onClick={() => setShowScanner(false)} className="p-3 rounded-full bg-white/10">
                <X size={24} className="text-white" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Scanner V2.4</span>
              <div className="w-10" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-flexigo-teal rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-flexigo-teal rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-flexigo-teal rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-flexigo-teal rounded-br-xl" />
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-flexigo-teal shadow-[0_0_15px_#39FF14] z-10"
                />
                <div className="absolute inset-0 bg-flexigo-teal/5 animate-pulse" />
              </div>
              <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-flexigo-teal text-center leading-relaxed">
                Align QR Code on the<br />Battery Unit to Start Swap
              </p>
            </div>
            <div className="pb-10 grid grid-cols-2 gap-4">
              <button className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                <Zap size={20} className="text-white/60" />
                <span className="text-[8px] font-black uppercase text-white/40">Flash</span>
              </button>
              <button className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2" onClick={() => setShowScanner(false)}>
                <X size={20} className="text-white/60" />
                <span className="text-[8px] font-black uppercase text-white/40">Cancel</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { activePlan } = useSubscriptionStore();
  const { balance } = useWalletStore();
  const selectedPlan = user?.subscriptionPlan;
  const {
    vehicle,
    isDiagnosticsOpen,
    setDiagnosticsOpen,
    hubs,
    hubLoading,
    fetchHubs,
    currentAddress,
    setCurrentAddress,
    fetchMyVehicle,
    updateLocation,
    currentCoords
  } = useRideStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatingLoc, setSimulatingLoc] = useState(null);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const isDark = theme === 'dark';

  // Bank Details States
  const [isBankDetailsOpen, setBankDetailsOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    attachment: null
  });
  const [isSubmittingBankDetails, setIsSubmittingBankDetails] = useState(false);

  // Camera/Upload picker modal for Bank Details
  const [pickerModal, setPickerModal] = useState({ open: false, type: null, fileInputId: null });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const isFlutterApp = () => typeof window !== 'undefined' && !!window.flutter_inappwebview;

  const captureWithFlutter = async (type, fileInputId) => {
    try {
      const result = await window.flutter_inappwebview.callHandler('openCamera');
      if (result?.success && result?.base64) {
        const byteString = atob(result.base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const mimeType = result.mimeType || 'image/jpeg';
        const blob = new Blob([ab], { type: mimeType });
        const file = new File([blob], result.fileName || `${type}_photo.jpg`, { type: mimeType });
        setBankFormData(prev => ({ ...prev, attachment: file }));
      }
    } catch (err) {
      document.getElementById(fileInputId)?.click();
    }
  };

  const handleCameraCapture = (type, fileInputId) => {
    setPickerModal({ open: true, type, fileInputId });
  };

  const closePickerModal = () => setPickerModal({ open: false, type: null, fileInputId: null });

  const openWebCamera = async (type) => {
    closePickerModal();
    setCameraError(null);
    setCameraType(type);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permission or use Gallery.');
    }
  };

  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraType(null);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${cameraType}_photo.jpg`, { type: 'image/jpeg' });
      setBankFormData(prev => ({ ...prev, attachment: file }));
      stopWebCamera();
    }, 'image/jpeg', 0.9);
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingBankDetails(true);
    try {
      const formData = new FormData();
      formData.append('phone', user.phone);
      formData.append('accountName', bankFormData.accountName);
      formData.append('bankName', bankFormData.bankName);
      formData.append('accountNumber', bankFormData.accountNumber);
      formData.append('ifscCode', bankFormData.ifscCode);
      if (bankFormData.attachment) {
        formData.append('attachment', bankFormData.attachment);
      }

      const res = await api.post('/rider/profile/bank-details', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('Bank details updated successfully!');
        setBankDetailsOpen(false);
        setBankFormData({ accountName: '', bankName: '', accountNumber: '', ifscCode: '', attachment: null });
      }
    } catch (err) {
      alert('Failed to update bank details: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingBankDetails(false);
    }
  };

  const coords = (sessionStorage.getItem('simulated_gps') === 'true' && customLat && customLng)
    ? { latitude: parseFloat(customLat), longitude: parseFloat(customLng) }
    : (currentCoords || (customLat && customLng ? { latitude: parseFloat(customLat), longitude: parseFloat(customLng) } : null));

  useEffect(() => {
    if (sessionStorage.getItem('simulated_gps') !== 'true') {
      if (currentCoords?.latitude) setCustomLat(currentCoords.latitude.toString());
      if (currentCoords?.longitude) setCustomLng(currentCoords.longitude.toString());
      if (currentAddress && currentAddress !== 'Detecting location...') setCustomAddress(currentAddress);
    }
  }, [currentCoords, currentAddress]);

  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simInterval, setSimInterval] = useState(null);
  const [simRouteType, setSimRouteType] = useState('circular');

  useEffect(() => {
    return () => {
      if (simInterval) {
        clearInterval(simInterval);
      }
    };
  }, [simInterval]);

  const toggleAutoSimulation = async () => {
    if (isAutoSimulating) {
      if (simInterval) {
        clearInterval(simInterval);
        setSimInterval(null);
      }
      setIsAutoSimulating(false);
      sessionStorage.removeItem('simulated_gps');
    } else {
      const latNum = parseFloat(customLat);
      const lngNum = parseFloat(customLng);
      if (isNaN(latNum) || isNaN(lngNum)) {
        alert("⚠️ Please enter or select a valid starting coordinate preset first!");
        return;
      }

      sessionStorage.setItem('simulated_gps', 'true');
      setIsAutoSimulating(true);
      let step = 0;

      // Determine route name dynamically from the current address (GPS, preset, or custom input)
      const activeAddress = (currentAddress || customAddress || '').trim();
      const firstPart = activeAddress.split(',')[0].trim();
      const baseRouteName = firstPart ? `${firstPart} Route` : 'FlexiGo Route';

      const runSimulationStep = async () => {
        step += 1;
        setSimStep(step);

        let newLat = latNum;
        let newLng = lngNum;

        if (simRouteType === 'circular') {
          // Circular motion: radius ~166 meters, angular speed 0.1 rad per step (moving ~16.6m per step)
          const radiusDegrees = 0.0015;
          const angle = step * 0.1;
          newLat = latNum + Math.sin(angle) * radiusDegrees;
          newLng = lngNum + Math.cos(angle) * radiusDegrees;
        } else {
          // Linear motion (zigzag) back and forth
          const maxSteps = 20;
          const progress = (step % (maxSteps * 2));
          const factor = progress < maxSteps ? progress : (maxSteps * 2 - progress);
          // Move ~20 meters per step in a North-East diagonal direction
          newLat = latNum + (factor * 0.00018);
          newLng = lngNum + (factor * 0.00018);
        }

        const simulatedAddress = `${baseRouteName} - Live Simulating Route [Point ${step}] (${newLat.toFixed(5)}° N, ${newLng.toFixed(5)}° E)`;

        try {
          await updateLocation(newLat, newLng, simulatedAddress);
          setCustomLat(newLat.toString());
          setCustomLng(newLng.toString());
          setCustomAddress(simulatedAddress);
        } catch (err) {
          console.error("Simulation update error:", err);
        }
      };

      await runSimulationStep();
      const intervalId = setInterval(runSimulationStep, 3000);
      setSimInterval(intervalId);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchHubs();
  }, []);

  useEffect(() => {
    if (user?.phone) {
      fetchMyVehicle(user.phone);
    }
  }, [user?.phone, fetchMyVehicle]);


  // Use only real hubs from DB — no fake fallback data
  const displayHubs = hubLoading ? [] : (Array.isArray(hubs) ? hubs : []);

  const processedHubs = (displayHubs || []).map(hub => {
    if (!hub) return null;
    const dist = coords ? calculateDistance(coords.latitude, coords.longitude, hub.latitude, hub.longitude) : null;
    return {
      ...hub,
      distValue: dist === null ? 9999 : dist,
      distance: dist !== null ? (dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km') : (hub.distance || 'Dist. Pending')
    };
  }).filter(Boolean).sort((a, b) => a.distValue - b.distValue);

  const filteredHubs = processedHubs.filter(hub =>
    hub?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '')
  );

  return (
    <>
      <PageWrapper className={`relative min-h-screen ${isDark ? 'bg-[#0A1120]' : 'bg-slate-50/50'}`}>
        {/* Search and Greeting: Header Section that scrolls away */}
        <div className={`relative z-10 px-6 pt-4 pb-6 space-y-6 transition-colors duration-500 ${isDark ? 'bg-transparent' : 'bg-transparent'
          }`}>
          {/* Welcome Dashboard Section */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-flexigo-teal rounded-full shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
                <h1 className={`text-3xl font-heading font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hello, <span className="text-flexigo-teal">{user?.name?.split(' ')?.[0] || 'Rider'}</span>!
                </h1>
              </div>
              {(activePlan || selectedPlan) && (
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ml-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {activePlan ? 'Active Plan' : 'Selected Plan'}: <span className="text-flexigo-teal font-bold">{activePlan?.name || selectedPlan?.label || user?.subscriptionPlan?.name}</span>
                </p>
              )}
            </motion.div>

            <div className={`p-1 rounded-full border flex items-center gap-2 pl-3 pr-1 backdrop-blur-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 shadow-sm'
              }`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-flexigo-teal' : 'text-slate-600'}`}>Live</span>
              <div className="w-6 h-6 rounded-full bg-flexigo-teal flex items-center justify-center animate-pulse shadow-[0_0_8px_#39FF14]">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>


          {/* Quick Stats: Wallet & Subscription */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/rider/wallet')}
              className="cursor-pointer"
            >
              <GlassCard className={`p-4 transition-all duration-500 hover:shadow-2xl border flex flex-col gap-1.5 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-flexigo-teal/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-4 h-4">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M16 12a2 2 0 100-4h-4v4h4z" />
                      <path d="M22 10a2 2 0 11-4 0M2 10h16M2 14h16" />
                    </svg>
                  </div>
                  <div className="text-[14px] font-black text-flexigo-teal tracking-tighter shadow-sm">₹{balance}</div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>My Wallet</span>
              </GlassCard>
            </motion.div>

            {(activePlan || selectedPlan) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => navigate('/rider/plans')}
                className="cursor-pointer"
              >
                <GlassCard className={`p-4 transition-all duration-500 hover:shadow-2xl border flex flex-col gap-1.5 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-lg ${activePlan ? 'bg-blue-500/10' : 'bg-rose-500/10'} flex items-center justify-center`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={activePlan ? "#00D4FF" : "#F43F5E"} strokeWidth="2.5" className="w-4 h-4">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-[9px] font-black uppercase tracking-tighter shadow-sm ${activePlan ? 'text-[#00D4FF]' : 'text-rose-500'}`}>
                        {activePlan ? 'Active' : 'Pending'}
                      </div>
                      {activePlan?.expiresAt && (
                        <div className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">
                          Due: {activePlan.expiresAt ? new Date(activePlan.expiresAt).toLocaleDateString([], { day: 'numeric', month: 'short' }) : 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                    {activePlan ? 'Current Plan' : (selectedPlan?.label || user?.subscriptionPlan?.name || 'Selected Plan')}
                  </span>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>

        {/* Add Bank Details Section */}
        <div className="px-6 pb-2">
          <NeonButton variant="outline" className="w-full" onClick={() => setBankDetailsOpen(true)}>
            <div className="flex items-center justify-center gap-2">
              💳 Add Bank Details
            </div>
          </NeonButton>
        </div>

        <div className="px-6 space-y-6 pt-2">
          {/* Pickup Location Card for new riders after payment */}
          {vehicle?.model === 'Assignment Pending' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className={`p-5 border-2 border-flexigo-teal/30 bg-flexigo-teal/5 relative overflow-hidden group`}>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-flexigo-teal flex items-center justify-center text-white shadow-[0_0_15px_rgba(57,255,20,0.4)] group-hover:rotate-6 transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Pickup Your Vehicle</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Visit office to complete delivery</p>
                  </div>
                  <button
                    onClick={() => window.open('https://www.google.com/maps?q=18.566177368164062,73.7693099975586&z=17&hl=en', '_blank')}
                    className="px-4 py-2 bg-flexigo-teal text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    Open Maps
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none -mr-4 -mt-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-flexigo-teal"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </div>

        {/* ── Vehicle Section — only show if rider has active subscription ── */}
        {activePlan ? (
          <VehicleSection vehicle={vehicle} currentAddress={currentAddress} isDark={isDark} />
        ) : (
          <div className="px-6 pb-8 mt-2">
            <div
              onClick={() => navigate('/rider/plans')}
              className={`cursor-pointer rounded-2xl p-5 border-2 border-dashed ${user?.subscriptionPlan && user?.status !== 'active' ? 'border-rose-500/40 bg-rose-500/5' : 'border-flexigo-teal/30 bg-flexigo-teal/5'} flex flex-col items-center gap-3 text-center active:scale-[0.98] transition-all`}
            >
              <div className={`w-14 h-14 rounded-2xl ${user?.subscriptionPlan && user?.status !== 'active' ? 'bg-rose-500/10' : 'bg-flexigo-teal/10'} flex items-center justify-center`}>
                {user?.subscriptionPlan && user?.status !== 'active' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" className="w-7 h-7">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.subscriptionPlan && user?.status !== 'active' ? 'Upcoming Payment' : 'Payment Pending'}
                </h3>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  {user?.subscriptionPlan && user?.status !== 'active'
                    ? `Pay for ${selectedPlan?.label || user.subscriptionPlan.name || 'Saved Plan'} to activate.`
                    : 'Please complete your payment to get your vehicle'}
                </p>
              </div>
              <div className={`px-5 py-2 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg ${user?.subscriptionPlan && user?.status !== 'active' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-flexigo-teal shadow-[0_0_15px_rgba(57,255,20,0.3)]'}`}>
                Pay Now →
              </div>
            </div>
          </div>
        )}

        {/* Live Camera Modal for Bank Details */}
        <AnimatePresence>
          {cameraOpen && (
            <motion.div
              key="camera-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
              style={{ background: '#000' }}
            >
              <button
                onClick={stopWebCamera}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {cameraError ? (
                <div className="flex flex-col items-center gap-4 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" className="w-8 h-8">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-bold">{cameraError}</p>
                  <button
                    onClick={stopWebCamera}
                    className="mt-2 px-6 py-3 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest"
                  >Close</button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ maxHeight: '80vh' }}
                  />
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                      style={{ background: 'rgba(57,255,20,0.2)', boxShadow: '0 0 20px #39FF14' }}
                    >
                      <div className="w-14 h-14 rounded-full bg-[#39FF14]" />
                    </button>
                  </div>
                  <p className="absolute bottom-36 left-0 right-0 text-center text-white/60 text-[10px] font-black uppercase tracking-widest">Tap to Capture</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera / Upload Picker Modal for Bank Details */}
        <AnimatePresence>
          {pickerModal.open && (
            <motion.div
              key="picker-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePickerModal}
              className="fixed inset-0 z-[100] flex items-end justify-center"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                key="picker-sheet"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-sm rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#111] border-t border-white/10' : 'bg-white border-t border-slate-100 shadow-2xl'}`}
              >
                <div className="flex justify-center mb-5">
                  <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'}`} />
                </div>
                <p className={`text-center text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Choose Option</p>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <button
                    onClick={() => {
                      if (isFlutterApp()) {
                        closePickerModal();
                        captureWithFlutter(pickerModal.type, pickerModal.fileInputId);
                      } else {
                        openWebCamera(pickerModal.type);
                      }
                    }}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5 hover:border-[#39FF14] hover:bg-[#39FF14]/10' : 'border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50'}`}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#39FF14]/10">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>Camera</span>
                  </button>
                  <label
                    htmlFor={pickerModal.fileInputId}
                    onClick={closePickerModal}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5 hover:border-[#39FF14] hover:bg-[#39FF14]/10' : 'border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50'}`}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#39FF14]/10">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>Gallery</span>
                  </label>
                </div>
                <button
                  onClick={closePickerModal}
                  className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                >Cancel</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </PageWrapper>

      <BottomSheet
        isOpen={isBankDetailsOpen}
        onClose={() => setBankDetailsOpen(false)}
        title="Add Bank Details"
      >
        <form onSubmit={handleBankDetailsSubmit} className="px-6 pb-24 pt-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Account Name (Customer Name)</label>
            <input type="text" required value={bankFormData.accountName} onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-flexigo-teal ${isDark ? 'text-white' : 'text-slate-900 border-slate-200'}`} />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Bank Name</label>
            <input type="text" required value={bankFormData.bankName} onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-flexigo-teal ${isDark ? 'text-white' : 'text-slate-900 border-slate-200'}`} />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">Account Number</label>
            <input type="text" required value={bankFormData.accountNumber} onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-flexigo-teal ${isDark ? 'text-white' : 'text-slate-900 border-slate-200'}`} />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500">IFSC Code</label>
            <input type="text" required value={bankFormData.ifscCode} onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-flexigo-teal ${isDark ? 'text-white' : 'text-slate-900 border-slate-200'}`} />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Proof Attachment</label>
            <input id="bank-attachment-input" type="file" className="hidden" accept="image/*" onChange={(e) => setBankFormData({ ...bankFormData, attachment: e.target.files[0] })} />
            <div
              onClick={() => handleCameraCapture('bankAttachment', 'bank-attachment-input')}
              className={`p-4 rounded-2xl border-dashed border-2 flex items-center gap-4 cursor-pointer transition-all duration-500 ${bankFormData.attachment ? 'border-flexigo-teal bg-flexigo-teal/5' : isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}
            >
              {bankFormData.attachment ? (
                <img src={URL.createObjectURL(bankFormData.attachment)} alt="Preview" className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-flexigo-teal/10 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
              <span className={`text-[10px] font-black uppercase tracking-widest ${bankFormData.attachment ? 'text-flexigo-teal' : isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                {bankFormData.attachment ? 'Attachment Captured ✓ Tap to Retake' : isFlutterApp() ? 'Tap to Open Camera' : 'Tap — Camera / Upload File'}
              </span>
            </div>
          </div>
          <NeonButton variant="solid" className="w-full mt-6" type="submit" disabled={isSubmittingBankDetails}>
            {isSubmittingBankDetails ? 'Saving...' : 'Save Bank Details'}
          </NeonButton>
        </form>
      </BottomSheet>

      <BottomSheet
        isOpen={isDiagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        title="Vehicle Diagnostics"
      >
        <div className="px-6 pb-24 pt-4 space-y-6">
          {/* Back to Home Button */}
          <button
            onClick={() => setDiagnosticsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Home</span>
          </button>

          {/* Main Status Card */}
          <GlassCard className="p-5 flex items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-flexigo-teal/10 flex items-center justify-center overflow-hidden border border-flexigo-teal/20 transition-all group-hover:scale-105 duration-500">
              {vehicle?.images?.length > 0 ? (
                <img src={vehicle.images[0]} alt={vehicle.model} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="1.5" className="w-10 h-10">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-heading font-black text-xl transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle?.model || 'No Vehicle'}</h3>
              <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.25em] font-black">{vehicle?.plateNumber || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-flexigo-teal/20 text-flexigo-teal px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-[0_0_15px_#39FF1444]">
                LIVE
              </div>
              <span className="text-[10px] font-bold text-gray-500 italic">Connected ✓</span>
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-5 flex flex-col gap-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-black text-gray-500">Live Range</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-heading font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle?.range || 0}</span>
                <span className="text-flexigo-teal text-xs font-black uppercase">KM</span>
              </div>
              {/* Range bar — dynamic width based on vehicle.range (max 150km assumed) */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((vehicle?.range || 0) / 150) * 100, 100)}%` }}
                  className="h-full bg-flexigo-teal shadow-[0_0_10px_#39FF14]"
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 -rotate-12">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20"><path d="M7 2v10h3l-4 8v-8h3z" /></svg>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-black text-gray-500">Battery</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-heading font-black text-flexigo-teal">{vehicle?.battery || 0}%</span>
              </div>
              {/* Battery segments — dynamic based on vehicle.battery (each segment = 20%) */}
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const segmentFilled = (vehicle?.battery || 0) >= (i + 1) * 20;
                  return (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${segmentFilled ? 'bg-flexigo-teal shadow-[0_0_8px_#39FF14]' : 'bg-gray-500/20'}`} />
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Sustainability Insight — carbon saved = vehicle.totalDistance * 0.12 kg (avg petrol emission factor) */}
          <div className={`border border-flexigo-teal/20 rounded-2xl p-5 flex items-center gap-5 transition-all duration-500 ${isDark ? 'bg-flexigo-teal/5' : 'bg-flexigo-teal/[0.03]'}`}>
            <div className="w-12 h-12 rounded-2xl bg-flexigo-teal/10 flex items-center justify-center text-flexigo-teal shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
            </div>
            <p className={`text-[11px] font-black uppercase tracking-wider leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Impact: You've saved{' '}
              <span className="text-flexigo-teal font-black text-sm">
                {vehicle?.totalDistance ? (vehicle.totalDistance * 0.12).toFixed(1) : '0.0'}KG
              </span>{' '}
              of carbon footprint this week.
            </p>
          </div>

          {/* Testing / Developer Actions */}
          <div className="space-y-3">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>GPS Location Simulator (Dev Mode)</h4>

            <GlassCard className="p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <h5 className={`text-xs font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Simulate Dynamic Location</h5>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Push mock coords dynamically to MongoDB</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* Preset Quick Links */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] font-black uppercase text-slate-500">INDORE TESTING PRESETS (Sagar Kher):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => {
                        setCustomLat('22.71117');
                        setCustomLng('75.90017');
                        setCustomAddress('Pipliyahana Square, Pipliyahana Road, Indore, Madhya Pradesh 452016');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all border ${isAutoSimulating
                        ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                    >
                      Indore Pipliyahana
                    </button>
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => {
                        setCustomLat('22.71660');
                        setCustomLng('75.86990');
                        setCustomAddress('Choti Gwaltoli, Indore, Madhya Pradesh 452001');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all border ${isAutoSimulating
                        ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                        }`}
                    >
                      Indore Choti Gwaltoli
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] font-black uppercase text-slate-500">PUNE TESTING PRESETS (Tushar / Ashish):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => {
                        setCustomLat('18.58082');
                        setCustomLng('73.76704');
                        setCustomAddress('Prima Domus building-B, Prima Domus, Patil Nagar, Balewadi, Pune, Maharashtra 411045');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all border ${isAutoSimulating
                        ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                    >
                      Prima Domus B
                    </button>
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => {
                        setCustomLat('18.58150');
                        setCustomLng('73.76710');
                        setCustomAddress('Balaji Bike Repair & Service Baner Pune, Patil Nagar, Balewadi, Pune, Maharashtra 411045');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all border ${isAutoSimulating
                        ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                    >
                      Balaji Bike
                    </button>
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => {
                        setCustomLat('18.59130');
                        setCustomLng('73.73890');
                        setCustomAddress('Hinjewadi Phase 1, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Maharashtra 411057');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all border ${isAutoSimulating
                        ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                        : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                        }`}
                    >
                      Pune Hinjewadi
                    </button>
                  </div>
                </div>

                {/* Dynamic Auto-Simulation Engine UI Box */}
                <div className={`p-4 rounded-xl border transition-all space-y-3 ${isAutoSimulating
                  ? 'bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.15)] shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isAutoSimulating ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Route Auto-Simulation</span>
                    </div>
                    {isAutoSimulating && (
                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/15 px-2.5 py-0.5 rounded uppercase tracking-widest italic animate-pulse">
                        Step {simStep} • Active
                      </span>
                    )}
                  </div>

                  {/* Route Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => setSimRouteType('circular')}
                      className={`py-1.5 px-2 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all text-center ${simRouteType === 'circular'
                        ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                      🔄 Circular Route (200m)
                    </button>
                    <button
                      type="button"
                      disabled={isAutoSimulating}
                      onClick={() => setSimRouteType('linear')}
                      className={`py-1.5 px-2 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all text-center ${simRouteType === 'linear'
                        ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                      ⚡ Linear ZigZag (400m)
                    </button>
                  </div>

                  {/* Start / Pause Simulation Trigger */}
                  <button
                    type="button"
                    onClick={toggleAutoSimulation}
                    className={`w-full py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isAutoSimulating
                      ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)] shadow-emerald-500/10'
                      }`}
                  >
                    {isAutoSimulating ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
                        <span>⏸️ Pause Simulation Loop</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        <span>🚀 Launch Auto-Route Simulation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Latitude</label>
                    <input
                      type="text"
                      disabled={isAutoSimulating}
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className={`w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-emerald-500/50 ${isAutoSimulating ? 'opacity-50 text-slate-400 cursor-not-allowed' : 'text-white'
                        }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Longitude</label>
                    <input
                      type="text"
                      disabled={isAutoSimulating}
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      className={`w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-emerald-500/50 ${isAutoSimulating ? 'opacity-50 text-slate-400 cursor-not-allowed' : 'text-white'
                        }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Address String</label>
                  <textarea
                    rows={2}
                    disabled={isAutoSimulating}
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-emerald-500/50 resize-none ${isAutoSimulating ? 'opacity-50 text-slate-400 cursor-not-allowed' : 'text-white'
                      }`}
                  />
                </div>

                {/* Dynamic Sync & Reset Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={simulatingLoc !== null || isAutoSimulating}
                    onClick={async () => {
                      setSimulatingLoc('custom');
                      try {
                        const latNum = parseFloat(customLat);
                        const lngNum = parseFloat(customLng);
                        if (isNaN(latNum) || isNaN(lngNum)) {
                          alert("⚠️ Please enter valid numeric Latitude and Longitude values.");
                          return;
                        }
                        sessionStorage.setItem('simulated_gps', 'true');
                        await updateLocation(latNum, lngNum, customAddress);
                        alert(`✅ Dynamically synced & locked coordinates to MongoDB!\nLat: ${latNum}, Lng: ${lngNum}\nAddress: ${customAddress}`);
                      } catch (e) {
                        alert("❌ Failed to sync: " + e.message);
                      } finally {
                        setSimulatingLoc(null);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${isAutoSimulating
                      ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                      : simulatingLoc === 'custom'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                  >
                    {simulatingLoc === 'custom' ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <span>⚡ Sync Custom Coords</span>
                    )}
                  </button>

                  <button
                    disabled={simulatingLoc !== null || isAutoSimulating}
                    onClick={async () => {
                      setSimulatingLoc('realgps');
                      try {
                        sessionStorage.removeItem('simulated_gps');
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                              const { latitude, longitude } = pos.coords;
                              let finalAddress = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                              try {
                                const { reverseGeocode } = await import('../../../lib/googleMaps');
                                const address = await reverseGeocode(latitude, longitude);
                                if (address) finalAddress = address;
                              } catch (err) {
                                console.warn("Geocoding failed, using GPS label:", err);
                              }
                              setCustomLat(latitude.toString());
                              setCustomLng(longitude.toString());
                              setCustomAddress(finalAddress);
                              await updateLocation(latitude, longitude, finalAddress);
                              alert(`✅ Device GPS Sync Complete!\nLocation: ${finalAddress}`);
                              setSimulatingLoc(null);
                            },
                            (err) => {
                              alert("⚠️ Failed to acquire device GPS: " + err.message);
                              setSimulatingLoc(null);
                            },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                          );
                        } else {
                          alert("⚠️ Geolocation not supported in this browser context.");
                          setSimulatingLoc(null);
                        }
                      } catch (e) {
                        alert("❌ Failed to reset GPS: " + e.message);
                        setSimulatingLoc(null);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${isAutoSimulating
                      ? 'opacity-40 cursor-not-allowed bg-slate-500/10 border-transparent text-slate-500'
                      : simulatingLoc === 'realgps'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-500/20'
                      }`}
                  >
                    {simulatingLoc === 'realgps' ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <span>📍 Use Device GPS</span>
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Operational Actions */}
          <div className="space-y-3">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Operational Actions</h4>
            <GlassCard
              className={`p-4 border border-flexigo-teal/10 hover:border-flexigo-teal/30 transition-all group cursor-pointer`}
              onClick={async () => {
                if (window.confirm('Are you sure you want to request a vehicle handover?')) {
                  const { requestHandover } = useRideStore.getState();
                  const res = await requestHandover();
                  if (res.success) {
                    alert('Handover request sent successfully. Please visit the office.');
                  } else {
                    alert(res.message);
                  }
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-flexigo-teal/10 flex items-center justify-center text-flexigo-teal group-hover:rotate-180 transition-transform duration-700">
                    <RefreshCw size={20} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Vehicle Handover</h4>
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Initiate return protocol</p>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-flexigo-teal/5 text-flexigo-teal transition-all group-hover:translate-x-1`}>
                  <ChevronRight size={14} strokeWidth={3} />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

