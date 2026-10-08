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
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');
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
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2 pr-2 border-r border-white/5">
          <Calendar size={10} className="text-emerald-500" />
          <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-white italic">
            {selectedRange === 'Custom Range' ? 'CUSTOM_WINDOW' : selectedRange.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 pl-0.5">
          <Filter size={10} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
          <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-slate-500 italic">FILTERS</span>
          {Object.keys(appliedFilters).length > 0 && (
            <div className="w-1.5 h-1.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          )}
        </div>
        <ChevronDown size={10} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute top-full right-0 mt-2 w-72 bg-black/40 border border-white/5 rounded-2xl shadow-2xl z-[100] overflow-hidden shadow-black/40"
          >
            <div className="flex border-b border-white/5 bg-black/20/10">
              {['date', 'metrics'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[7.5px] font-black uppercase tracking-[0.2em] transition-all italic ${
                    activeTab === tab ? 'text-emerald-500 border-b border-emerald-500 bg-emerald-500/5' : 'text-slate-500'
                  }`}
                >
                  {tab === 'date' ? 'TIME_WINDOW' : 'METRIC_LAYERS'}
                </button>
              ))}
            </div>

            <div className="p-4 max-h-[320px] overflow-y-auto no-scrollbar">
              {activeTab === 'date' ? (
                <div className="grid grid-cols-2 gap-1.5">
                   {ranges.map(range => (
                     <button 
                       key={range}
                       onClick={() => setSelectedRange(range)}
                       className={`px-3 py-1.5 rounded-lg text-[7.5px] font-black uppercase tracking-widest text-left transition-all italic ${
                         selectedRange === range ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' : 'bg-black/20 text-slate-500 hover:text-white border border-white/5 shadow-inner'
                       }`}
                     >
                       {range}
                     </button>
                   ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filters.map(filter => (
                    <div key={filter.id} className="space-y-2">
                      <h4 className="text-[7.5px] font-black text-emerald-500/60 uppercase tracking-[0.3em] italic leading-none">{filter.label}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {filter.options.map(option => {
                          const isSelected = appliedFilters[filter.id]?.includes(option);
                          return (
                            <button 
                              key={option}
                              onClick={() => toggleMetric(filter.id, option)}
                              className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all italic ${
                                isSelected 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                                : 'bg-black/20 border-white/5 text-slate-500 shadow-inner'
                              }`}
                            >
                              {isSelected && <Check size={8} strokeWidth={4} />}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-black/20 border-t border-white/5 flex items-center justify-between gap-3 shadow-inner">
              <button 
                onClick={() => {
                  setSelectedRange('Last 7 Days');
                  setAppliedFilters({});
                  setCustomRange({ start: '', end: '' });
                }}
                className="text-[7px] font-black text-slate-600 uppercase tracking-widest hover:text-rose-500 transition-colors italic"
              >
                RESET_ALL
              </button>
              <button 
                onClick={handleApply}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 italic"
              >
                APPLY_PROFILE <ArrowRight size={10} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
