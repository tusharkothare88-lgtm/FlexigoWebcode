import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronUp, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import logo from '../../../assets/logo.png';
import { useLenis } from '@studio-freight/react-lenis';

const Navbar = () => {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null); // 'product' | 'company' | 'contact' | null

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset accordion state when hamburger menu is closed
  useEffect(() => {
    if (!mobileMenuOpen) {
      setActiveAccordion(null);
    }
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile hamburger is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Plans', href: '/pricing-plans' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const productLinks = [
    { name: 'Rider App', path: '/rider-app' },
    { name: 'Franchise Panel', path: '/franchise-panel' },
  ];

  const companyLinks = [
    { name: 'Careers', path: '/careers' },
    { name: 'Press & Media', path: '/press' },
    { name: 'Sustainability', path: '/sustainability' },
  ];

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 pointer-events-auto',
        scrolled
          ? 'bg-flexigo-bg/80 backdrop-blur-md shadow-sm pt-2 pb-5 md:pt-4 md:pb-7'
          : 'bg-transparent pt-3 pb-8 md:pt-5 md:pb-10'
      )}
    >
      <div className="w-full max-w-[1440px] mx-auto px-2 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center group relative">
          <img 
            src={logo} 
            alt="FlexiGo Logo" 
            width="192"
            height="192"
            className="w-40 h-40 md:w-56 md:h-56 absolute top-1/2 -translate-y-[48%] md:-translate-y-[44%] -left-10 md:-left-12 object-contain transition-transform duration-300 group-hover:scale-105 z-10" 
          />
          <div className="w-20 md:w-30 h-10 md:h-12" />
          <span className={cn(
            "text-2xl font-heading font-black tracking-tighter transition-colors mt-0.5 whitespace-nowrap uppercase",
            scrolled ? "text-flexigo-primary" : "text-black"
          )}>
            Flex<span className="text-flexigo-teal">igo E-Mobility</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isRoute = link.href.startsWith('/');
            const className = cn(
              "text-sm font-medium transition-colors",
              scrolled 
                ? "text-flexigo-teal hover:text-flexigo-primary" 
                : "text-black hover:text-flexigo-teal"
            );
            return isRoute ? (
              <Link key={link.name} to={link.href} className={className}>
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href} 
                className={className}
                onClick={(e) => {
                  e.preventDefault();
                  lenis?.scrollTo(link.href);
                }}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Invisible spacer to keep desktop links perfectly aligned in their original position */}
        <div className="hidden md:flex items-center gap-4 invisible pointer-events-none select-none" aria-hidden="true">
          <button className="text-sm font-medium">
            Log In
          </button>
          <button className="px-5 py-2.5 rounded-full text-sm font-medium">
            Get Started
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-flexigo-primary relative z-[60]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-xl shadow-2xl border-b border-slate-100 overflow-y-auto max-h-[85vh] md:hidden z-50 pt-24 pb-10"
            data-lenis-prevent
          >
            <div className="flex flex-col gap-5 px-6">
              {navLinks.map((link, i) => {
                const isRoute = link.href.startsWith('/');
                const className = "text-xl font-heading font-bold text-slate-800 hover:text-flexigo-teal transition-colors block";
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {isRoute ? (
                      <Link
                        to={link.href}
                        className={className}
                        onClick={() => {
                          setTimeout(() => {
                            setMobileMenuOpen(false);
                          }, 50);
                        }}
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={className}
                        onClick={(e) => {
                          e.preventDefault();
                          lenis?.scrollTo(link.href);
                          setTimeout(() => {
                            setMobileMenuOpen(false);
                          }, 100);
                        }}
                      >
                        {link.name}
                      </a>
                    )}
                  </motion.div>
                );
              })}

              {/* Collapsible Footer Sections */}
              <div className="h-px bg-slate-100 my-1" />

              {/* Product Accordion */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleAccordion('product')}
                  className="flex items-center justify-between py-2 text-xl font-heading font-bold text-slate-800 hover:text-flexigo-teal transition-colors text-left"
                >
                  <span>Product</span>
                  {activeAccordion === 'product' ? (
                    <ChevronUp size={20} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'product' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 flex flex-col gap-3 py-2 border-l border-slate-100 mt-1"
                    >
                      {productLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="text-base text-slate-600 hover:text-flexigo-teal transition-colors font-semibold py-1"
                          onClick={() => {
                            setTimeout(() => {
                              setMobileMenuOpen(false);
                            }, 50);
                          }}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Company Accordion */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleAccordion('company')}
                  className="flex items-center justify-between py-2 text-xl font-heading font-bold text-slate-800 hover:text-flexigo-teal transition-colors text-left"
                >
                  <span>Company</span>
                  {activeAccordion === 'company' ? (
                    <ChevronUp size={20} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'company' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 flex flex-col gap-3 py-2 border-l border-slate-100 mt-1"
                    >
                      {companyLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="text-base text-slate-600 hover:text-flexigo-teal transition-colors font-semibold py-1"
                          onClick={() => {
                            setTimeout(() => {
                              setMobileMenuOpen(false);
                            }, 50);
                          }}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Us Accordion */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleAccordion('contact')}
                  className="flex items-center justify-between py-2 text-xl font-heading font-bold text-slate-800 hover:text-flexigo-teal transition-colors text-left"
                >
                  <span>Contact Us</span>
                  {activeAccordion === 'contact' ? (
                    <ChevronUp size={20} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'contact' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 flex flex-col gap-4 py-3 border-l border-slate-100 mt-1"
                    >
                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-flexigo-teal shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm leading-relaxed font-semibold">
                          ‘Krushna Avenue’, SR NO: 111/10/Baner Pune City Pune(CB) 411045.
                        </span>
                      </div>
                      


                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-flexigo-teal shrink-0" />
                        <a
                          href="mailto:support@flexigoemobility.com"
                          className="text-slate-600 text-sm font-semibold hover:text-flexigo-teal transition-colors"
                          onClick={() => {
                            setTimeout(() => {
                              setMobileMenuOpen(false);
                            }, 50);
                          }}
                        >
                          support@flexigoemobility.com
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
