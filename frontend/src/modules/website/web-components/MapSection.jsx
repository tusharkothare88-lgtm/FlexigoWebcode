import React from 'react';
import { motion } from 'framer-motion';
import maharashtraMap from '../../../assets/images/maharashtra_map.png';

const activeCities = [
  { name: 'Mumbai', top: '48%', left: '18%' },
  { name: 'Pune', top: '55%', left: '28%' },
  { name: 'Nagpur', top: '28%', left: '76%' },
  { name: 'Nashik', top: '32%', left: '30%' },
  { name: 'Aurangabad', top: '40%', left: '44%' },
  { name: 'Kolhapur', top: '55%', left: '34%' },
  { name: 'Solapur', top: '54%', left: '52%' },
];

const MapSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Content */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-flexigo-teal font-black uppercase tracking-[0.25em] text-[10px] mb-6"
            >
              Our Coverage
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black font-heading text-flexigo-primary leading-[1.1] mb-8 tracking-tighter"
            >
              Expanding Rapidly <br /> across India.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-500 leading-relaxed mb-12 font-medium"
            >
              From bustling metros to emerging tier-2 cities, Flexigo is building the
              densest EV infrastructure network in the country. Wherever you ride,
              we've got your back.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 gap-12"
            >
              <div className="border-l-4 border-flexigo-teal pl-6">
                <div className="text-4xl font-black font-heading text-flexigo-primary mb-1 tracking-tight">2</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Cities</div>
              </div>
              <div className="border-l-4 border-slate-100 pl-6">
                <div className="text-4xl font-black font-heading text-flexigo-primary mb-1 tracking-tight">10</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Swap Hubs</div>
              </div>
            </motion.div>
          </div>

          {/* Map Visualization */}
          <div className="relative w-full aspect-[4/5] md:aspect-square bg-slate-50/50 rounded-[3.5rem] border border-slate-100 flex items-center justify-center p-4 md:p-12 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.02)]">

            {/* Maharashtra Map Image Background */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                src={maharashtraMap}
                alt="Maharashtra Coverage"
                className="w-full h-full object-contain opacity-80 mix-blend-multiply transition-all duration-700 hover:scale-[1.02]"
              />

              {/* City Markers overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {activeCities.map((city, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4 + (index * 0.1),
                      type: "spring",
                      stiffness: 100
                    }}
                    className="absolute flex items-center justify-center group cursor-pointer pointer-events-auto"
                    style={{ top: city.top, left: city.left }}
                  >
                    <div className="relative">
                      <div className="absolute inset-[-12px] rounded-full bg-flexigo-teal/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 rounded-full bg-flexigo-teal animate-ping opacity-30" />
                      <div className="relative w-3.5 h-3.5 bg-flexigo-teal border-2 border-white rounded-full z-10 shadow-lg group-hover:scale-150 group-hover:bg-flexigo-primary transition-all duration-500" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 whitespace-nowrap bg-flexigo-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl pointer-events-none z-20">
                      {city.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-flexigo-primary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-white border border-slate-100 px-5 py-2.5 rounded-2xl shadow-xl shadow-slate-200/20 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-flexigo-teal animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">MH Priority Grid</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MapSection;
