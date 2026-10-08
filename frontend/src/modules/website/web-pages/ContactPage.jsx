import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Mail, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import logo from '../../../assets/logo.png';
import api from '../../../lib/axios';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'rider', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await api.get('/admin/web/contact-info');
        if (res.data.success) {
          setContactInfo(res.data.info);
        }
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/web/contact/submit', form);
      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const defaultInfo = {
    email: 'support@flexigoemobility.com',
    phone: '+91 99229 68093',
    address: '‘Krushna Avenue’, SR NO: 111/10/Baner, Pune City, Pune (CB) 411045, Maharashtra, India.',
    workingHours: 'Monday to Saturday: 9:30 AM – 6:30 PM'
  };

  const info = contactInfo || defaultInfo;

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
          <p className="text-flexigo-teal font-bold uppercase tracking-[0.2em] text-xs mb-4">Connect With Us</p>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4">
            We'd Love to Hear From <span className="text-flexigo-teal italic">You</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about our smart EV subscriptions, franchise network, or corporate solutions? Get in touch with our team in Pune today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Col - Contact Info */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <h2 className="text-2xl font-bold font-heading text-slate-800 mb-2">Our Head Office</h2>
                <p className="text-slate-500">Visit us or send us mail at our headquarters in Baner, Pune.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-800 text-lg mb-1">Office Address</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {info.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-800 text-lg mb-1">Call Support</h3>
                    <a href={`tel:${info.phone}`} className="text-slate-600 text-sm font-medium hover:text-flexigo-teal transition-colors">
                      {info.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-800 text-lg mb-1">WhatsApp Support</h3>
                    <a href={`https://wa.me/${info.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 text-sm font-medium hover:text-flexigo-teal transition-colors">
                      {info.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-800 text-lg mb-1">Email Support</h3>
                    <a href={`mailto:${info.email}`} className="text-slate-600 text-sm font-medium hover:text-flexigo-teal transition-colors">
                      {info.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-flexigo-teal/10 text-flexigo-teal flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-800 text-lg mb-1">Working Hours</h3>
                    <p className="text-slate-600 text-sm">{info.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Contact Form */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-flexigo-teal mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black font-heading text-slate-800 mb-3">Message Sent!</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting FlexiGo. Our team will review your message and reach back within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-3 bg-flexigo-primary text-white rounded-full text-sm font-bold hover:bg-flexigo-teal transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black font-heading text-slate-800 mb-1">Send a Message</h3>
                    <p className="text-slate-500 text-sm">We'll guide you to the right department immediately.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Your Name</label>
                      <input
                        type="text" required
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-flexigo-teal transition-colors"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="tel" required
                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-flexigo-teal transition-colors"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email" required
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-flexigo-teal transition-colors"
                      placeholder="e.g. rahul@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Inquiry Type</label>
                    <select
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-flexigo-teal transition-colors"
                    >
                      <option value="rider">Rider / Subscription Inquiry</option>
                      <option value="franchise">Franchise Opportunity</option>
                      <option value="corporate">B2B Delivery Fleets</option>
                      <option value="press">Press / Media</option>
                      <option value="other">General Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Your Message</label>
                    <textarea
                      rows={4} required
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-flexigo-teal transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-flexigo-primary hover:bg-flexigo-teal text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-flexigo-primary/10 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
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

export default ContactPage;
