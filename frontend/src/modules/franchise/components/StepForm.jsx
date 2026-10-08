import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function StepForm({ 
  steps, 
  activeStep, 
  onNext, 
  onBack, 
  isFinalStep 
}) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-sm relative overflow-hidden">
      {/* Step Progress Header */}
      <div className="px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10">
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col gap-2 relative">
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: i <= activeStep ? 'rgba(16, 185, 129, 1)' : 'transparent',
                    borderColor: i <= activeStep ? 'rgba(16, 185, 129, 1)' : 'rgba(var(--border-subtle), 1)',
                    scale: i === activeStep ? 1.1 : 1
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform z-10 ${i < activeStep ? 'text-white' : i === activeStep ? 'text-white' : 'text-[var(--text-tertiary)]'}`}
                >
                  {i < activeStep ? <CheckCircle2 size={14} strokeWidth={3} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </motion.div>
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block transition-colors ${i <= activeStep ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-3 left-6 w-full h-0.5 bg-[var(--bg-tertiary)] -z-10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: i < activeStep ? '100%' : '0%' }}
                     className="h-full bg-emerald-500"
                   />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-full"
          >
            {steps[activeStep].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="px-8 py-5 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10 flex items-center justify-between">
        <motion.button 
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={activeStep === 0}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
        >
          <ChevronLeft size={16} /> Previous Node
        </motion.button>
        
        <motion.button 
          whileHover={{ x: 2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
            isFinalStep 
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20' 
            : 'bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-600/20'
          }`}
        >
          {isFinalStep ? 'Complete Protocol' : 'Next Protocol'} <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
