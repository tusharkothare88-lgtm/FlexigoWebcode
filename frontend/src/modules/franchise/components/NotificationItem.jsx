import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  Bell, 
  AlertTriangle, 
  Zap, 
  Info, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default function NotificationItem({ notification, onRead }) {
  const itemRef = useRef(null);
  const iconRef = useRef(null);

  const iconMap = {
    danger: <AlertTriangle className="text-rose-600" />,
    warning: <Info className="text-amber-600" />,
    info: <Zap className="text-blue-600" />,
    success: <CheckCircle2 className="text-emerald-600" />,
  };

  const bgMap = {
    danger: "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10",
    warning: "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10",
    info: "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10",
    success: "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10",
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    // Magnetic Icon Shift
    gsap.to(iconRef.current, {
      x: x * 10,
      y: y * 10,
      rotate: x * 5,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(iconRef.current, { x: 0, y: 0, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <motion.div
      ref={itemRef}
      layout
      initial={{ opacity: 0, x: -20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 6, scale: 1.005 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => onRead(notification._id || notification.id)}
      className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 group cursor-pointer shadow-sm relative z-10 ${bgMap[notification.severity] || 'bg-[var(--bg-secondary)]'} ${!notification.read ? 'ring-1 ring-emerald-500/30' : 'opacity-70'} perspective-1000`}
    >
      <div 
        ref={iconRef}
        className={`p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] group-hover:shadow-lg transition-transform duration-500 shadow-sm z-10`}
      >
        {iconMap[notification.severity] || <Bell className="text-gray-400" />}
      </div>
      
      <div className="flex-1 space-y-1 z-10 pointer-events-none">
        <div className="flex items-center justify-between">
           <h4 className={`text-sm font-bold tracking-tight text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors uppercase`}>{notification.title}</h4>
           <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] opacity-60">
              <Clock size={12} strokeWidth={2.5} />
              {notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
           </div>
        </div>
        <p className="text-[11px] font-medium text-[var(--text-secondary)] leading-relaxed line-clamp-2 uppercase tracking-wide">
          {notification.message}
        </p>
      </div>

      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-500 z-10">
         <ArrowRight size={16} className="text-emerald-600" />
      </div>

      {!notification.read && (
        <motion.div 
          layoutId={`notif-dot-${notification.id}`}
          className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
        />
      )}

      {/* GSAP Sticky Hover Underline Effect */}
      <motion.div 
        whileHover={{ opacity: 1, scaleX: 1 }}
        initial={{ opacity: 0, scaleX: 0 }}
        className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/20 origin-left"
      />
    </motion.div>
  );
}
