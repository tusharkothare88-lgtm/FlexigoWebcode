import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function SupportScreen() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [tickets, setTickets] = useState([
    { id: '#T-9421', status: 'Resolved', subject: 'Battery swap failed', date: '22 Mar' },
    { id: '#T-9840', status: 'In Progress', subject: 'Refund for plan renewal', date: 'Today' }
  ]);

  return (
    <PageWrapper className="flex flex-col p-6 pb-24">
       <div className="pt-8 mb-10 flex justify-between items-center">
          <h1 className={`text-2xl font-heading font-black transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>Help & <span className="text-flexigo-teal">Support.</span></h1>
          <div className={`w-10 h-10 rounded-full border transition-all duration-500 flex items-center justify-center ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 shadow-sm'
          }`}>
             <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? 'white' : '#1e293b'} strokeWidth="2.5" className="w-5 h-5 opacity-40">
                <path d="M12 6V12L16 14" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
          </div>
       </div>

       <div className="space-y-8 flex-1">
          <GlassCard className={`p-6 transition-all duration-500 bg-gradient-to-br ${
            isDark ? 'from-white/10 to-transparent' : 'from-slate-100/80 to-transparent shadow-sm'
          }`}>
             <h3 className={`font-black mb-2 transition-colors duration-500 ${
               isDark ? 'text-white' : 'text-slate-900'
             }`}>How can we help?</h3>
             <p className={`text-[10px] font-bold mb-6 transition-colors duration-500 uppercase tracking-widest ${
               isDark ? 'text-gray-500' : 'text-slate-500'
             }`}>Our dedicated EV support team is available 24/7 to assist you.</p>
             <div className="grid grid-cols-2 gap-3">
                <button className={`p-3 rounded-xl border transition-all duration-500 flex flex-col items-center gap-2 ${
                  isDark ? 'bg-white/5 border-white/05 hover:bg-white/10' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'
                }`}>
                   <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                     isDark ? 'text-white' : 'text-slate-900'
                   }`}>Live Chat</span>
                </button>
                <button className={`p-3 rounded-xl border transition-all duration-500 flex flex-col items-center gap-2 ${
                  isDark ? 'bg-white/5 border-white/05 hover:bg-white/10' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'
                }`}>
                   <div className="w-8 h-8 rounded-full bg-flexigo-teal/10 flex items-center justify-center text-flexigo-teal shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                     isDark ? 'text-white' : 'text-slate-900'
                   }`}>Hotline</span>
                </button>
             </div>
          </GlassCard>

          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${
                  isDark ? 'text-gray-500' : 'text-slate-400'
                }`}>Active Tickets</h4>
                <button className="text-flexigo-teal text-[10px] font-black uppercase tracking-widest underline underline-offset-4 decoration-flexigo-teal/30">Create New</button>
             </div>
             
             {tickets.map(ticket => (
               <GlassCard key={ticket.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className={`font-black text-sm transition-colors duration-500 ${
                         isDark ? 'text-white' : 'text-slate-900'
                       }`}>{ticket.id}</span>
                       <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm ${
                         ticket.status === 'Resolved' 
                          ? 'bg-flexigo-teal/10 text-flexigo-teal border border-flexigo-teal/20' 
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                       }`}>
                          {ticket.status}
                       </span>
                    </div>
                    <div className={`text-[10px] font-bold mt-1 transition-colors duration-500 ${
                      isDark ? 'text-gray-500' : 'text-slate-500'
                    }`}>{ticket.subject}</div>
                  </div>
                  <div className={`text-[10px] font-black transition-colors duration-500 ${
                    isDark ? 'text-gray-700' : 'text-slate-400'
                  }`}>{ticket.date}</div>
               </GlassCard>
             ))}
          </div>
       </div>

        <div className="mt-10 space-y-4">
           <NeonButton 
             variant="green" 
             size="lg" 
             className="w-full"
             onClick={() => {
               const url = 'https://www.google.com/maps?q=18.566177368164062,73.7693099975586&z=17&hl=en';
               if (navigator.share) {
                 navigator.share({
                   title: 'Flexigo Office Location',
                   text: 'Visit Flexigo Office:',
                   url: url,
                 }).catch(console.error);
               } else {
                 window.open(`https://wa.me/?text=${encodeURIComponent('Visit Flexigo Office: ' + url)}`, '_blank');
               }
             }}
           >
              Share Office Location
           </NeonButton>
           <NeonButton variant="outline" size="lg" className="w-full">
              Contact Center
           </NeonButton>
        </div>
    </PageWrapper>
  );
}
