import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../store/themeStore";
import FranchiseSidebar from "./FranchiseSidebar";
import FranchiseHeader from "./FranchiseHeader";
import { useFranchiseNotificationStore } from "../store/notificationStore";
import { useFranchiseWalletStore } from "../store/walletStore";
import { getMessaging, onMessage } from "firebase/messaging";
import app from "../../../lib/firebase";
import { Bell, IndianRupee, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import api from "../../../lib/axios";

const CURRENT_APP_VERSION = '1.0.0';

export default function FranchiseLayout() {
  const { theme } = useThemeStore();
  const { addNotification } = useFranchiseNotificationStore();
  const { fetchWallet } = useFranchiseWalletStore();
  const [toast, setToast] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for app update on mount
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await api.get('/app-version?platform=franchise');
        if (res.data.success && res.data.version !== CURRENT_APP_VERSION) {
          setLatestVersion(res.data.version);
          setShowUpdatePopup(true);
          if (res.data.playStoreUrl) {
            sessionStorage.setItem('franchise_playstore_url', res.data.playStoreUrl);
          }
        }
      } catch (e) {
        // silently fail
      }
    };
    checkUpdate();
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.backgroundColor = theme === 'dark' ? '#020617' : '#F8FAFC';
  }, [theme]);

  useEffect(() => {
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('🔔 Real-time notification received:', payload);
      
      const { title, body } = payload.notification;
      const data = payload.data || {};

      // Add to store
      const newNotif = {
        title,
        message: body,
        severity: data.type === 'wallet_credit' ? 'success' : (data.type === 'geofence_breach' ? 'danger' : 'info'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addNotification(newNotif);

      // Refresh wallet if it's a credit
      if (data.type === 'wallet_credit' || data.type === 'payout_update') {
        fetchWallet();
      }

      // Show Toast
      setToast({ title, body, type: data.type });
      setTimeout(() => setToast(null), 6000);
    });

    return () => unsubscribe();
  }, [addNotification, fetchWallet]);

  return (
    <div className={`flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden transition-colors duration-300 ${theme}`}>
      {/* App Update Popup */}
      <AnimatePresence>
        {showUpdatePopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
                <RefreshCw size={32} className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Update Available</h3>
                <p className="text-[11px] font-bold text-[var(--text-tertiary)]">
                  A new version ({latestVersion}) of Flexigo Franchise is available. Please update for the best experience.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(sessionStorage.getItem('franchise_playstore_url') || 'https://play.google.com/store/apps/details?id=com.flexigo.franchise', '_blank')}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Update Now
                </button>
                <button
                  onClick={() => setShowUpdatePopup(false)}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Sidebar with internal motion logic */}
      <FranchiseSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Hub Body */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <motion.div 
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 40, delay: 0.1 }}
          className="z-10 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] h-14 shrink-0 flex items-center w-full"
        >
          <FranchiseHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        </motion.div>
        
        <main className="flex-1 overflow-auto overscroll-y-none custom-scrollbar-emerald p-6 bg-[var(--bg-primary)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, scale: 0.995, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.995, y: -10 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="max-w-screen-2xl mx-auto h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Subtle Background Ambience Refinement */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-emerald-500/[0.02] to-transparent pointer-events-none -z-10" />

        {/* Real-time Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="fixed bottom-6 right-6 z-[100] w-80 bg-[var(--bg-secondary)] border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden shadow-emerald-500/10"
            >
              <div className="p-4 flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  toast.type === 'wallet_credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {toast.type === 'wallet_credit' ? <IndianRupee size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] italic">{toast.title}</h4>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)] mt-0.5 leading-relaxed">{toast.body}</p>
                </div>
                <button onClick={() => setToast(null)} className="text-[var(--text-tertiary)] hover:text-rose-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 6, ease: "linear" }}
                className={`h-1 ${toast.type === 'wallet_credit' ? 'bg-emerald-500' : 'bg-blue-500'}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
