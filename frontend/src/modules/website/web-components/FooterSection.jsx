import React from 'react';
import { Twitter, Instagram, Linkedin, Zap, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const FooterSection = () => {
  const productLinks = [
    { name: 'Rider App', path: '/rider-app' },
    { name: 'Franchise Panel', path: '/franchise-panel' },
  ];

  const companyLinks = [
    { name: 'Careers', path: '/careers' },
    { name: 'Press & Media', path: '/press' },
    { name: 'Sustainability', path: '/sustainability' },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10 overflow-hidden">
      <div className="w-full px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center group mb-6 relative w-max inline-flex">
              <img
                src={logo}
                alt="FlexiGo Logo"
                width="192"
                height="192"
                className="w-40 h-40 md:w-48 md:h-48 absolute top-1/2 -translate-y-[48%] md:-translate-y-1/2 -left-10 md:-left-6 object-contain transition-transform duration-300 group-hover:scale-105 z-10"
              />
              <div className="w-18 md:w-32 h-10" />
              <span className="text-2xl font-heading font-black tracking-tighter text-flexigo-primary mt-1 whitespace-nowrap relative z-20 uppercase">
                Flex<span className="text-flexigo-teal">igo E-Mobility</span>
              </span>
            </Link>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-sm">
              Powering the future of micro-mobility and delivery logistics in India with
              smart, zero-maintenance EVs.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
                { icon: <Instagram className="w-5 h-5" />, label: 'Instagram' },
                { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn' },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-flexigo-primary hover:border-flexigo-teal transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  {social.icon}
                </a>
              ))}
            </div>

          </div>

          {/* Links Col 1 */}
          <div className="hidden md:block">
            <h4 className="font-bold font-heading text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-600 hover:text-flexigo-teal transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="hidden md:block">
            <h4 className="font-bold font-heading text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-600 hover:text-flexigo-teal transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="hidden md:block">
            <h4 className="font-bold font-heading text-slate-900 mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-flexigo-teal shrink-0 mt-0.5" />
                <span className="text-slate-600 text-sm leading-relaxed">
                  ‘Krushna Avenue’,  SR NO: 111/10/Baner Pune City Pune(CB) 411045.
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-flexigo-teal shrink-0" />
                <a href="mailto:support@flexigoemobility.com" className="text-slate-600 text-sm font-medium hover:text-flexigo-teal transition-colors">
                  support@flexigoemobility.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Flexigo E-Mobility Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-flexigo-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-flexigo-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
