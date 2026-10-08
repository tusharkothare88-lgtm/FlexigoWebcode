import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import logo from '../../../assets/logo.png';

const PrivacyPolicyPage = () => {
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

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-flexigo-teal/10 rounded-xl flex items-center justify-center text-flexigo-teal shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-heading text-slate-800 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-400 text-xs mt-1">Last Updated: May 6, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>
              At FlexiGo E-Mobility Pvt. Ltd. (headquartered at ‘Krushna Avenue’, SR NO: 111/10/Baner, Pune City, Pune 411045), we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share information when you use our website, Rider App, Franchise Panel, and other smart e-mobility services.
            </p>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">1. Information We Collect</h2>
            <p>
              We collect information that you provide to us directly when registering for our EV subscription, applying for a franchise, or contacting our support team:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Details:</strong> Name, phone number, email address, physical address, and government-issued identification cards (Aadhaar, Driving License).</li>
              <li><strong>Telemetry &amp; Location Data:</strong> Real-time GPS location and trip history of your subscribed electric vehicle to support anti-theft, geofencing, and battery-swapping operations.</li>
              <li><strong>Payment Information:</strong> Financial transactions, billing addresses, wallet transfers, and subscription logs.</li>
            </ul>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">2. How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provision and manage your EV subscription and battery swaps.</li>
              <li>To secure our fleet of smart electric vehicles using real-time GPS tracking and anti-theft immobilization features.</li>
              <li>To facilitate seamless wallet refills and process weekly or monthly rental transactions.</li>
              <li>To improve our hardware efficiency, battery state-of-health tracking, and app design.</li>
            </ul>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">3. Data Security and Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with certified service providers (payment gateways, cloud hosting providers) to execute operational tasks, or when legally compelled by law enforcement authorities.
            </p>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">4. Your Rights and Choices</h2>
            <p>
              You have the right to request a copy of your personal data, object to specific telemetry processing, or ask us to delete or modify your account. Please reach out to our grievance officer at <strong>support@flexigoemobility.com</strong> to raise your request.
            </p>
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

export default PrivacyPolicyPage;
