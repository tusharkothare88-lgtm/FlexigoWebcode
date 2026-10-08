import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  ChevronDown, 
  Check, 
  X, 
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function OpsFilter({ 
  onFilterChange, 
  filters = [], 
  showDateRange = true,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [selectedRange, setSelectedRange] = useState('All Time');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [appliedFilters, setAppliedFilters] = useState({});
  const filterRef = useRef(null);

  const ranges = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Last Month',
    'All Time',
    'Custom Range'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onFilterChange({
      range: selectedRange === 'Custom Range' ? customRange : selectedRange,
      metrics: appliedFilters
    });
    setIsOpen(false);
  };

  const toggleMetric = (filterId, option) => {
    setAppliedFilters(prev => {
      const currentOptions = prev[filterId] || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      return { ...prev, [filterId]: newOptions };
    });
  };

  return (
    <div ref={filterRef} className={`relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl hover:border-emerald-500/30 transition-all shadow-sm group h-10"
      >
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
            {selectedRange === 'Custom Range' ? `${customRange.start || 'Start'} - ${customRange.end || 'End'}` : selectedRange}
          </span>
        </div>
        <ChevronDown size={13} className={`text-[var(--text-tertiary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-80 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden"
          >
            <div className="flex border-b border-[var(--border-subtle)]">
              <div className="flex-1 py-3 text-center text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5">Date Range</div>
            </div>
            <div className="p-5 max-h-[350px] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {ranges.map(range => (
                  <button key={range} onClick={() => setSelectedRange(range)} className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider text-left transition-all ${selectedRange === range ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}>{range}</button>
                ))}
                {selectedRange === 'Custom Range' && (
                  <div className="col-span-2 flex gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    <input 
                      type="date" 
                      onClick={(e) => e.target.showPicker?.()}
                      className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded p-1.5 text-[9px] text-[var(--text-primary)] w-full appearance-none outline-none focus:border-emerald-500/50" 
                      value={customRange.start} 
                      onChange={(e) => setCustomRange({...customRange, start: e.target.value})} 
                    />
                    <input 
                      type="date" 
                      onClick={(e) => e.target.showPicker?.()}
                      className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded p-1.5 text-[9px] text-[var(--text-primary)] w-full appearance-none outline-none focus:border-emerald-500/50" 
                      value={customRange.end} 
                      onChange={(e) => setCustomRange({...customRange, end: e.target.value})} 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)]/20 border-t border-[var(--border-subtle)] flex justify-between gap-3">
              <button onClick={() => {setSelectedRange('Last 7 Days'); setAppliedFilters({});}} className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Reset</button>
              <button onClick={handleApply} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Apply <ArrowRight size={10} strokeWidth={3} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
