import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Background with abstract graphic */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-tr from-flexigo-teal/20 via-flexigo-primary/5 to-flexigo-accent/20 rounded-[100%] blur-[100px] opacity-70" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-flexigo-primary rounded-[3rem] p-10 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Inner card graphical elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-flexigo-accent/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-flexigo-teal/30 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="mx-auto w-16 h-16 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md mb-8"
             >
               <Sparkles className="w-8 h-8 text-flexigo-accent" />
             </motion.div>

             <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight mb-6 tracking-tight">
               Start Riding with <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-flexigo-teal to-flexigo-accent">Flexigo Today</span>
             </h2>

             <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
               Join tens of thousands of riders across India who have upgraded their daily earnings 
               with our zero-maintenance, high-performance smart EV fleet.
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="https://play.google.com/store/apps/details?id=com.flexigo.rider"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-flexigo-teal hover:bg-flexigo-primary text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 group"
                >
                  Rider App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.flexigo.franchise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20 flex items-center justify-center gap-2 group"
                >
                  Franchise App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
