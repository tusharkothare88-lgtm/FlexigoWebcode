import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Mail, ExternalLink, Newspaper, Mic } from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../lib/axios';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const pressReleases = [
  {
    date: 'May 2026',
    tag: 'Platform Launch',
    title: 'FlexiGo Launches Full Tech Platform — Rider App, Franchise Panel & Admin Dashboard',
    excerpt: 'FlexiGo E-Mobility announces the full launch of its integrated technology platform, enabling real-time fleet management, digital wallet payments, and franchise operations across its growing network.',
  },
  {
    date: 'May 2026',
    tag: 'Expansion',
    title: 'FlexiGo Expands Franchise Network, Targets 5 New Cities in 2025',
    excerpt: "Following its successful Pune operations, FlexiGo announces the launch of its franchise model enabling local entrepreneurs to operate EV hubs under the FlexiGo brand.",
  },
  {
    date: 'May 2026',
    tag: 'Milestone',
    title: 'FlexiGo Crosses 200 Active Riders and 200 Deployed Vehicles',
    excerpt: 'In less than 18 months since launch, FlexiGo E-Mobility has deployed over 200 smart electric scooters with 200+ active delivery partner subscriptions in Pune.',
  },
];

const mediaAssets = [
  { title: 'FlexiGo Logo Pack', desc: 'PNG, SVG, and dark/light variants for editorial use.', icon: <Download className="w-5 h-5" /> },
  { title: 'Brand Guidelines', desc: 'Official color palette, typography, and brand standards.', icon: <Download className="w-5 h-5" /> },
  { title: 'Product Screenshots', desc: 'High-res screenshots of Rider App, Franchise Panel, and Dashboard.', icon: <Download className="w-5 h-5" /> },
];

const PressMediaPage = () => {
  const [liveReleases, setLiveReleases] = useState([]);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await api.get('/admin/web/press');
        if (res.data.success && res.data.releases.length > 0) {
          // Only show published ones on public site
          setLiveReleases(res.data.releases.filter(r => r.published));
        }
      } catch (err) {
        console.error("Failed to fetch press releases:", err);
      }
    };
    fetchReleases();
  }, []);

  const displayReleases = liveReleases.length > 0 ? liveReleases : pressReleases;

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
      <section className="relative bg-flexigo-dark overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-flexigo-primary via-flexigo-dark to-[#1C1C1C]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flexigo-teal/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-flexigo-teal font-bold uppercase tracking-[0.25em] text-xs mb-6">
            Newsroom
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-heading text-white leading-[1.1] tracking-tighter mb-8"
          >
            Press &amp; <span className="text-flexigo-teal italic">Media</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            The latest news, announcements, and milestones from FlexiGo E-Mobility.
          </motion.p>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Latest News</p>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary tracking-tighter">Press Releases</h2>
          </motion.div>
          <div className="space-y-6">
            {displayReleases.map((pr, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="p-6 border border-slate-100 rounded-2xl hover:border-flexigo-teal/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pr.date}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-flexigo-teal/10 text-flexigo-teal text-xs font-bold">{pr.tag}</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800 mb-3 group-hover:text-flexigo-primary transition-colors">{pr.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{pr.excerpt}</p>
                {pr.link ? (
                  <a href={pr.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-flexigo-teal text-sm font-bold hover:gap-2 transition-all">
                    Read More <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button className="flex items-center gap-1 text-flexigo-teal text-sm font-bold hover:gap-2 transition-all">
                    Read More <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Resources</p>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-flexigo-primary tracking-tighter mb-4">Media Kit</h2>
            <p className="text-slate-500 max-w-xl">Download official FlexiGo brand assets for editorial use.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {mediaAssets.map((asset, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06 }}
                className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-flexigo-teal/30 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0 group-hover:bg-flexigo-teal group-hover:text-white transition-all">
                  {asset.icon}
                </div>
                <div>
                  <h3 className="font-bold font-heading text-slate-800 mb-1">{asset.title}</h3>
                  <p className="text-slate-500 text-xs">{asset.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <Mic className="w-10 h-10 text-flexigo-teal mx-auto mb-4" />
            <h2 className="text-3xl font-black font-heading text-flexigo-primary tracking-tighter mb-4">Media Contact</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              For interviews, speaking requests, or media inquiries, reach out to our communications team.
            </p>
            <a
              href="mailto:support@flexigoemobility.com?subject=Media Inquiry"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-flexigo-primary text-white rounded-full font-bold hover:bg-flexigo-teal transition-colors"
            >
              <Mail className="w-4 h-4" /> support@flexigoemobility.com
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

export default PressMediaPage;
