import { motion, AnimatePresence } from 'framer-motion';

export default function StatusBadge({ status, className = "" }) {
  const isHealthy = status === 'active' || status === 'delivered' || status === 'completed';
  const isWarning = status === 'paused' || status === 'pending' || status === 'warning';
  const isDanger = status === 'emergency' || status === 'failed' || status === 'quarantine' || status === 'maintenance';

  const styles = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    warning: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    emergency: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    failed: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    quarantine: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    maintenance: "bg-rose-500/10 text-violet-600 border-violet-500/20",
  };

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.9, y: 2 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap ${styles[status] || 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'} ${className}`}
    >
      <motion.div 
        animate={{ 
          scale: (isHealthy || isWarning || isDanger) ? [1, 1.3, 1] : 1,
          opacity: (isHealthy || isWarning || isDanger) ? [1, 0.4, 1] : 1
        }}
        transition={{ 
          repeat: Infinity, 
          duration: isDanger ? 1 : isWarning ? 2 : 3,
          ease: "easeInOut"
        }}
        className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : isWarning ? 'bg-amber-500' : isDanger ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-[var(--text-tertiary)]'}`} 
      />
      {status}
    </motion.div>
  );
}
