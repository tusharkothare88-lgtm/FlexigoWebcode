import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Truck,
  MapPin,
  Wallet,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User as UserIcon,
  Wrench
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useFranchiseAuthStore as useAuthStore } from '../store/franchiseAuthStore';

import logo from '../../../assets/logo.png';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/franchise/dashboard' },
  { id: 'tracking', label: 'Riders', icon: Users, path: '/franchise/tracking' },
  { id: 'fleet', label: 'Fleet Ops', icon: Truck, path: '/franchise/fleet' },
  { id: 'maintenance', label: 'Service Hub', icon: Wrench, path: '/franchise/maintenance' },
  { id: 'handover', label: 'Handover', icon: RefreshCw, path: '/franchise/handover' },
  { id: 'wallet', label: 'Settlements', icon: Wallet, path: '/franchise/wallet' },
  { id: 'staff', label: 'Staff', icon: UserIcon, path: '/franchise/staff' },
  { id: 'notifications', label: 'Alerts', icon: Bell, path: '/franchise/notifications' },
];

export default function FranchiseSidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isMobile ? 256 : (collapsed ? 80 : 256) }}
        transition={{ type: "spring", stiffness: 400, damping: 35, restDelta: 0.1 }}
        className={`h-full bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col shadow-sm z-[100] shrink-0
          fixed md:relative inset-y-0 left-0 transform transition-transform duration-300
          ${isMobile ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        {/* Sidebar Header Brand - Professional B2B Style */}
        <div className="h-14 border-b border-[var(--border-subtle)] flex items-center px-6 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 shrink-0 overflow-hidden">
              <img src={logo} alt="Flexigo" className="w-full h-full object-contain scale-[1.6]" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="flex flex-col leading-none"
                >
                  <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">FLEXIGO</h2>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Management</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Navigation - Integrated Glide Highlighter */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6">
          <nav className="px-3 space-y-1 relative">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
                  className="block relative group"
                >
                  <div className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 relative h-11 ${isActive
                    ? 'text-white'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-emerald-600/5'
                    }`}>
                    <div className="shrink-0 z-10 transition-transform duration-500 group-hover:scale-110">
                      <Icon size={18} strokeWidth={2.5} />
                    </div>

                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-[11px] font-bold uppercase tracking-widest ml-3 relative z-10 whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Shared Pill - Smooth glides on sidebar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="absolute inset-0 bg-emerald-600 rounded-lg shadow-md shadow-emerald-900/10 z-0"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Toggle Bubble */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-18 -right-3 w-6 h-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-emerald-500 transition-all shadow-md z-50 transform translate-y-12 active:scale-90"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Sidebar Footer Context - Professional B2B Profile */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10 overflow-hidden">
          <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex items-center min-h-[50px]">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <UserIcon size={16} strokeWidth={2.5} />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{user?.hubName || user?.name || 'Hub Manager'}</p>
                    <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-tighter truncate opacity-60">ID: {(user?.id || user?._id || '000000').slice(-6).toUpperCase()}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!collapsed && (
                <button
                  onClick={logout}
                  className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 transition-all shrink-0"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-2 text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2"
              >
                 <a href="https://flexigoemobility.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
                 <span className="opacity-40">•</span>
                 <a href="https://flexigoemobility.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
