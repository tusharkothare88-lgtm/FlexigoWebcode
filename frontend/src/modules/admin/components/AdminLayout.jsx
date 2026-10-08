import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAdminThemeStore } from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings, Command, Sun, Moon, Menu, X as XIcon } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';
import { onMessageListener, requestForToken } from '../../../lib/firebase';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAdminAuthStore();
  const { theme, toggleTheme } = useAdminThemeStore();
  const navigate = useNavigate();
  const { notifications, fetchNotifications } = useAdminDataStore();
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const processedMessages = React.useRef(new Set());

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.backgroundColor = theme === 'dark' ? '#020617' : '#F8FAFC';
  }, [theme]);

  useEffect(() => {
    // FCM Real-time Integration
    const initNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        console.log('Admin FCM Token Ready:', token);
        // If we had a real backend Admin model, we'd save it here:
        // await api.post('/admin/save-token', { token });
      }
    };

    initNotifications();

    const unsubscribe = onMessageListener().then((payload) => {
      const msgId = payload.messageId || Date.now();
      if (processedMessages.current.has(msgId)) return;
      processedMessages.current.add(msgId);

      console.log('🔔 Real-time Notification:', payload);
      
      // Browser Alert (Foreground)
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo3.png',
        });
      }

      fetchNotifications();
    }).catch(err => console.log('FCM Error:', err));

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — hidden on mobile, slide-in drawer on mobile */}
      <div className={`fixed md:relative inset-y-0 left-0 z-[90] md:z-auto transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <AdminSidebar />
      </div>

      {/* Main Orchestrator */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Global Control Header */}
        <header className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 md:px-8 bg-[var(--bg-secondary)]/80 backdrop-blur-md z-40 transition-colors duration-300">
           <div className="flex items-center gap-3 flex-1">
             {/* Mobile Hamburger */}
             <button
               onClick={() => setIsMobileSidebarOpen(true)}
               className="md:hidden p-2 text-[var(--text-tertiary)] hover:text-emerald-500 rounded-lg transition-all"
             >
               <Menu size={20} />
             </button>
           </div>

           <div className="flex items-center gap-4">
              {/* Network Status Active Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Status: Active</span>
              </div>
              
              <div className="flex items-center gap-1 relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-lg transition-all relative group ${isNotifOpen ? 'text-emerald-500 bg-emerald-500/10' : 'text-[var(--text-tertiary)] hover:text-emerald-500'}`}
                >
                   <Bell size={18} />
                   {notifications.length > 0 && (
                     <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-[var(--bg-secondary)]" />
                   )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-80 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                       <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/30">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">System Alerts</h3>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase">{notifications.length} New</span>
                       </div>
                       <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                          {notifications.length > 0 ? notifications.map((n) => (
                            <div key={n.id} className="p-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)]/20 transition-colors cursor-pointer group">
                               <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[10px] font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors uppercase truncate">{n.title}</p>
                                     <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{n.message}</p>
                                     <p className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase mt-2 opacity-50">
                                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                     </p>
                                  </div>
                               </div>
                            </div>
                          )) : (
                            <div className="py-12 text-center">
                               <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No New Notifications</p>
                            </div>
                          )}
                       </div>
                       <div className="p-2 bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-subtle)]">
                          <button 
                            onClick={() => {
                              navigate('/admin/security');
                              setIsNotifOpen(false);
                            }}
                            className="w-full py-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/5 rounded-lg transition-all"
                          >
                             View Audit Center
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={() => {
                     if (window.location.pathname !== '/admin/settings') {
                        navigate('/admin/settings');
                     }
                  }}
                  className="p-2 text-[var(--text-tertiary)] hover:text-emerald-500 rounded-lg transition-all"
                >
                   <Settings size={18} />
                </button>
              </div>

              <div className="h-4 w-px bg-[var(--border-subtle)] mx-2" />

              <div className="flex items-center gap-3 pl-2">
                 <div className="flex flex-col text-right hidden lg:flex">
                    <span className="text-xs font-black text-[var(--text-primary)] hover:text-emerald-500 cursor-pointer transition-colors leading-none">{user?.name || 'Admin Console'}</span>
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">
                     {user?.accountType === 'staff' ? (user?.role || 'Staff Member') : 'Administrator'}
                   </span>
                 </div>
                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-white/10 flex items-center justify-center shadow-lg shadow-emerald-950/20 cursor-help group relative">
                    <span className="font-black text-xs text-white">RA</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-auto overscroll-y-none custom-scrollbar-emerald pt-6 px-4 md:px-10 pb-20 relative bg-[var(--bg-primary)] transition-colors duration-300">
           {/* Discrete Grid Pattern Backdrop */}
           <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
           
           <AnimatePresence mode="wait">
             <motion.div
               key={window.location.pathname}
               initial={{ opacity: 0, scale: 0.99, y: 5 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.99, y: -5 }}
               transition={{ duration: 0.25, ease: "easeOut" }}
               className="relative z-10"
             >
                <Outlet />
             </motion.div>
           </AnimatePresence>
           
           {/* Tactical Footer Glow */}
           <div className="fixed bottom-0 right-0 w-1/4 h-1/4 bg-emerald-600/5 blur-[100px] pointer-events-none -z-10" />
        </main>
      </div>
    </div>
  );
}
