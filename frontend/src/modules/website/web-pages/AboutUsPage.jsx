import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Heart, Users, MapPin, Mail, Leaf, Shield, TrendingUp, Award, Calendar } from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../lib/axios';

const iconMap = {
  Zap: <Zap className="w-6 h-6" />,
  Leaf: <Leaf className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const values = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Smart Mobility',
    desc: 'We believe the future of urban transport is electric, connected, and subscription-first. Our platform makes EV adoption effortless for delivery partners.',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Zero Emissions',
    desc: 'Every scooter we deploy replaces a petrol vehicle. Our mission is to slash last-mile delivery emissions across Indian cities, one ride at a time.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Zero Maintenance',
    desc: 'Riders never touch a toolkit. Servicing, insurance, and wear-and-tear are entirely our responsibility — freeing partners to focus purely on earning.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Partner Earnings First',
    desc: 'Our subscription model is built so delivery partners maximise net take-home. Lower EMIs than ownership, with no asset risk.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Franchise Ecosystem',
    desc: 'We empower local entrepreneurs to run FlexiGo hubs — creating jobs and building a decentralised, resilient fleet management network.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Technology Driven',
    desc: 'From real-time GPS tracking to digital wallets and predictive maintenance, our tech stack turns scooters into smart connected assets.',
  },
];

const milestones = [
  { year: '2026', title: 'Founded in Pune', desc: 'FlexiGo E-Mobility was incorporated in Baner, Pune with a vision to democratise EV access for delivery professionals.' },
  { year: '2026', title: 'First Fleet Deployed', desc: 'Our first batch of 50 smart e-scooters hit the roads in Pune, partnering with leading delivery aggregators.' },
  { year: '2026', title: '200+ Vehicles & Riders', desc: 'Rapid growth to 200+ active vehicles and 200+ registered riders across 2 cities — Pune and beyond.' },
  { year: '2026', title: 'Franchise Network Launch', desc: 'Launched our franchise model, enabling local operators to manage FlexiGo hubs and grow with us.' },
  { year: 'May 2026', title: 'Full Tech Platform', desc: 'Released our complete platform — Rider App, Franchise Panel, and Admin Dashboard — making fleet ops fully digital.' },
];

