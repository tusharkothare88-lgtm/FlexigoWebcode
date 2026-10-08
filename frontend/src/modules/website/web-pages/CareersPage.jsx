import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock, ChevronRight, Zap, Users, TrendingUp, Heart } from 'lucide-react';
import logo from '../../../assets/logo.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const openings = [
  {
    title: 'Field Operations Executive',
    department: 'Operations',
    location: 'Pune, Maharashtra',
    type: 'Full-Time',
    desc: 'Manage day-to-day fleet operations, rider onboarding, and service coordination across FlexiGo hubs in Pune.',
  },
  {
    title: 'Franchise Development Manager',
    department: 'Business Development',
    location: 'Pune / Remote',
    type: 'Full-Time',
    desc: 'Identify, onboard, and support FlexiGo franchise partners across new cities. Drive geographic expansion.',
  },
  {
    title: 'React Native Developer',
    department: 'Engineering',
    location: 'Remote / Pune',
    type: 'Full-Time',
    desc: 'Build and maintain the FlexiGo Rider App (React Native). Work on GPS tracking, wallet, and subscription flows.',
  },
  {
    title: 'Backend Engineer (Node.js)',
    department: 'Engineering',
    location: 'Remote / Pune',
    type: 'Full-Time',
    desc: 'Develop and scale our backend API platform powering the Rider App, Franchise Panel, and Admin Dashboard.',
  },
  {
    title: 'EV Service Technician',
    department: 'Technical',
    location: 'Pune, Maharashtra',
    type: 'Full-Time',
    desc: 'Perform preventive and corrective maintenance on FlexiGo electric scooters. Ensure 99% fleet uptime.',
  },
  {
    title: 'Customer Success Executive',
    department: 'Support',
    location: 'Pune, Maharashtra',
    type: 'Full-Time',
    desc: 'Resolve rider issues, manage subscription queries, and ensure an exceptional experience for all FlexiGo partners.',
  },
];

const perks = [
  { icon: <Zap className="w-5 h-5" />, title: 'Work on Real Impact', desc: 'Your work directly reduces carbon emissions and improves livelihoods across Indian cities.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Fast Growth', desc: "We're scaling rapidly — grow your career as the company grows." },
  { icon: <Heart className="w-5 h-5" />, title: 'Health Coverage', desc: 'Medical insurance for you and your family from day one.' },
  { icon: <Users className="w-5 h-5" />, title: 'Collaborative Culture', desc: 'Small team, high ownership. Your ideas ship to production.' },
];

const CareersPage = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="landing-page-theme min-h-screen bg-white font-body text-slate-800 antialiased">
      {/* Nav */}
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
      <section className="relative bg-flexigo-dark overflow-hidden py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-flexigo-primary via-flexigo-dark to-[#1C1C1C]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flexigo-teal/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-flexigo-teal font-bold uppercase tracking-[0.25em] text-xs mb-6">
            Careers at FlexiGo
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-heading text-white leading-[1.1] tracking-tighter mb-8"
          >
            Build the Future of
            <br />
            <span className="text-flexigo-teal italic">Green Mobility</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Join a fast-growing team building the technology and operations that power India's electric last-mile delivery revolution.
          </motion.p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary tracking-tighter">Why Work With Us</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center mb-4 group-hover:bg-flexigo-teal group-hover:text-white transition-all duration-300">
                  {p.icon}
                </div>
                <h3 className="font-bold font-heading text-slate-800 mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Open Positions</p>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary tracking-tighter">Current Openings</h2>
          </motion.div>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                className="border border-slate-100 rounded-2xl overflow-hidden hover:border-flexigo-teal/30 hover:shadow-lg transition-all duration-300"
              >
                <button
                  className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  onClick={() => setSelected(selected === i ? null : i)}
                >
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-flexigo-primary/5 text-flexigo-primary text-xs font-bold">{job.department}</span>
                      <span className="px-2.5 py-1 rounded-full bg-flexigo-teal/10 text-flexigo-teal text-xs font-bold">{job.type}</span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-slate-800">{job.title}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${selected === i ? 'rotate-90' : ''}`} />
                </button>
                {selected === i && (
                  <div className="px-6 pb-6 border-t border-slate-50">
                    <p className="text-slate-600 text-sm leading-relaxed mt-4 mb-6">{job.desc}</p>
                    <a
                      href="mailto:support@flexigoemobility.com?subject=Application for {job.title}"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-flexigo-primary text-white rounded-full text-sm font-bold hover:bg-flexigo-teal transition-colors duration-300"
                    >
                      Apply Now <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-16 p-8 bg-flexigo-primary/5 border border-flexigo-primary/10 rounded-2xl text-center">
            <Briefcase className="w-10 h-10 text-flexigo-teal mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-slate-800 mb-3">Don't see a fit?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-md mx-auto">
              We're always open to exceptional talent. Send your resume and tell us how you can help build FlexiGo.
            </p>
            <a
              href="mailto:support@flexigoemobility.com?subject=Open Application - FlexiGo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-flexigo-primary text-white rounded-full text-sm font-bold hover:bg-flexigo-teal transition-colors"
            >
              Send Open Application
            </a>
          </motion.div>
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

export default CareersPage;
