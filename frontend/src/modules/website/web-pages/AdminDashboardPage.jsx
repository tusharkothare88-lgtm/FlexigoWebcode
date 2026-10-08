import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, LogIn } from 'lucide-react';
import logo from '../../../assets/logo.png';

const AdminDashboardPage = () => {
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
          <Shield className="w-16 h-16 text-flexigo-teal mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4">
            FlexiGo <span className="text-flexigo-teal italic">Admin Portal</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Centralized ecosystem management, live fleet telemetry, wallet reconciliations, user approvals, and real-time operational auditing.
          </p>
          <div className="flex justify-center">
            <Link
              to="/admin/login"
              className="px-8 py-4 bg-flexigo-teal text-white rounded-full font-bold text-base hover:bg-flexigo-teal/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-flexigo-teal/20"
            >
              <LogIn className="w-5 h-5" /> Access Admin Panel
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black font-heading text-flexigo-primary text-center tracking-tighter mb-12">
            Complete Fleet Control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Live Tracking</h3>
              <p className="text-slate-500 text-sm">Real-time GPS coordinates, over-the-air immobilization triggers, and battery swap network diagnostic logs.</p>
            </div>
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Franchise Audits</h3>
              <p className="text-slate-500 text-sm">Audit franchise performance, swap counts, operational feedback, and commission distributions with precision.</p>
            </div>
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
              <h3 className="font-bold text-lg font-heading text-slate-800 mb-2">Financial Reconciliations</h3>
              <p className="text-slate-500 text-sm">Monitor all digital wallet top-ups, subscription packages, and direct payouts via a secure interface.</p>
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

export default AdminDashboardPage;
