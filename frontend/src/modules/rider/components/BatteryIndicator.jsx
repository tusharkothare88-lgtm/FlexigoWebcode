import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useThemeStore } from '../store/themeStore';

export function BatteryIndicator({ percentage = 87, size = 'lg', animated = true }) {
  const fillRef = useRef(null);
  const glowRef = useRef(null);
  const percentRef = useRef(null);
  const { theme } = useThemeStore();

  const getColor = (pct) => {
    if (pct > 60) return '#39FF14';
    if (pct > 30) return '#FFD60A';
    return '#FF3B30';
  };

  const color = getColor(percentage);

  useEffect(() => {
    if (!fillRef.current || !animated) return;

    gsap.to(fillRef.current, {
      width: `${percentage}%`,
      duration: 1.5,
      ease: 'power3.out',
    });

    gsap.to(glowRef.current, {
      opacity: 0.6,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    if (percentRef.current) {
      gsap.fromTo(
        percentRef.current,
        { innerText: 0 },
        {
          innerText: Math.round(percentage),
          duration: 1.5,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            if (percentRef.current) {
              percentRef.current.innerText = Math.round(this.targets()[0].innerText) + '%';
            }
          },
        }
      );
    }
  }, [percentage, animated]);

  const isLg = size === 'lg';
  const isMd = size === 'md';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Percentage Display */}
      <div
        ref={percentRef}
        className={`font-heading font-black tracking-tight transition-all duration-500 ${
          isLg ? 'text-7xl' : isMd ? 'text-5xl' : 'text-3xl'
        }`}
        style={{ 
          color, 
          textShadow: theme === 'dark' ? `0 0 30px ${color}88, 0 0 60px ${color}44` : `0 4px 12px ${color}44` 
        }}
      >
        {percentage}%
      </div>

      {/* Battery bar */}
      <div className="relative w-full flex items-center gap-2">
        <div
          className={`relative flex-1 rounded-full overflow-hidden transition-all duration-500 ${
            isLg ? 'h-5' : isMd ? 'h-3.5' : 'h-2.5'
          } ${
            theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-slate-200 border border-slate-300 shadow-inner'
          }`}
        >
          <div
            ref={fillRef}
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}99, ${color})`,
              boxShadow: theme === 'dark' ? `0 0 12px ${color}88` : 'none',
            }}
          />
          {/* Shimmer */}
          <div
            ref={glowRef}
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}22, transparent)`,
              opacity: 0,
            }}
          />
        </div>
        {/* Battery tip */}
        <div
          className={`flex-shrink-0 rounded-sm transition-colors duration-500 ${
            isLg ? 'w-2 h-3' : 'w-1.5 h-2.5'
          } ${
            theme === 'dark' ? 'bg-white/30' : 'bg-slate-400'
          }`}
        />
      </div>

      {/* Status label */}
      <p className={`text-[10px] tracking-[0.25em] uppercase font-black transition-colors duration-500 ${
        theme === 'dark' ? 'text-gray-500' : 'text-slate-500'
      }`}>
        {percentage > 60 ? 'Optimal Charge' : percentage > 30 ? 'Moderate' : 'Low Battery'}
      </p>
    </div>
  );
}
