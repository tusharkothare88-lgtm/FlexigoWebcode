import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  User, 
  Smartphone, 
  ArrowRight, 
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  Plus,
  Cpu,
  Lock,
  Network,
  Eye,
  EyeOff
} from 'lucide-react';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import { requestForToken, onMessageListener } from '../../../lib/firebase';
import logo from '../../../assets/logo.png';

export default function FranchiseLogin() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, loginWithPassword, resetPassword } = useFranchiseAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Login Mode: 'otp', 'password', or 'reset'
  const [loginMode, setLoginMode] = useState('otp');
  
  // OTP States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ phone: '', otp: '', email: '', password: '', newPassword: '' });
  const [isErrorShake, setIsErrorShake] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setErrors({ ...errors, phone: 'INVALID_NUMBER' });
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
      return;
    }
    setLoading(true);
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) setOtpSent(true);
    else {
      setErrors({ ...errors, phone: res.message });
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) return;
    setLoading(true);
    const fcmToken = await requestForToken();
    const res = await verifyOTP(otp, fcmToken);
    setLoading(false);
    if (res.success) {
      if (res.franchise?.isRegistered || res.franchise?.kycStatus === 'approved') {
        navigate('/franchise/dashboard');
      } else {
        navigate('/franchise/onboarding');
      }
    }
    else {
      setErrors({ ...errors, otp: res.message });
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (res.success) {
      if (res.franchise?.isRegistered || res.franchise?.kycStatus === 'approved') {
        navigate('/franchise/dashboard');
      } else {
        navigate('/franchise/onboarding');
      }
    }
    else {
      setErrors({ ...errors, email: res.message });
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!phone || !otp || !newPassword) return;
    setLoading(true);
    const res = await resetPassword(phone, otp, newPassword);
    setLoading(false);
    if (res.success) {
      setLoginMode('password');
      setOtpSent(false);
      setPhone('');
      setOtp('');
      setNewPassword('');
    } else {
      setErrors({ ...errors, newPassword: res.message });
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  return (
    <div className="dark min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Architectural Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500 animate-pulse" style={{ top: '10%' }} />
         <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500 animate-pulse" style={{ top: '90%' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: isErrorShake ? [-8, 8, -8, 8, 0] : 0
        }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[360px] bg-slate-900 border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden shadow-emerald-950/20"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
           <Cpu size={120} className="text-emerald-500" />
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center relative z-10">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner scale-110">
            <img src={logo} alt="Flexigo" className="w-6 h-6 object-contain invert" />
          </div>
          <div className="space-y-1">
             <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
                NODE <span className="text-emerald-500">ACCESS</span>
             </h1>
             <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.4em] italic opacity-60">
                Authorized Access Protocol
             </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-8 relative z-10">
          <button 
            onClick={() => setLoginMode('otp')}
            className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMode === 'otp' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40' : 'text-slate-500 hover:text-white'}`}
          >
            OTP Security
          </button>
          <button 
            onClick={() => { setLoginMode('password'); setOtpSent(false); }}
            className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMode === 'password' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40' : 'text-slate-500 hover:text-white'}`}
          >
            Vault Password
          </button>
          <button 
            onClick={() => { setLoginMode('reset'); setOtpSent(false); }}
            className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMode === 'reset' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40' : 'text-slate-500 hover:text-white'}`}
          >
            Reset
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (loginMode === 'otp') {
              if(!otpSent) handleSendOTP(e);
              else handleVerifyOTP(e);
            } else if (loginMode === 'reset') {
              if(!otpSent) handleSendOTP(e);
              else handleResetPassword(e);
            } else {
              handlePasswordLogin(e);
            }
          }} 
          className="space-y-4 relative z-10"
        >
          {loginMode === 'otp' || loginMode === 'reset' ? (
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 italic opacity-60">Mobile Number</label>
                  </div>
                  <div className={`p-3 bg-black/30 border rounded-xl flex items-center gap-3 transition-all ${errors.phone ? 'border-rose-500/40' : 'border-white/5 focus-within:border-emerald-500/40'}`}>
                    <Smartphone className="text-slate-500" size={14} />
                    <input 
                      required
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="bg-transparent border-none outline-none text-[10px] text-[var(--text-primary)] w-full font-black tracking-widest italic"
                      placeholder="ENTER REGISTERED MOBILE"
                    />
                  </div>
               </div>

               {otpSent && (
                 <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 italic opacity-60">Security OTP</label>
                    </div>
                    <div className={`p-3 bg-black/30 border rounded-xl flex items-center gap-3 transition-all ${errors.otp ? 'border-rose-500/40' : 'border-white/5 focus-within:border-emerald-500/40'}`}>
                      <Lock className="text-slate-500" size={14} />
                      <input 
                        required
                        type="text" 
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="bg-transparent border-none outline-none text-[10px] text-[var(--text-primary)] w-full font-black tracking-[0.6em] italic"
                        placeholder="••••••"
                      />
                    </div>
                 </div>
               )}

               {otpSent && loginMode === 'reset' && (
                 <div className="space-y-1.5 mt-4">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 italic opacity-60">New Password</label>
                    </div>
                    <div className={`p-3 bg-black/30 border rounded-xl flex items-center gap-3 transition-all ${errors.newPassword ? 'border-rose-500/40' : 'border-white/5 focus-within:border-emerald-500/40'}`}>
                      <Lock className="text-slate-500" size={14} />
                      <input 
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] text-[var(--text-primary)] w-full font-black tracking-[0.6em] italic"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 italic opacity-60 ml-1">Email Identity</label>
                  <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3 focus-within:border-emerald-500/40 transition-all">
                    <User className="text-slate-500" size={14} />
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none outline-none text-[10px] text-[var(--text-primary)] w-full font-black tracking-widest italic"
                      placeholder="ENTER EMAIL ADDRESS"
                    />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 italic opacity-60 ml-1">Vault Password</label>
                  <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3 focus-within:border-emerald-500/40 transition-all">
                    <Lock className="text-slate-500" size={14} />
                    <input 
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent border-none outline-none text-[10px] text-[var(--text-primary)] w-full font-black tracking-widest italic"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
               </div>
            </div>
          )}

          <p className="mt-4 text-center text-[10px] text-slate-500">
             By continuing, you agree to our{' '}
             <a href="https://flexigoemobility.com/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Terms of Service</a> &amp;{' '}
             <a href="https://flexigoemobility.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Privacy Policy</a>
          </p>

          <button 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 italic group mt-6"
          >
            {loading ? 'AUTHENTICATING...' : (
              <>
                {loginMode === 'otp' ? (otpSent ? 'VERIFY ACCESS' : 'INITIALIZE SESSION') : loginMode === 'reset' ? (otpSent ? 'RESET PASSWORD' : 'SEND RESET OTP') : 'UNLOCK VAULT'} 
                <Network size={12} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {otpSent && loginMode === 'otp' && (
             <button 
                type="button"
                onClick={handleSendOTP}
                className="w-full text-[7.5px] font-black text-emerald-500 uppercase italic tracking-[0.2em] text-center"
             >
                RESEND OTP
             </button>
          )}

          <button 
            type="button"
            onClick={() => navigate('/franchise/onboarding')}
            className="w-full text-[7.5px] font-black text-slate-500 hover:text-white uppercase italic tracking-[0.3em] transition-all py-2"
          >
            CREATE NEW NODE +
          </button>
        </form>
      </motion.div>
    </div>
  );
}
