import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Network, LogIn, ArrowRight } from 'lucide-react';
import logo from '../../../assets/logo.png';

const FranchisePanelPage = () => {
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
      <section className="relative bg-flexigo-dark overflow-hidden py-24 lg:py-32 text-white text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-flexigo-primary to-flexigo-dark opacity-95" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-flexigo-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <Network className="w-16 h-16 text-flexigo-teal mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4">
            FlexiGo <span className="text-flexigo-teal italic">Franchise Network</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Become a local logistics entrepreneur. Host a FlexiGo battery swap and maintenance hub and tap into a recurring revenue stream.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link
              to="/franchise/login"
              className="px-8 py-4 bg-flexigo-teal text-white rounded-full font-bold text-base hover:bg-flexigo-teal/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-flexigo-teal/20"
            >
              <LogIn className="w-5 h-5" /> Open Franchise Panel
            </Link> */}
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Apply for Franchise <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Network Perks */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black font-heading text-flexigo-primary text-center tracking-tighter mb-12">
            Grow Your Business With FlexiGo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Recurring Income</h3>
              <p className="text-slate-500 text-sm">Earn commissions on every battery swap and maintenance check conducted at your registered hub.</p>
            </div>
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Operational Dashboard</h3>
              <p className="text-slate-500 text-sm">Manage riders, verify documentation, inspect vehicle fleets, and review payouts seamlessly inside the Franchise Panel.</p>
            </div>
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Training & Support</h3>
              <p className="text-slate-500 text-sm">We provide comprehensive technical training, official tools, marketing collateral, and continuous brand support.</p>
            </div>
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

export default FranchisePanelPage;
