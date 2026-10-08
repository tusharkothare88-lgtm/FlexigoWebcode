import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { useRideStore } from '../store/rideStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState } from 'react';

export function RiderHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { setDiagnosticsOpen, currentAddress, vehicle } = useRideStore();
  const [isSimulating, setIsSimulating] = useState(localStorage.getItem('simulate_location') === 'true');

  const handleToggleSimulation = async (e) => {
     e.stopPropagation();
     // Disable simulation toggle - always use real GPS location
     console.warn('Location simulation disabled - using real GPS only');
     return;
  };

  const isVehicleAssigned = vehicle?.id && vehicle.id !== 'FLX-PENDING';
  const hasLowBattery = vehicle?.battery < 20 && isVehicleAssigned;

  // Don't show header on splash, auth, or onboarding screens
  const isAuth = pathname.includes('/rider/auth') || pathname.includes('/rider/onboarding') || pathname === '/rider' || pathname === '/rider/';
  if (isAuth) return null;

  return (
    <header 
      className={`absolute top-0 left-0 right-0 z-[60] px-6 py-3 flex items-center justify-between transition-colors duration-500 border-b ${
        theme === 'dark' 
          ? 'bg-[#0A0A0F]/90 border-white/05 backdrop-blur-xl shadow-2xl' 
          : 'bg-white/90 border-slate-200 backdrop-blur-xl shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/rider/home')}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
          theme === 'dark' ? 'bg-flexigo-teal/10 border-flexigo-teal/20' : 'bg-flexigo-teal/5 border-flexigo-teal/10 shadow-sm'
        }`}>
          <img src={logo} alt="Flexigo" className="w-full h-full object-contain p-0.5 scale-[1.7] transition-transform" />
        </div>
        <div className="flex flex-col">
          <span className={`font-heading font-black text-sm tracking-tight leading-none uppercase transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Flexi<span className="text-flexigo-teal">Go</span>
          </span>
          <div 
             onClick={handleToggleSimulation}
             className="flex items-center gap-1 mt-0.5 cursor-pointer hover:opacity-85 active:scale-95 transition-all bg-white/5 border border-white/05 px-1.5 py-0.5 rounded-md hover:bg-emerald-500/10"
             title="Real-time location tracking active"
          >
             <div className={`w-1 h-1 rounded-full animate-pulse ${
                isSimulating ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-flexigo-teal shadow-[0_0_8px_#39FF14]'
             }`} />
             <span className="text-[7.5px] text-gray-400 font-black uppercase tracking-widest truncate max-w-[120px] italic">
                {currentAddress} {isSimulating ? '• SIMULATED' : ''}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Profile Navigator */}
        <button 
          onClick={() => navigate('/rider/profile')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 text-flexigo-teal/80 hover:bg-white/10' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 shadow-sm'
          }`}
        >
           <span className="text-[11px] font-black">{user?.name?.charAt(0) || 'R'}</span>
        </button>

        {/* Tactical Vehicle Status Button */}
        <button 
          onClick={() => setDiagnosticsOpen(true)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all relative group shadow-sm bg-flexigo-teal/5 border-flexigo-teal/20`}
        >
           <svg viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#39FF14' : '#0F766E'} strokeWidth="1.8" className="w-7 h-7 filter drop-shadow-sm group-hover:scale-110 transition-transform">
             <path d="M14.5 7h4v2" />
             <path d="M6 16c1.1 0 2-.9 2-2H4c0 1.1.9 2 2 2z" />
             <path d="M18 16c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
             <path d="M12 7h-7v4h14V7z" />
             <path d="M8 7v-2" />
             <path d="M16 7v-2" />
           </svg>
           <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
              theme === 'dark' ? 'border-[#0A0A0F]' : 'border-white'
           } ${
              !isVehicleAssigned ? 'bg-slate-500' : hasLowBattery ? 'bg-red-500' : 'bg-flexigo-teal'
           }`}>
             <div className={`w-1 h-1 rounded-full bg-white ${isVehicleAssigned ? 'animate-pulse' : ''}`} />
           </div>
        </button>
      </div>
    </header>
  );
}
