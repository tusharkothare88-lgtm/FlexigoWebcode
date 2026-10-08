import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useThemeStore } from '../store/themeStore';
import logo from '../../../assets/logo.png';

// Removed hardcoded chargingHubs mock
import { useRideStore } from '../store/rideStore';
import { useState, useEffect } from 'react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function HubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { hubs, fetchHubs } = useRideStore();
  const isDark = theme === 'dark';
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (hubs.length === 0) fetchHubs();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }
  }, []);

  const rawHub = hubs.find(h => h.id === id || h._id === id);
  if (!rawHub) return null; // Or show loading

  const dist = coords ? calculateDistance(coords.latitude, coords.longitude, rawHub.latitude, rawHub.longitude) : null;
  const hub = {
    ...rawHub,
    distanceStr: dist ? (dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km') : 'calculating...',
    hours: '24/7 Operations', // Default as not in model yet
    availableSlots: rawHub.availableSlots || 0
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hub.address)}`;
    window.open(url, '_blank');
  };

  return (
    <PageWrapper className="flex flex-col px-6 pt-6 pb-32">
       {/* Transparent Header with Back Button */}
       <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className={`text-2xl font-heading font-black transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Franchise Details</h1>
            <p className="text-[10px] font-black uppercase text-flexigo-teal tracking-widest mt-0.5">Tactical View</p>
          </div>
       </div>

       <div className="space-y-6 flex-1">
          {/* Main Info Card */}
          <GlassCard className="p-6 relative overflow-hidden border-2 shadow-2xl">
             <div 
               className="absolute top-0 right-0 p-4 opacity-5 scale-[2] rotate-12"
               style={{ color: hub.color }}
             >
                <img src={logo} className="w-32 h-32 brightness-0" />
             </div>

             <div className="flex items-center gap-5 mb-8 relative z-10">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all p-4 shadow-xl"
                  style={{ 
                    backgroundColor: `${hub.color}10`, 
                    borderColor: `${hub.color}33`,
                  }}
                >
                  <img src={logo} alt="Flexigo" className="w-full h-full object-contain brightness-0 opacity-90" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: hub.color }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: hub.color }}>{hub.status}</span>
                   </div>
                   <h2 className={`text-2xl font-heading font-black transition-colors ${
                     isDark ? 'text-white' : 'text-slate-900'
                   }`}>{hub.name}</h2>
                   <p className="text-gray-500 font-bold text-xs mt-1">{hub.distanceStr} away from you</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/05 border-white/08' : 'bg-slate-50 border-slate-100'}`}>
                   <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Batteries</span>
                   <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{hub.batteries}</span>
                      <span className="text-[10px] font-black text-flexigo-teal">UNIT</span>
                   </div>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/05 border-white/08' : 'bg-slate-50 border-slate-100'}`}>
                   <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Open Slots</span>
                   <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{hub.availableSlots}</span>
                      <span className="text-[10px] font-black text-amber-500">BAY</span>
                   </div>
                </div>
             </div>
          </GlassCard>

          {/* Location Details */}
          <div className="space-y-4">
             <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] px-2 ${
               isDark ? 'text-gray-500' : 'text-slate-400'
             }`}>Location & Access</h3>
             
             <GlassCard className="p-6 space-y-6 shadow-xl">
                <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-flexigo-teal/10 flex items-center justify-center shrink-0 border border-flexigo-teal/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-5 h-5">
                         <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                         <circle cx="12" cy="10" r="3" />
                      </svg>
                   </div>
                   <div>
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-0.5">Address</span>
                      <p className={`text-sm font-bold leading-relaxed transition-colors ${
                        isDark ? 'text-gray-300' : 'text-slate-800'
                      }`}>{hub.address}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" className="w-5 h-5">
                         <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                   </div>
                   <div>
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-0.5">Operational Hours</span>
                      <p className={`text-sm font-bold transition-colors ${
                        isDark ? 'text-gray-300' : 'text-slate-800'
                      }`}>{hub.hours}</p>
                   </div>
                </div>

                <div className="pt-4">
                   <NeonButton variant="outline" size="full" onClick={handleDirections}>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>
                        Get Directions
                      </div>
                   </NeonButton>
                </div>
             </GlassCard>
          </div>

          {/* Quick Tips */}
          <div className="p-5 rounded-2xl bg-flexigo-teal/5 border border-flexigo-teal/20">
             <div className="flex items-center gap-3 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-flexigo-teal">Swap Tip</span>
             </div>
             <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
               Always verify the QR code on the battery unit before initiating a swap session from your garage.
             </p>
          </div>
       </div>
    </PageWrapper>
  );
}
