import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BatteryCharging, Shield, Zap, ShieldAlert, CheckCircle, Package } from 'lucide-react';
import logo from '../../../assets/logo.png';
import scooterImg from '../../../assets/images/heroimg2.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const VehicleCatalogPage = () => {
  return (
    <div className="landing-page-theme min-h-screen bg-white font-body text-slate-800 antialiased">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-flexigo-teal transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-slate-200">|</span>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="FlexiGo" className="w-10 h-10 object-contain" />
            <span className="font-heading font-black text-flexigo-primary uppercase tracking-tighter text-lg">
              Flex<span className="text-flexigo-teal">igo E-Mobility</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-flexigo-dark overflow-hidden py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-flexigo-primary to-flexigo-dark opacity-95" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-flexigo-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Fleet</p>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4">
            Built for Heavy Deliveries, <span className="text-flexigo-teal italic">Engineered for Cities</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the technology and robust design behind India's premier commercial electric scooters.
          </p>
        </div>
      </section>

      {/* Highlight Details */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Col - Scooter Image */}
            <motion.div {...fadeUp} className="relative flex justify-center">
              <div className="absolute inset-0 bg-slate-50 rounded-full blur-3xl" />
              <img
                src={scooterImg}
                alt="FlexiGo V1 Smart EV"
                className="relative z-10 w-full max-w-[450px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
              />
            </motion.div>

            {/* Right Col - Specs */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="space-y-8">
              <div>
                <span className="px-3 py-1 bg-flexigo-teal/10 text-flexigo-teal text-xs font-bold rounded-full uppercase tracking-wider">Active Fleet Class</span>
                <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary mt-3 mb-4">FlexiGo V1 Smart EV</h2>
                <p className="text-slate-600 leading-relaxed">
                  The ultimate last-mile workhorse. Engineered to withstand heavy loads, rough roads, and back-to-back delivery schedules while keeping the rider safe and comfortable.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <Zap className="w-5 h-5 text-flexigo-teal mb-2" />
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Top Speed</div>
                  <div className="text-xl font-black font-heading text-slate-800">45 km/h</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <BatteryCharging className="w-5 h-5 text-flexigo-teal mb-2" />
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">True Range</div>
                  <div className="text-xl font-black font-heading text-slate-800">85+ km / swap</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <Package className="w-5 h-5 text-flexigo-teal mb-2" />
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Payload Capacity</div>
                  <div className="text-xl font-black font-heading text-slate-800">150 kg</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <Shield className="w-5 h-5 text-flexigo-teal mb-2" />
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anti-Theft</div>
                  <div className="text-xl font-black font-heading text-slate-800">Built-in GPS Lock</div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-flexigo-teal" />
                  Dual disc brakes with regenerative electronic braking
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-flexigo-teal" />
                  Reinforced dual rear shock absorbers for courier load carriers
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-flexigo-teal" />
                  IP67 waterproof rated electric motor and swappable battery slot
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <div className="bg-flexigo-dark border-t border-white/5 py-8 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Flexigo E-Mobility Pvt. Ltd. All rights reserved.</p>
        <div className="flex gap-6 justify-center mt-3 text-sm">
          <Link to="/privacy-policy" className="text-slate-500 hover:text-flexigo-teal transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-slate-500 hover:text-flexigo-teal transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCatalogPage;
