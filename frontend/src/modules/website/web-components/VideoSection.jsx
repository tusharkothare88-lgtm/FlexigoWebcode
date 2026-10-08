import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import projectVideo from '../../../assets/Clean_brand-focused_ending(flexigo)._202604081303.mp4';

const VideoSection = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    let observer;
    const loadVideo = () => {
      setVideoSrc(projectVideo);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadVideo();
            observer.disconnect();
          }
        });
      }, { rootMargin: '200px' });

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    } else {
      if (document.readyState === 'complete') {
        loadVideo();
      } else {
        const handleLoad = () => loadVideo();
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(error => {
        console.log("Autoplay was prevented:", error);
      });
    }
  }, [videoSrc]);

  return (
    <section ref={sectionRef} className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black flex items-center justify-center">

      {/* Edge-to-Edge Background Video (Project Source) */}
      <div className="absolute inset-0 w-full h-full">
        {videoSrc ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src={videoSrc}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* Tactical Dark Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        <div className="absolute inset-0 bg-flexigo-teal/5 mix-blend-overlay z-10" />

        {/* Cinematic Scanline Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      {/* Floating Tactical Content */}
      <div className="container mx-auto px-6 relative z-20">
         <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-6"
            >
               <div className="w-16 h-[2px] bg-flexigo-teal/60" />
               <span className="text-flexigo-teal font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-neon-sm">
                  System Active • Real-Time Demo
               </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-8xl font-black font-heading text-white tracking-tighter leading-[0.95] mb-8"
            >
              Powering the <br />
              <span className="text-flexigo-teal italic">State of Motion.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-12 mt-12 border-t border-white/10 pt-12"
            >
               <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Efficiency Rating</span>
                  <span className="text-3xl font-black font-heading text-white">99.8%</span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Network Uptime</span>
                  <span className="text-3xl font-black font-heading text-white">99.9%</span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hub Density</span>
                  <span className="text-3xl font-black font-heading text-white">MAX</span>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Decorative Technical UI Frame */}
      <div className="absolute top-10 right-10 z-20 flex flex-col gap-1 text-right pointer-events-none opacity-40 md:opacity-100">
         <div className="text-[10px] font-black tracking-widest text-white uppercase mb-1">Telemetry Module</div>
         <div className="w-32 h-1 bg-flexigo-teal shadow-neon-sm ml-auto" />
         <div className="text-[8px] font-mono text-slate-400">STATE: ENERGIZED</div>
      </div>

      {/* Animated Bottom Scan line */}
      <motion.div
         animate={{ opacity: [0.2, 0.5, 0.2] }}
         transition={{ duration: 3, repeat: Infinity }}
         className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-flexigo-teal/20 to-transparent z-10"
      />
    </section>
  );
};

export default VideoSection;
