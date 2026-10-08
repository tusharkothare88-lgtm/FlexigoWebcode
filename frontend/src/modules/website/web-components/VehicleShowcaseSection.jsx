import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Battery, ShieldCheck, Zap } from 'lucide-react';
import heroImage from '../../../assets/images/flexigo_v1.png';

const VehicleShowcaseSection = () => {

  return (
    <section className="py-24 lg:py-32 bg-flexigo-dark text-white relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-[-50%] h-[300px] bg-flexigo-teal/20 blur-[150px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-flexigo-teal font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center gap-3"
          >
            <div className="w-12 h-[1px] bg-flexigo-teal/30" />
            <Zap className="w-4 h-4 fill-flexigo-teal" /> The Machines
            <div className="w-12 h-[1px] bg-flexigo-teal/30" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black font-heading leading-[1.1] tracking-tighter text-white px-2"
          >
            Engineering Meets <br />
            Pure <span className="text-flexigo-teal italic">Performance.</span>
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-6xl mx-auto rounded-[2rem] md:rounded-[4rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-6 md:p-12 lg:p-20 backdrop-blur-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] [transform:translateZ(0)]"
        >
          {/* Glass glare effect */}
          <div className="absolute top-0 left-[-100%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-flexigo-teal/5 to-transparent rotate-[35deg] pointer-events-none group-hover:left-[200%] transition-all duration-[3000ms]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Visual Side */}
            <div className="lg:col-span-7 relative flex justify-center items-center py-10 lg:py-0">
              
              {/* Massive Multi-Layer Pedestal Glow */}
              <div className="absolute bottom-10 w-full h-24 bg-flexigo-teal/20 blur-[60px] md:blur-[100px] rounded-[100%] animate-pulse" />
              
              {/* Scooter Showcase */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center">
                <div className="relative group/scooter p-4 md:p-10">
                  {/* Digital Aura Rings */}
                  <div className="absolute inset-0 bg-flexigo-teal/5 rounded-full blur-[80px] md:blur-[120px] scale-150 opacity-40" />
                  
                  <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="relative"
                  >
                    <img 
                      src={heroImage} 
                      alt="Flexigo V1 Scooter" 
                      width="500"
                      height="500"
                      className="w-full h-auto max-w-[260px] md:max-w-[500px] object-contain transition-transform duration-1000 group-hover/scooter:scale-[1.05] drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                    />
                    
                    {/* High-Tech Scanline */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-flexigo-teal/50 to-transparent z-20 pointer-events-none opacity-0 group-hover/scooter:opacity-100 transition-opacity"
                    />
                  </motion.div>
                  
                  {/* Floating Specs Tag */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="absolute top-[10%] -right-2 lg:-right-12 bg-flexigo-teal text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-[0_10px_30px_rgba(249,115,22,0.4)] rotate-12 flex items-center gap-2 z-30"
                  >
                    <Zap className="w-3 h-3 fill-white" />
                    120km Range
                  </motion.div>
                </div>

                <div className="mt-16 text-center">
                  <div className="text-[10px] font-black tracking-[0.3em] md:tracking-[0.6em] text-slate-600 uppercase mb-3">Serial No. F-V1-2024</div>
                  <div className="text-5xl font-black tracking-tighter text-white italic bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                    FLEXIGO V1
                  </div>
                </div>
              </div>
            </div>

            {/* Specs / Analytics Side */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-black/60 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-flexigo-teal/40 transition-colors duration-500 group/card relative overflow-hidden"
              >
                {/* Internal Card Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-flexigo-teal/10 rounded-full blur-[60px]" />
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-flexigo-teal/10 border border-flexigo-teal/20 flex items-center justify-center text-flexigo-teal group-hover/card:scale-110 group-hover/card:bg-flexigo-teal group-hover/card:text-white transition-all duration-500 shadow-neon-sm">
                    <Battery className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xl text-white tracking-tight">Power Systems</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Thermal Mgmt</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-wider">
                       <span className="text-slate-400">Current Battery State</span>
                       <span className="text-flexigo-teal">98% Nominal</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-[2px]">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: '98%' }}
                         transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                         className="h-full bg-gradient-to-r from-flexigo-teal to-flexigo-accent rounded-full relative"
                       >
                         <motion.div 
                           animate={{ left: ['-100%', '100%'] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           className="absolute inset-0 bg-white/30 skew-x-12 blur-sm"
                         />
                       </motion.div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Li-ion phosphate cells (LFP) engineered for 3000+ cycles. Integrated IoT for real-time health telemetry.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-3xl hover:border-flexigo-teal/20 transition-colors duration-500">
                   <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Max Velocity</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-3xl font-black font-heading text-white">45</span>
                     <span className="text-xs font-bold text-slate-400 uppercase">km/h</span>
                   </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-3xl hover:border-flexigo-accent/20 transition-colors duration-500">
                   <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Refuel Time</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-3xl font-black font-heading text-white">60</span>
                     <span className="text-xs font-bold text-slate-400 uppercase">sec</span>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 bg-flexigo-teal/5 border border-flexigo-teal/10 rounded-3xl p-6 backdrop-blur-sm group/ip"
              >
                 <div className="w-14 h-14 rounded-2xl bg-flexigo-teal/10 flex items-center justify-center text-flexigo-teal group-hover/ip:bg-flexigo-teal group-hover/ip:text-white transition-all duration-500">
                   <ShieldCheck className="w-7 h-7" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Protection Class</p>
                    <span className="text-sm font-bold text-white tracking-tight">IP67 Water & Dust Resistance Rating</span>
                 </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Technical Specs Summary Bar */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {['250kg Payload', 'Dual Hub Motor', 'ABS Braking', 'Live GPS Tracking'].map((spec) => (
             <div key={spec} className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-flexigo-teal" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{spec}</span>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default VehicleShowcaseSection;
