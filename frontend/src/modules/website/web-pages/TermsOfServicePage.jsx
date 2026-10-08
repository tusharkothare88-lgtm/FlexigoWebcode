import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import logo from '../../../assets/logo.png';

const TermsOfServicePage = () => {
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-heading text-slate-800 tracking-tight">Terms of Service</h1>
              <p className="text-slate-400 text-xs mt-1">Last Updated: May 6, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>
              Welcome to FlexiGo E-Mobility. These Terms of Service ("Terms") govern your access to and use of our electric scooter subscriptions, battery swapping stations, software applications, and web modules. By subscribing to our services, you agree to be bound by these Terms.
            </p>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">1. Subscription Eligibility and Registration</h2>
            <p>
              To subscribe to our EV services or operate a vehicle, you must satisfy the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years of age.</li>
              <li>Possess a valid Indian Driving License suitable for a gearless electric two-wheeler.</li>
              <li>Have a valid registered profile on our Rider App backed by approved government identification proofs.</li>
            </ul>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">2. Vehicle Usage and Ownership Rules</h2>
            <p>
              FlexiGo electric scooters are and remain the sole property of FlexiGo E-Mobility Pvt. Ltd. Your subscription grants you a non-transferable, revocable license to use the vehicle for commercial or lifestyle use. You agree:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Not to modify, alter, or damage any mechanical parts, body panels, or battery packs.</li>
              <li>To lock and secure the vehicle properly when unattended.</li>
              <li>To report any mechanical fault, battery anomaly, or physical damage immediately via the Rider App or WhatsApp support at +91 99229 68093.</li>
            </ul>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">3. Billing, Renewals, and Deposits</h2>
            <p>
              All rental subscription charges (daily, weekly, or monthly) are paid in advance through our integrated Rider Wallet. Subscriptions are automatically renewed if adequate wallet balance is maintained.
            </p>
            <p>
              Failure to renew your subscription may result in automatic GPS-based motor immobilization and a vehicle retrieval request by our field operations team.
            </p>

            <h2 className="text-xl font-bold font-heading text-slate-800 mt-8 mb-3">4. Limitation of Liability and Insurance</h2>
            <p>
              Every FlexiGo scooter is equipped with comprehensive vehicle third-party insurance. However, FlexiGo E-Mobility Pvt. Ltd. is not responsible for any traffic violations, fines, or accidents caused by rash or illegal riding habits.
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

export default TermsOfServicePage;
