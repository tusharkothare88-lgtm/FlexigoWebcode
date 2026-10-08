import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function DataCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'emerald',
  className = "",
  onClick
}) {
  const cardRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    // GSAP Entrance Choreography
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 20, scale: 0.98 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        ease: "expo.out",
        delay: Math.random() * 0.2 // Subtle organic offset
      }
    );
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    // Magnetic Icon physics
    gsap.to(iconRef.current, {
      x: x * 15,
      y: y * 15,
      rotate: x * 10,
      duration: 0.6,
      ease: "power2.out"
    });

    // Subtle 3D card tilt
    gsap.to(cardRef.current, {
      rotationX: -y * 8,
      rotationY: x * 8,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(iconRef.current, { x: 0, y: 0, rotate: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
    gsap.to(cardRef.current, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
  };

  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-600/10 border-emerald-500/20',
    blue: 'text-blue-600 bg-blue-600/10 border-blue-500/20',
    amber: 'text-amber-600 bg-amber-600/10 border-amber-500/20',
    rose: 'text-rose-600 bg-rose-600/10 border-rose-500/20',
    violet: 'text-violet-600 bg-violet-600/10 border-violet-500/20',
  };

  return (
    <motion.div 
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={`p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner transition-colors hover:border-emerald-500/30 group relative overflow-hidden perspective-1000 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start justify-between relative z-10 pointer-events-none">
        <div className="space-y-4 flex-1">
          <div className="space-y-0.5 mt-1">
            <p className="text-[6.5px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] italic leading-none">{title}</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tighter italic leading-none">{value}</h3>
              {trend && (
                <span className={`text-[7px] font-black uppercase tracking-widest italic flex items-center gap-0.5 leading-none ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </span>
              )}
            </div>
          </div>
          <p className="text-[6px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-40 line-clamp-1 mt-1 leading-none">
            {subtitle}
          </p>
        </div>
        
        <div 
          ref={iconRef}
          className={`w-6 h-6 flex items-center justify-center rounded-lg border shadow-inner ${colorClasses[color] || colorClasses.emerald}`}
        >
          {Icon && <Icon size={12} strokeWidth={3} />}
        </div>
      </div>

      {/* GSAP Gradient Shimmer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent pointer-events-none"
      />
    </motion.div>
  );
}
