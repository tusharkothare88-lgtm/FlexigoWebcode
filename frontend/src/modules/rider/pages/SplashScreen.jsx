import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { PageWrapper } from '../components/PageWrapper';
import { useThemeStore } from '../store/themeStore';
import logo from '../../../assets/logo.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const logoRef = useRef(null);
  const ringRef = useRef(null);
  const ring2Ref = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => navigate('/rider/auth/phone'), 600);
      },
    });

    tl.fromTo(logoRef.current, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' })
      .fromTo(ringRef.current, { scale: 0.5, opacity: 0 }, { scale: 1.5, opacity: 0, duration: 1.2, ease: 'power2.out' }, '-=0.4')
      .fromTo(ring2Ref.current, { scale: 0.5, opacity: 0 }, { scale: 2, opacity: 0, duration: 1.5, ease: 'power2.out' }, '-=1.1')
      .to(logoRef.current, { scale: 1.05, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '-=0.5')
      .to({}, { duration: 0.5 });
  }, [navigate]);

  return (
    <PageWrapper className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Layer */}
      <div
        className={`absolute inset-0 z-0 transition-colors duration-1000 ${
          isDark ? 'bg-[#0A0A0F]' : 'bg-white'
        }`}
      />
      
      {/* Subtle Grid Accent */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          opacity: isDark ? 0.05 : 0.03,
          backgroundImage: `linear-gradient(${isDark ? 'rgba(57,255,20,0.2)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(57,255,20,0.2)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ripple Rings (Visual Depth) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div
          ref={ringRef}
          className="absolute w-64 h-64 rounded-full border border-flexigo-teal/20"
          style={{ opacity: 0 }}
        />
        <div
          ref={ring2Ref}
          className="absolute w-64 h-64 rounded-full border border-flexigo-teal/10"
          style={{ opacity: 0 }}
        />
      </div>

      {/* Brand Container */}
      <div
        ref={logoRef}
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ opacity: 0 }}
      >
        <div className="mb-8 relative">
           <div className="w-16 h-16 rounded-2xl bg-flexigo-teal flex items-center justify-center shadow-[0_0_50px_rgba(57,255,20,0.3)]">
             <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" className="w-9 h-9">
               <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
           </div>
           {/* Animated pulse shadow */}
           <div className="absolute inset-0 w-16 h-16 bg-flexigo-teal rounded-2xl animate-ping opacity-20 -z-10" />
        </div>

        <div className="space-y-3">
          <h1 className={`text-5xl font-heading font-[900] tracking-tighter transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Flexi<span className="text-flexigo-teal">Go</span>
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-flexigo-teal/50" />
            <p className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${
              isDark ? 'text-gray-500' : 'text-slate-400'
            }`}>
              Electric Freedom
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
