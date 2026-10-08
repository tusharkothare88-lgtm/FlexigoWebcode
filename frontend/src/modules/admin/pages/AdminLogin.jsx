import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Command, 
  Zap, 
  Terminal,
  Activity,
  User 
} from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import logo from '../../../assets/logo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate terminal-like delay
    setTimeout(async () => {
       const result = await login(email, password);
       if (result === true) {
         navigate('/admin/dashboard');
       } else {
         setError(result?.message || 'Access Denied: Invalid credentials.');
         setIsLoading(false);
       }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 blur-[120px] animate-pulse delay-700" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Neon Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        
        {/* Brand Terminal Identity */}
        <div className="flex flex-col items-center text-center mb-12">
           <motion.div 
             initial={{ y: -20 }}
             animate={{ y: 0 }}
             className="w-20 h-20 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-900/10 mb-6 group cursor-help relative"
             onMouseEnter={() => setShowConsole(true)}
             onMouseLeave={() => setShowConsole(false)}
           >
              <img src={logo} alt="Flexigo Admin" className="w-14 h-14 object-contain brightness-110 drop-shadow-neon-sm" />
              <div className="absolute -inset-2 bg-emerald-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
           </motion.div>
           
           <h1 className="text-3xl font-black font-heading text-white tracking-tighter uppercase italic leading-none">
              Flexigo <span className="text-emerald-500">Root.</span>
           </h1>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">
              Administrator Login
           </p>
        </div>

        {/* Login Console Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-4">
              {/* Email Input */}
              <div className="group relative">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Mail size={18} />
                 </div>
                 <input 
                   required
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Admin Email"
                   className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all placeholder:text-slate-600 placeholder:uppercase placeholder:tracking-widest"
                 />
              </div>

              {/* Password Input */}
              <div className="group relative">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock size={18} />
                 </div>
                 <input 
                   required
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password"
                   className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all placeholder:text-slate-600 placeholder:uppercase placeholder:tracking-widest"
                 />
              </div>
           </div>

           {/* Error Display */}
           <AnimatePresence>
             {error && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3"
               >
                  <ShieldCheck className="text-rose-500 shrink-0 mt-0.5" size={14} />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-relaxed">
                     {error}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Submit Action */}
           <button 
             disabled={isLoading}
             className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
           >
              <div className="flex items-center justify-center gap-3">
                 {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <>
                      Login
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                 )}
              </div>
           </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-slate-500">
           By continuing, you agree to our{' '}
           <a href="https://flexigoemobility.com/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Terms of Service</a> &amp;{' '}
           <a href="https://flexigoemobility.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Privacy Policy</a>
        </p>

        {/* Tactical Footer Stats */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
           <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
              <span className="text-[9px] font-black text-white uppercase italic">Secure Access</span>
           </div>
           <div className="flex flex-col gap-1 items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">System Load</span>
              <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />)}
              </div>
           </div>
        </div>

        {/* Hover Terminal Mock */}
        <AnimatePresence>
           {showConsole && (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="absolute bottom-4 left-4 right-4 bg-black/90 p-4 rounded-xl border border-white/10 font-mono text-[8px] text-green-500 pointer-events-none"
              >
                 <div className="flex flex-col gap-1">
                    <p>{`> Initializing root_access_0.1p...`}</p>
                    <p>{`> Handshaking with Maharashtra_Node_4...`}</p>
                    <p>{`> Encryption: AES_256_GCM active`}</p>
                    <p className="animate-pulse">{`> Awaiting root_key_input_`}</p>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </motion.div>

      {/* Background Hover Terminal Frame */}
      <div className="absolute top-10 left-10 opacity-10 pointer-events-none hidden lg:block">
         <Terminal className="text-white" size={60} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none hidden lg:block">
         <Command className="text-white" size={60} strokeWidth={1} />
      </div>
    </div>
  );
}