const AboutUsPage = () => {
  const [liveAbout, setLiveAbout] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get('/admin/web/about');
        if (res.data.success && res.data.about) {
          setLiveAbout(res.data.about);
        }
      } catch (err) {
        console.error("Failed to fetch about info:", err);
      }
    };
    fetchAbout();
  }, []);

  const displayMission = liveAbout?.mission || "To make electric vehicles accessible to every delivery professional in India through flexible, affordable subscription plans backed by world-class service.";
  const displayVision = liveAbout?.vision || "A zero-emission last-mile delivery ecosystem across India, powered by a tech-enabled franchise network that creates livelihood for thousands.";
  const displayStats = liveAbout?.stats || { activeRiders: '200+', vehiclesDeployed: '200+', cities: '2' };
  const displayValues = liveAbout?.values?.length > 0 ? liveAbout.values : values;
  const displayMilestones = liveAbout?.milestones?.length > 0 ? liveAbout.milestones : milestones;

  return (
    <div className="landing-page-theme min-h-screen bg-white font-body text-slate-800 antialiased">
      {/* Nav Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-flexigo-teal transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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
      <section className="relative bg-flexigo-dark overflow-hidden py-28 lg:py-40">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1A2A6B_0%,#052E16_60%,#1C1C1C_100%)] opacity-90" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-flexigo-teal/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-flexigo-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-flexigo-teal font-bold uppercase tracking-[0.25em] text-xs mb-6"
          >
            {liveAbout?.heroTag || "Our Story"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black font-heading text-white leading-[1.1] tracking-tighter mb-8"
          >
            {liveAbout?.heroTitle ? (
               <>
                 {liveAbout.heroTitle.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                       {line}
                       <br />
                    </React.Fragment>
                 ))}
               </>
            ) : (
              <>
                Powering India's
                <br />
                <span className="text-flexigo-teal italic">Last-Mile Revolution</span>
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            {liveAbout?.heroDescription || "FlexiGo E-Mobility is a Pune-based EV subscription platform built for delivery professionals. We provide smart, zero-maintenance electric scooters through flexible plans — so partners earn more, spend less, and ride green."}
          </motion.p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
              <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">{liveAbout?.whoWeAreTag || "Who We Are"}</p>
              <h2 className="text-4xl md:text-5xl font-black font-heading text-flexigo-primary leading-[1.15] tracking-tighter mb-6 whitespace-pre-line">
                {liveAbout?.whoWeAreTitle || "Redefining How Delivery\nPartners Own Their Ride"}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {liveAbout?.whoWeAreDescription1 || "Founded in 2026 and headquartered at Krushna Avenue, Baner, Pune, FlexiGo E-Mobility was born out of a simple observation: delivery partners were trapped paying high EMIs on depreciating petrol bikes while bearing all the risk of ownership."}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {liveAbout?.whoWeAreDescription2 || "We flipped the model. With FlexiGo, partners subscribe to a smart EV — we handle everything from servicing and insurance to battery swaps and GPS tracking. Partners focus on earning; we handle the rest."}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 bg-flexigo-primary/5 border border-flexigo-primary/10 rounded-xl text-center">
                  <div className="text-2xl font-black font-heading text-flexigo-primary">{displayStats.activeRiders}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Active Riders</div>
                </div>
                <div className="px-5 py-3 bg-flexigo-teal/5 border border-flexigo-teal/10 rounded-xl text-center">
                  <div className="text-2xl font-black font-heading text-flexigo-teal">{displayStats.vehiclesDeployed}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Vehicles Deployed</div>
                </div>
                <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <div className="text-2xl font-black font-heading text-slate-700">{displayStats.cities}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Cities & Growing</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-flexigo-primary to-flexigo-primary/80 text-white shadow-xl">
                <Target className="w-8 h-8 mb-4 text-flexigo-teal" />
                <h3 className="text-xl font-bold font-heading mb-3">Our Mission</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {displayMission}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-flexigo-teal to-flexigo-teal/80 text-white shadow-xl sm:mt-8">
                <Heart className="w-8 h-8 mb-4 text-white/80" />
                <h3 className="text-xl font-bold font-heading mb-3">Our Vision</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {displayVision}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <MapPin className="w-7 h-7 mb-3 text-flexigo-teal" />
                <h3 className="text-lg font-bold font-heading text-slate-800 mb-2">{liveAbout?.addressTitle || "Headquartered in Pune"}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {liveAbout?.addressContent || "'Krushna Avenue', SR NO: 111/10, Baner Pune City, Pune (CB) — 411045, Maharashtra, India."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 lg:py-32 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">What We Stand For</p>
            <h2 className="text-4xl md:text-5xl font-black font-heading text-flexigo-primary leading-[1.15] tracking-tighter mb-4">
              Our Core Values
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Every decision at FlexiGo is guided by these principles — from the vehicles we choose to the partnerships we build.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayValues.map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="p-7 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-flexigo-teal/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${v.color || 'emerald'}-500/10 flex items-center justify-center text-${v.color || 'emerald'}-500 mb-5 group-hover:bg-${v.color || 'emerald'}-500 group-hover:text-white transition-all duration-300`}>
                  {iconMap[v.icon] || v.icon}
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-800 mb-3">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Journey</p>
            <h2 className="text-4xl md:text-5xl font-black font-heading text-flexigo-primary leading-[1.15] tracking-tighter">
              How We Got Here
            </h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100" />
            <div className="space-y-10 pl-16">
              {displayMilestones.map((m, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="relative">
                  <div className="absolute -left-10 top-1 w-8 h-8 rounded-full bg-flexigo-primary flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-flexigo-teal" />
                  </div>
                  <span className="inline-block text-xs font-bold text-flexigo-teal uppercase tracking-widest mb-2">{m.year}</span>
                  <h3 className="text-xl font-bold font-heading text-slate-800 mb-2">{m.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
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

export default AboutUsPage;
