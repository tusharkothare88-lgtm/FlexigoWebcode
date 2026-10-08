import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { BatteryIndicator } from '../components/BatteryIndicator';
import { NeonButton } from '../components/NeonButton';
import { useRideStore } from '../store/rideStore';
import { useThemeStore } from '../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export default function RideFlow() {
  const navigate = useNavigate();
  const { rideStatus, activeRide, vehicle, startRide, endRide, resetRide } = useRideStore();
  const { theme } = useThemeStore();
  const [timer, setTimer] = useState('00:00:00');
  const unlockRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (rideStatus === 'active') {
      const interval = setInterval(() => {
        const diff = Date.now() - activeRide.startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setTimer(`${h}:${m}:${s}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rideStatus, activeRide]);

  useEffect(() => {
    if (rideStatus === 'unlocking') {
      // Unlock animation
      gsap.to(unlockRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 2,
        ease: 'power2.out',
        repeat: -1
      });

      const timer = setTimeout(() => startRide(), 3000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus, startRide]);

  if (rideStatus === 'unlocking') {
    return (
      <PageWrapper className="flex flex-col items-center justify-center p-10 text-center">
        <div className="relative mb-12">
          <div ref={unlockRef} className="absolute inset-0 border-4 border-flexigo-teal rounded-full opacity-50" />
          <div className={`w-32 h-32 rounded-full border-4 border-flexigo-teal flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-flexigo-teal/10' : 'bg-flexigo-teal/5 shadow-neon'
            }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-12 h-12">
              <path d="M7 11V7a5 5 0 0110 0v4M12 12v3m0 0a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h1 className={`text-3xl font-heading font-black mb-4 animate-pulse transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
          }`}>Unlocking Vehicle...</h1>
        <p className={`text-sm transition-colors duration-500 ${isDark ? 'text-gray-600' : 'text-slate-500'
          }`}>Please stand near your Flexigo S1 Pro.</p>
      </PageWrapper>
    );
  }

  if (rideStatus === 'completed') {
    return (
      <PageWrapper className={`flex flex-col p-10 transition-colors duration-500 ${isDark ? 'bg-[#0A0A0F]' : 'bg-slate-50'
        }`}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-flexigo-teal rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_#39FF1466]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" className="w-12 h-12">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <h1 className={`text-3xl font-heading font-black mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>Ride Finished!</h1>
          <p className="text-gray-500 mb-12 font-bold uppercase tracking-widest text-[10px]">Fantastic journey with Flexigo.</p>

          <GlassCard className="w-full p-8 space-y-6">
            <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <span>Summary</span>
              <span className={isDark ? 'text-gray-700' : 'text-slate-400'}>UID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-gray-500 text-[10px] mb-1 font-black uppercase tracking-widest">DISTANCE</div>
                <div className={`text-2xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}>{activeRide.distance || '12.4'} <span className="text-xs uppercase">KM</span></div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-[10px] mb-1 font-black uppercase tracking-widest">COST</div>
                <div className="text-flexigo-teal text-2xl font-heading font-black">₹{activeRide.cost || '0'}</div>
              </div>
            </div>
            <div className={`h-px transition-colors duration-500 ${isDark ? 'bg-white/05' : 'bg-slate-100'}`} />
            <div className={`flex justify-between items-center rounded-xl p-4 transition-colors duration-500 ${isDark ? 'bg-white/05' : 'bg-slate-100'
              }`}>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Rating</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-flexigo-teal shadow-neon-sm" />)}
              </div>
            </div>
          </GlassCard>
        </div>
        <NeonButton variant="solid" size="xl" onClick={() => { resetRide(); navigate('/rider/home'); }}>
          Back to Dashboard
        </NeonButton>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper noHeader className="flex flex-col p-6 min-h-[100dvh]">
      <div className="pt-10 flex justify-between items-start">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-black text-flexigo-teal">Live Ride Active</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-flexigo-teal animate-ping shadow-neon-sm" />
            <h2 className={`font-heading font-black text-2xl transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
              }`}>{timer}</h2>
          </div>
        </div>
        <GlassCard className="px-4 py-2 border-flexigo-teal/40">
          <span className="text-flexigo-teal text-[10px] font-black tracking-[0.2em] uppercase">ON RIDE</span>
        </GlassCard>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-[200px] mb-12">
          <BatteryIndicator percentage={vehicle.battery} size="md" />
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <GlassCard className="p-4 relative">
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">SPEED</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}>42</span>
              <span className="text-gray-500 text-xs font-black uppercase">KM/H</span>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">DISTANCE</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}>4.8</span>
              <span className="text-gray-500 text-xs font-black uppercase">KM</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Map View Small Floating */}
      <div className={`relative h-48 w-full rounded-3xl overflow-hidden border mb-8 transition-all duration-500 shadow-lg ${isDark ? 'border-white/10 shadow-black/40' : 'border-slate-200 shadow-slate-200'
        }`}>
        <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`} />
        <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-20'}`}
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)'
              : 'linear-gradient(#047857 1px, transparent 1px), linear-gradient(90deg, #047857 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-flexigo-teal/20 animate-ping absolute" />
          <div className="w-3.5 h-3.5 rounded-full bg-flexigo-teal border-2 border-white relative z-10 shadow-neon-sm" />
        </div>
        <div className={`absolute bottom-4 left-4 backdrop-blur-md px-4 py-2 rounded-xl border flex items-center gap-2 transition-all duration-500 ${isDark ? 'bg-black/60 border-white/10' : 'bg-white/80 border-slate-200 shadow-sm'
          }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>HSR HUB REACHED</span>
        </div>
      </div>

      <div className="pb-10 space-y-4">
        <NeonButton
          variant="danger"
          size="xl"
          className="w-full h-20 text-xl font-black uppercase tracking-widest shadow-2xl"
          onClick={async () => {
            if (window.confirm('Are you sure you want to END RIDE and initiate handover?')) {
              await endRide();
            }
          }}
        >
          HOLD TO END RIDE
        </NeonButton>

        <button
          onClick={() => {
            if (window.confirm('Cancel this ride session? This will not end your subscription.')) {
              resetRide();
              navigate('/rider/home');
            }
          }}
          className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${isDark ? 'text-slate-500 hover:text-rose-500' : 'text-slate-400 hover:text-rose-600'
            }`}
        >
          Cancel Current Session
        </button>
      </div>
    </PageWrapper>
  );
}
