import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { OTPInput } from '../components/AnimatedInput';
import { NeonButton } from '../components/NeonButton';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { requestForToken, onMessageListener } from '../../../lib/firebase';
import { useEffect } from 'react';

export default function AuthOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const { phone, verifyOTP } = useAuthStore();
  const { theme } = useThemeStore();
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const isDark = theme === 'dark';
  const isValid = otp.length === 6;

  const handleVerify = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');

    // Fetch FCM Token
    const fcmToken = await requestForToken();
    const result = await verifyOTP(otp, fcmToken);
    setLoading(false);

    if (result.success) {
      if (result.rider?.isRegistered || result.rider?.kycStatus === 'approved') {
        setToastMsg("Welcome Back! Already Registered.");
        setTimeout(() => navigate('/rider/home'), 1500);
      } else {
        setToastMsg("Welcome! New Rider Signup.");
        setTimeout(() => navigate('/rider/onboarding'), 1500);
      }
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    onMessageListener().then(payload => {
      console.log('🔔 Rider App Notification:', payload);
    }).catch(err => console.log('failed: ', err));
  }, []);

  const handleResend = async () => {
    setLoading(true);
    const result = await useAuthStore.getState().sendOTP(phone);
    setLoading(false);
    if (result.success) {
      setResent(true);
      setOtp('');
      setTimeout(() => setResent(false), 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <PageWrapper noHeader>
      <div className={`min-h-[100dvh] flex flex-col px-6 pt-16 pb-10 transition-colors duration-500 relative overflow-hidden ${isDark ? 'bg-[#0A0A0F]' : 'bg-slate-50'
        }`}>

        {/* Custom Professional Toast */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className={`fixed top-12 left-1/2 z-[999] px-6 py-3.5 rounded-full shadow-2xl border backdrop-blur-xl flex items-center gap-3 w-max max-w-[90vw] ${isDark ? 'bg-[#0A0A0F]/90 border-flexigo-teal/30 text-white shadow-flexigo-teal/10' : 'bg-white/90 border-flexigo-teal/20 text-slate-900 shadow-slate-200/50'
                }`}
            >
              <div className="w-7 h-7 rounded-full bg-flexigo-teal flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(57,255,20,0.4)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 transition-colors mb-12 w-fit ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center flex flex-col items-center"
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all mx-auto ${isDark
              ? 'bg-flexigo-teal/10 border border-flexigo-teal/30 shadow-neon-sm'
              : 'bg-flexigo-teal/5 border border-flexigo-teal/20 shadow-sm'
              }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2" className="w-7 h-7">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={`text-3xl font-heading font-black mb-2 transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>Verify OTP</h1>
          <p className={`text-sm transition-colors duration-500 max-w-[260px] ${isDark ? 'text-gray-500' : 'text-slate-500'
            }`}>
            We sent a 6-digit code to{' '}
            <span className={`font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>+91 {phone}</span>
          </p>
        </motion.div>

        {/* OTP Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <OTPInput length={6} value={otp} onChange={setOtp} />
        </motion.div>

        {/* Resend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          {resent ? (
            <span className="text-flexigo-teal text-sm font-black uppercase tracking-widest">OTP Resent Successfully ✓</span>
          ) : (
            <button
              onClick={handleResend}
              className={`text-sm transition-colors duration-500 ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Didn't receive it?{' '}
              <span className="text-flexigo-teal font-black underline underline-offset-4 decoration-flexigo-teal/30">Resend OTP</span>
            </button>
          )}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-500 text-xs font-black uppercase text-center mb-6"
          >
            {error}
          </motion.p>
        )}

        {/* Dev hint removed as dynamic OTP is active */}

        <NeonButton
          variant={isValid ? 'solid' : 'green'}
          size="full"
          onClick={handleVerify}
          disabled={!isValid || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className={`${isDark ? 'text-black' : 'text-black'} animate-spin w-4 h-4`} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              Verifying...
            </span>
          ) : 'Verify & Continue →'}
        </NeonButton>
      </div>
    </PageWrapper>
  );
}
