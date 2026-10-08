import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Clock,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { useFranchiseNotificationStore } from '../store/notificationStore';
import NotificationItem from '../components/NotificationItem';
import { onMessageListener } from '../../../lib/firebase';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'danger', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
];

export default function NotificationsPage() {
  const { notifications, readNotification, markAllRead, fetchNotifications, loading } = useFranchiseNotificationStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
    onMessageListener().then(payload => {
      console.log('🔔 Franchise Notification received:', payload);
      // You can trigger a local notification or update state here
    }).catch(err => console.log('Notification listener failed: ', err));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' ? !n.read : n.severity === filter);
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMetricClasses = (color) => {
    switch (color) {
      case 'rose': return { bg: 'bg-rose-500/5', border: 'border-rose-500/10 hover:border-rose-500/30', text: 'text-rose-600', iconBg: 'bg-rose-500/10' };
      case 'blue': return { bg: 'bg-blue-500/5', border: 'border-blue-500/10 hover:border-blue-500/30', text: 'text-blue-600', iconBg: 'bg-blue-500/10' };
      case 'emerald': return { bg: 'bg-emerald-500/5', border: 'border-emerald-500/10 hover:border-emerald-500/30', text: 'text-emerald-600', iconBg: 'bg-emerald-500/10' };
      default: return { bg: 'bg-emerald-500/5', border: 'border-emerald-500/10 hover:border-emerald-500/30', text: 'text-emerald-600', iconBg: 'bg-emerald-500/10' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <div className="w-1 h-3 bg-emerald-500 rounded-full" />
               <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
                  Hub <span className="text-emerald-500">Notifications</span>
               </h1>
            </div>
            <p className="text-[7.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] ml-3 italic opacity-60 leading-none mt-1">
               Stay updated with system activities
            </p>
         </div>

         <button 
           onClick={markAllRead}
           className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-950/40 transition-all shadow-inner italic leading-none rounded-lg"
         >
           <CheckCircle2 size={12} strokeWidth={3} /> Mark all as read
         </button>
      </div>

      {/* Metric Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {[
           { label: 'Priority Alerts', val: '02', color: 'rose', icon: AlertTriangle, status: 'Alerts' },
           { label: 'Operations', val: '14', color: 'blue', icon: Zap, status: 'Active' },
           { label: 'Unread Messages', val: unreadCount.toString().padStart(2, '0'), color: 'emerald', icon: Bell, status: 'Syncing' }
         ].map((stat) => {
           const classes = getMetricClasses(stat.color);
           return (
             <div key={stat.label} className={`p-4 rounded-2xl ${classes.bg} border ${classes.border} flex items-center justify-between shadow-inner transition-all cursor-crosshair relative overflow-hidden group`}>
                <div className="space-y-1 relative z-10">
                   <p className={`text-[7.5px] font-black uppercase tracking-[0.3em] ${classes.text} italic leading-none opacity-80`}>{stat.label}</p>
                   <h4 className={`text-3xl font-black italic tracking-tighter ${classes.text} leading-none`}>{stat.val}</h4>
                </div>
                <div className={`w-10 h-10 rounded-xl ${classes.iconBg} flex items-center justify-center ${classes.text} shadow-inner relative z-10 transition-transform group-hover:scale-110`}>
                   <stat.icon size={20} strokeWidth={2.5} />
                </div>
                <div className={`absolute top-2 right-2 text-[6.5px] font-black ${classes.text} opacity-20 uppercase tracking-[0.3em] font-mono leading-none`}>{stat.status}</div>
             </div>
           );
         })}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
         <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1 rounded-xl shadow-inner shrink-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-[7.5px] font-black uppercase tracking-[0.3em] transition-all duration-300 italic leading-none ${
                  filter === tab.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/20' 
                  : 'text-[var(--text-tertiary)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>

         <div className="relative flex-1 group w-full">
            <Search size={12} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..." 
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[8px] font-black text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-600 uppercase tracking-[0.3em] italic shadow-inner leading-none"
            />
         </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <NotificationItem 
                key={notif.id} 
                notification={notif} 
                onRead={readNotification}
              />
            ))
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-tertiary)] flex flex-col items-center gap-4 shadow-inner"
            >
               <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-slate-600 shadow-inner group">
                  <Bell size={20} strokeWidth={2} className="group-hover:text-emerald-500 transition-colors" />
               </div>
               <div className="space-y-1.5">
                  <p className="text-[9.5px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] italic leading-none">All notifications cleared</p>
                  <p className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.3em] opacity-80 italic leading-none">No new alerts at the moment</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-8 flex flex-col items-center gap-3">
         <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
         <p className="text-[7.5px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] opacity-40 italic leading-none">VERIFIED_NODE_AUDIT: HUB_KOR_01</p>
      </div>
    </div>
  );
}
