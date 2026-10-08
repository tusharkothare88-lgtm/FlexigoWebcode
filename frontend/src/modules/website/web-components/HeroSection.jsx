import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Zap } from 'lucide-react';

import heroImage from '../../../assets/images/heroimg2.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-white pt-20 [will-change:transform] [transform:translateZ(0)]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        {/* Subtle neutral background effects */}
        <div className="absolute top-[-10%] right-[-2%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-slate-50 blur-[80px] md:blur-[120px]" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] overflow-hidden"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-10">
        {/* Text Content */}
        <motion.div
          className="w-full lg:flex-1 text-center lg:text-left pt-10 sm:pt-16 lg:pt-0"
        >
          <div className="max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-flexigo-accent animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Smart EV Subscription</span>
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] sm:text-4xl md:text-6xl lg:text-7xl font-black font-heading text-slate-900 leading-[1.2] mb-6 tracking-tighter"
          >
            Driving the Future <br className="sm:hidden" />
            of Smart Electric <span className="text-flexigo-teal italic">Mobility</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-slate-600 mb-10 max-w-[280px] sm:max-w-xl mx-auto lg:mx-0 font-body leading-relaxed"
          >
            Flexible EV subscriptions for delivery partners. Zero maintenance, unlimited swaps, and maximum earnings.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full max-w-[280px] sm:max-w-none mx-auto lg:mx-0"
          >
            {/* <button className="w-full sm:w-auto px-8 py-4 bg-flexigo-primary hover:bg-flexigo-teal text-white rounded-full font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-flexigo-primary/20">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-flexigo-primary border-2 border-slate-100 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 group">
              Explore Plans
              <ChevronRight className="w-5 h-5" />
            </button> */}
          </motion.div>
        </motion.div>

        {/* Visual Content - Real EV Scooter Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full relative"
        >
          <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
            {/* Clean white/neutral highlights instead of greenish glow */}
            <div className="absolute inset-0 bg-slate-100/30 rounded-full blur-[80px]" />

            <img
              src={heroImage}
              alt="Flexigo V1 Scooter"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width="600"
              height="600"
              className="relative z-10 w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {/* <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Scroll</span>
        <div className="w-[1px] h-8 bg-slate-400" />
      </motion.div> */}
    </section>
  );
};

export default HeroSection;
