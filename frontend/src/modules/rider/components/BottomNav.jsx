import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

const tabs = [
  {
    id: 'home',
    path: '/rider/home',
    label: 'Home',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill={active ? '#39FF14' : 'none'} stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21V15C9 14.448 9.448 14 10 14H14C14.552 14 15 14.448 15 15V21M9 21H15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'batteries-hubs',
    path: '/rider/batteries-hubs',
    label: 'Batteries Hubs',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'payments',
    path: '/rider/payments',
    label: 'Payments',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 8.5h8M8 12.5h8M10 8.5v7M14 8.5v4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'garage',
    path: '/rider/garage',
    label: 'Hub',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <path d="M12 12v4M10 14h4" strokeLinecap="round" />
        <circle cx="8" cy="17" r="1" fill={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
        <circle cx="16" cy="17" r="1" fill={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
      </svg>
    ),
  },
  {
    id: 'wallet',
    path: '/rider/wallet',
    label: 'Wallet',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M16 12a2 2 0 100-4h-4v4h4z" />
        <path d="M22 10a2 2 0 11-4 0M2 10h16M2 14h16" />
      </svg>
    ),
  },
  {
    id: 'plans',
    path: '/rider/plans',
    label: 'Plans',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'profile',
    path: '/rider/profile',
    label: 'Profile',
    icon: (active, theme) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#39FF14' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} strokeWidth="1.8" className="w-5 h-5 sm:w-6 sm:h-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme } = useThemeStore();

  const isOnboarding = pathname.includes('/rider/onboarding');
  if (isOnboarding) return null;

  return (
    <div
      className={`w-full px-6 pt-2 pb-6 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#0A0A10]' : 'bg-slate-50'
      }`}
    >
      <div
        className={`relative flex items-center justify-between rounded-2xl px-1 py-2 transition-all duration-500 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 shadow-[0_-4px_40px_rgba(0,0,0,0.6)]' 
            : 'bg-white border border-slate-200 shadow-lg'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        {tabs.filter(tab => tab.id !== 'garage').map((tab) => {
          const active = pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-1 py-1 px-0.5 flex-1 rounded-xl transition-all duration-200"
            >
              {tab.icon(active, theme)}
              <span
                className={`text-[7.5px] sm:text-[10px] text-center leading-tight whitespace-nowrap tracking-tighter sm:tracking-wide transition-colors ${
                  active 
                    ? 'text-flexigo-teal font-black' 
                    : (theme === 'dark' ? 'text-gray-500' : 'text-slate-400')
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full"
                  style={{ background: '#39FF14', boxShadow: '0 0 6px #39FF14' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
