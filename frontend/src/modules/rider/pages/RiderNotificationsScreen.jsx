import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trash2,
  CheckCircle,
  Zap,
  FileText,
  ChevronRight,
  ArrowLeft,
  X,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { useThemeStore } from '../store/themeStore';

const initialNotifications = [
  {
    id: 'NTF-001',
    type: 'payment',
    title: 'Top-up Successful',
    message: 'Your wallet has been credited with ₹500. Current balance: ₹1,240.',
    time: '2h ago',
    isRead: false
  },
  {
    id: 'NTF-002',
    type: 'system',
    title: 'KYC Authorized',
    message: 'Identity verification complete. You can now subscribe to professional plans.',
    time: '5h ago',
    isRead: false
  },
  {
    id: 'NTF-003',
    type: 'ride',
    title: 'Subscription Ending',
    message: 'Your Weekly Professional plan expires in 24 hours. Renew now to avoid interruption.',
    time: '1d ago',
    isRead: true
  },
  {
    id: 'NTF-004',
    type: 'alert',
    title: 'Zone Boundary Warning',
    message: 'You have entered a Restricted Zone. Please return to the permitted operational area.',
    time: '2d ago',
    isRead: true
  }
];

export default function RiderNotificationsScreen() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <PageWrapper className={`min-h-screen pb-24 ${isDark ? 'bg-[#0A1120]' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-20 bg-inherit/90 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}
        >
          <ArrowLeft size={20} className={isDark ? 'text-white' : 'text-slate-800'} />
        </button>
        <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic"
        >
          Clear All
        </button>
      </div>

      <div className="px-6 space-y-4 mt-6">
        <AnimatePresence mode='popLayout'>
          {notifications.length > 0 ? (
            notifications.map((ntf, idx) => (
              <motion.div
                key={ntf.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard
                  className={`p-5 flex items-start gap-4 border relative ${isDark ? 'border-white/5 hover:border-emerald-500/20' : 'border-slate-200 hover:border-emerald-500/30'
                    } ${!ntf.isRead ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50') : ''}`}
                  onClick={() => markAsRead(ntf.id)}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${ntf.type === 'payment' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    ntf.type === 'system' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      ntf.type === 'alert' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                        'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                    {ntf.type === 'payment' ? <Zap size={18} fill="currentColor" /> :
                      ntf.type === 'system' ? <ShieldCheck size={18} /> :
                        ntf.type === 'alert' ? <AlertCircle size={18} className="animate-pulse" /> :
                          <Bell size={18} />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black uppercase tracking-tight italic ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>
                        {ntf.title}
                      </h3>
                      {!ntf.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      )}
                    </div>
                    <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ntf.message}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] opacity-60">
                      <Clock size={10} /> {ntf.time}
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteNotification(e, ntf.id)}
                    className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center space-y-4">
              <div className={`w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <Bell size={32} className="text-slate-600 opacity-20" />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Registry is Clear • No Updates
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Safety Strip */}
      <div className="px-6 mt-12">
        <div className={`p-6 border-2 border-dashed rounded-[2.5rem] flex items-center gap-6 ${isDark ? 'bg-emerald-600/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-500/20'}`}>
          <div className="w-12 h-12 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-tight italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Compliance Sync Active</h4>
            <p className={`text-[9px] font-bold uppercase tracking-widest leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              All alerts are TLS-1.3 Encrypted via Flexigo Root.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
