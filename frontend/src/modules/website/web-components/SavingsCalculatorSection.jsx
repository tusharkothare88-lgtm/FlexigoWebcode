import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { ChevronDown, Wallet, Zap, Fuel, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

const SmoothCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const count = useMotionValue(value);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return controls.stop;
  }, [value, count]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const SavingsCalculatorSection = () => {
  const [dailyEarnings, setDailyEarnings] = useState(1000);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [period, setPeriod] = useState({ label: 'Monthly', days: 26 });

  const periods = [
    { label: 'Monthly', days: 26 },
    { label: 'Weekly', days: 6 },
  ];

  // Pure Flexigo Saving Logic (No Comparison)
  const fuelSaving = Math.round(143 * period.days * (dailyEarnings / 1000));
  const maintSaving = Math.round(28 * period.days * (dailyEarnings / 1000));
  const totalSavings = fuelSaving + maintSaving;
  
  const handleSliderChange = (e) => {
    setDailyEarnings(parseInt(e.target.value));
  };

  return (
    <section className="py-24 bg-white overflow-hidden" id="savings-calculator">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Side: Compact Controls */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tighter mb-2">
               Keep More <span className="text-flexigo-teal italic">Profit.</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 mb-8 text-flexigo-primary font-bold text-xs uppercase tracking-widest">
               <span className="flex items-center gap-1.5 bg-flexigo-teal text-white px-2.5 py-1 rounded-lg shadow-lg shadow-flexigo-teal/20">
                 <Zap className="w-3.5 h-3.5" /> Switch to EV
               </span>
               <span className="text-slate-300 hidden sm:inline">|</span>
               <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-100">
                    <Fuel className="w-3.5 h-3.5" /> Zero Fuel
                  </span>
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Low Maintenance
                  </span>
               </div>
            </div>
            <p className="text-slate-500 mb-12 font-medium">Slide to calculate your extra take-home pay.</p>

            <div className="space-y-12 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               {/* Period Toggle */}
               <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
                  {periods.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        period.label === p.label ? "bg-flexigo-teal text-white shadow-lg shadow-flexigo-teal/20" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
               </div>

               {/* Earnings Input */}
               <div className="relative">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Daily Revenue</span>
                    <span className="text-4xl font-black font-heading text-slate-900 tracking-tighter">₹<SmoothCounter value={dailyEarnings} /></span>
                  </div>
                  
                  {/* Highly Reactive Tactile Slider */}
                  <div className="relative h-1 w-full bg-slate-200 rounded-full cursor-pointer flex items-center group/slider">
                    <motion.div className="absolute left-0 h-full bg-flexigo-teal rounded-full" style={{ width: `${(dailyEarnings / 3000) * 100}%` }} />
                    <input 
                      type="range"
                      min="0"
                      max="3000"
                      step="10"
                      value={dailyEarnings}
                      onChange={handleSliderChange}
                      className="absolute inset-x-0 w-full h-12 opacity-0 cursor-pointer z-20"
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-[6px] border-flexigo-primary rounded-full shadow-[0_10px_40px_rgba(249,115,22,0.4)] pointer-events-none z-30 group-hover/slider:scale-110 transition-transform"
                      style={{ left: `calc(${(dailyEarnings / 3000) * 100}% - 20px)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">
                    <span>Low Revenue</span>
                    <span>High Revenue</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Side: Graphic Visual (Donut/Gauge Style) */}
          <div className="lg:w-1/2 w-full flex flex-col items-center overflow-hidden">
             <div className="relative w-full max-w-[280px] sm:max-w-[420px] aspect-square flex items-center justify-center">
                
                {/* Outer Glow Circle */}
                <div className="absolute inset-0 border border-flexigo-primary/10 rounded-full animate-[pulse_4s_infinite]" />
                <div className="absolute inset-10 border border-flexigo-primary/5 rounded-full" />

                {/* Animated Savings Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-slate-50" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                  <motion.circle
                     className="text-flexigo-primary"
                     strokeWidth="6"
                     strokeDasharray="264"
                     animate={{ strokeDashoffset: 264 - (264 * (totalSavings / 15000)) }}
                     strokeDashoffset="264"
                     strokeLinecap="round"
                     stroke="currentColor"
                     fill="transparent"
                     r="42"
                     cx="50"
                     cy="50"
                     style={{ filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.4))' }}
                  />
                </svg>

                {/* Central Payout HUD */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 transition-transform hover:scale-110 hover:shadow-neon duration-500 cursor-help">
                      <Wallet className="w-5 h-5 text-flexigo-primary" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Extra Profit</p>
                   <div className="text-5xl md:text-6xl font-black font-heading text-slate-900 tracking-tighter mb-1">
                      ₹<SmoothCounter value={totalSavings} />
                   </div>
                   <p className="text-sm font-bold text-flexigo-primary uppercase tracking-widest">{period.label} Overview</p>
                </div>

                {/* Satellite Feature Cards */}
                <motion.div 
                   initial={{ x: 20, opacity: 0 }}
                   whileInView={{ x: 0, opacity: 1 }}
                   className="absolute top-0 right-0 sm:-top-4 sm:-right-4 bg-white border border-slate-100 shadow-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center gap-3 backdrop-blur-sm z-20"
                >
                   <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                      <Fuel className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Petrol Eliminated</p>
                      <p className="text-xs font-black text-slate-800">₹<SmoothCounter value={fuelSaving} /></p>
                   </div>
                </motion.div>
 
                <motion.div 
                   initial={{ x: -20, opacity: 0 }}
                   whileInView={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.1 }}
                   className="absolute bottom-0 left-0 sm:-bottom-4 sm:-left-4 bg-white border border-slate-100 shadow-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center gap-3 backdrop-blur-sm z-20"
                >
                   <div className="w-8 h-8 rounded-xl bg-flexigo-primary/10 flex items-center justify-center text-flexigo-primary">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Maintenance Cut</p>
                      <p className="text-xs font-black text-slate-800">₹<SmoothCounter value={maintSaving} /></p>
                   </div>
                </motion.div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SavingsCalculatorSection;
