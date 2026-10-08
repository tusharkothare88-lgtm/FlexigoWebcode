import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingContactButtons = () => {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col gap-3 md:gap-4 z-[9999]">
      <motion.a
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href="tel:+919922968093"
        className="w-12 h-12 flex items-center justify-center bg-flexigo-primary text-white rounded-full shadow-2xl hover:bg-flexigo-teal transition-colors group relative"
        aria-label="Call Now"
      >
        <div className="absolute -left-20 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Call Us
        </div>
        <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </motion.a>

      <motion.a
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/919684019619"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors group relative"
        aria-label="WhatsApp"
      >
        <div className="absolute -left-24 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          WhatsApp Us
        </div>
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </motion.a>
    </div>
  );
};

export default FloatingContactButtons;
