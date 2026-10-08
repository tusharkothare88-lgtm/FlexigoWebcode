import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';

export default function UploadCard({ label, value, onUpload, className = "" }) {
  const isComplete = !!value;

  return (
    <div className={`space-y-2 flex-grow ${className}`}>
      <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest leading-none ml-1">
        {label}
      </label>
      
      <div 
        className={`relative h-32 rounded-xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-3 group group-hover:border-emerald-500/30 overflow-hidden ${
          isComplete ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10 hover:bg-[var(--bg-tertiary)]/20'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-2.5 px-6"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-500 shadow-sm relative overflow-hidden">
                 <Camera size={20} strokeWidth={1.5} />
                 <motion.div 
                   animate={{ 
                     opacity: [0, 0.4, 0],
                     y: [-20, 20]
                   }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
                 />
              </div>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] group-hover:text-emerald-600 transition-colors uppercase tracking-widest">Capture Frame</p>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 group-hover:brightness-75 transition-all duration-500"
            >
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                 <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="z-10 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                 <CheckCircle2 size={14} className="text-emerald-500" />
                 <span className="text-[9px] font-bold text-white uppercase tracking-widest">Asset Authenticated</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Absolute Input Capture */}
        <input 
          type="file" 
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onUpload(url);
            }
          }}
        />
        
        {isComplete && (
           <motion.button 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             onClick={(e) => {
               e.stopPropagation();
               onUpload(null);
             }}
             className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-rose-500 text-white rounded-md border border-white/10 z-30 transition-all shadow-lg active:scale-90"
           >
             <X size={12} strokeWidth={3} />
           </motion.button>
        )}
      </div>
    </div>
  );
}
