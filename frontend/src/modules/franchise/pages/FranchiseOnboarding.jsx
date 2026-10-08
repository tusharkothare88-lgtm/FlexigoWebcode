import React, { useState, useEffect } from 'react';
import {
   Building2,
   UserCheck,
   Smartphone,
   CheckCircle,
   ArrowRight,
   ChevronRight,
   ShieldCheck,
   Plus,
   Clock,
   MapPin,
   ArrowLeft,
   Briefcase,
   Zap,
   Globe,
   Upload,
   FileText,
   Target,
   CreditCard,
   Landmark,
   Layers,
   Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import { requestForToken } from '../../../lib/firebase';

export default function FranchiseOnboarding() {
   const navigate = useNavigate();
   const {
      phone: storePhone,
      sendOTP,
      verifyOTP,
      updateRegistration,
      registrationData,
      currentStep: persistedStep,
      setStep: setPersistedStep,
      isVerified: persistedVerified,
      setIsVerified: setPersistedVerified,
      generateAadhaarOTP,
      verifyAadhaarOTP,
      plans,
      fetchPlans
   } = useFranchiseAuthStore();

   const [step, setStep] = useState(persistedStep || 1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);

   useEffect(() => {
      if (step === 3) {
         fetchPlans();
      }
   }, [step]);

   // Aadhaar OTP States
   const [ekycLoading, setEkycLoading] = useState(false);
   const [ekycOtpSent, setEkycOtpSent] = useState(false);
   const [ekycClientId, setEkycClientId] = useState('');
   const [ekycOtp, setEkycOtp] = useState('');
   const [isAadhaarVerified, setIsAadhaarVerified] = useState(registrationData.ekycVerified || false);

   // Phone OTP States
   const [phone, setPhone] = useState(storePhone || '');
   const [otp, setOtp] = useState('');
   const [otpSent, setOtpSent] = useState(false);
   const [isVerified, setIsVerified] = useState(persistedVerified || false);
   const [otpError, setOtpError] = useState('');

   const [formData, setFormData] = useState({
      ownerName: registrationData.ownerName || '',
      email: registrationData.email || '',
      aadhaarNumber: registrationData.aadhaarNumber || '',
      panNumber: registrationData.panNumber || '',
      businessDetails: registrationData.businessDetails || { name: '', type: '', location: '', address: '' },
      hubPlan: registrationData.hubPlan || { id: '', name: '', price: 0 },
      bankDetails: registrationData.bankDetails || { beneficiary: '', accountNo: '', ifsc: '' },
      kycDocs: { gst: null, entity: null, aadhaar: null, pan: null }
   });

   useEffect(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#020617';
   }, []);

   // Update persisted step when local step changes
   useEffect(() => {
      setPersistedStep(step);

      // Push state so hardware back button doesn't leave the page immediately
      window.history.pushState({ franchiseStep: step }, '', window.location.href);

      const handlePopState = (e) => {
         if (step > 1) {
            // Prevent leaving page, go back one step
            setStep(prev => prev - 1);
         } else {
            // Allow leaving if on step 1
            navigate(-1);
         }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
   }, [step, navigate]);

   // Update persisted verified status
   useEffect(() => {
      setPersistedVerified(isVerified);
   }, [isVerified]);

   const steps = [
      { id: 1, label: 'Profile', icon: Fingerprint },
      { id: 2, label: 'Business', icon: Building2 },
      { id: 3, label: 'Hub Plan', icon: Layers },
      { id: 4, label: 'Payments', icon: Landmark },
      { id: 5, label: 'KYC', icon: ShieldCheck },
      { id: 6, label: 'Review', icon: Target },
   ];

   const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => resolve(reader.result);
         reader.onerror = (error) => reject(error);
      });
   };

   const handleSendOTP = async () => {
      if (phone.length !== 10) {
         setOtpError('ENTER_VALID_PHONE');
         return;
      }
      setIsSubmitting(true);
      const res = await sendOTP(phone);
      setIsSubmitting(false);
      if (res.success) setOtpSent(true);
      else setOtpError(res.message);
   };

   const handleEkycGenerateOTP = async () => {
      if (formData.aadhaarNumber.length !== 12) return;
      setEkycLoading(true);
      const res = await generateAadhaarOTP(formData.aadhaarNumber);
      setEkycLoading(false);
      if (res.success) {
         setEkycOtpSent(true);
         setEkycClientId(res.client_id);
      } else {
         alert(res.message);
      }
   };

   const handleEkycVerifyOTP = async () => {
      if (ekycOtp.length !== 6) return;
      setEkycLoading(true);
      const res = await verifyAadhaarOTP(ekycClientId, ekycOtp);
      setEkycLoading(false);
      if (res.success) {
         setIsAadhaarVerified(true);
         setEkycOtpSent(false);
         setFormData(prev => ({ ...prev, ownerName: res.data.full_name }));
      } else {
         alert(res.message);
      }
   };

   const handleVerifyOTP = async () => {
      setIsSubmitting(true);

      // Fetch FCM Token
      const fcmToken = await requestForToken();
      const res = await verifyOTP(otp, fcmToken);

      setIsSubmitting(false);
      if (res.success) {
         setIsVerified(true);
         if (res.franchise.isRegistered) {
            navigate('/franchise/dashboard');
         }
      } else {
         setOtpError(res.message);
      }
   };

   const handleNext = async () => {
      // Optionally save state to backend at each step
      setStep(prev => prev + 1);
   };

   const handlePrev = () => setStep(prev => prev - 1);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         const kycDetails = {
            aadhaarFront: formData.kycDocs.aadhaar ? await fileToBase64(formData.kycDocs.aadhaar) : null,
            panCard: formData.kycDocs.pan ? await fileToBase64(formData.kycDocs.pan) : null,
            businessLicense: formData.kycDocs.gst ? await fileToBase64(formData.kycDocs.gst) : null,
            // entity is extra, mapped to businessLicense for now
         };

         const res = await updateRegistration({
            ...formData,
            phone,
            kycDetails,
            markAsRegistered: true
         });

         if (res.success) {
            setIsSuccess(true);
         } else {
            alert(res.message);
         }
      } catch (error) {
         alert('ERROR_PROCESSING_PAYLOAD');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="dark min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden text-[var(--text-primary)]">
         {/* Background Decor */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
         <div className="absolute inset-x-0 top-0 h-[1px] bg-emerald-500/10" />

         {isSuccess ? (
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-md bg-slate-900 border border-emerald-500/20 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden shadow-emerald-950/20"
            >
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Zap size={140} className="text-emerald-500" />
               </div>
               <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/20">
                  <CheckCircle size={32} className="text-emerald-500" />
               </div>
               <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-3">ONBOARDING_LOCKED</h2>
               <p className="text-[7.5px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] leading-relaxed mb-10 italic opacity-60 max-w-[280px] mx-auto">
                  Your franchise node protocol has been committed to the <span className="text-emerald-500">ROOT_CONTROL</span>. Validation phase active.
               </p>
               <button
                  onClick={() => navigate('/franchise')}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[8px] font-black uppercase tracking-[0.4em] shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3 italic group"
               >
                  ACCESS_DASHBOARD <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
         ) : (
            <div className="w-full max-w-xl">
               {/* Logo & Header */}
               <div className="flex flex-col items-center mb-8 text-center relative z-10">
                  <div className="w-10 h-10 bg-slate-900 border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-black/40">
                     <img src={logo} alt="Flexigo" className="w-6 h-6 object-contain invert opacity-80" />
                  </div>
                  <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none">
                     Franchise <span className="text-emerald-500">Registration</span>
                  </h1>
                  <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.4em] mt-2 italic opacity-60">
                     Step 1: Hub Partner Onboarding
                  </p>
               </div>

               <div className="bg-slate-900 border border-[var(--border-subtle)] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden shadow-black/40">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-12 relative px-2">
                     <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/5 -translate-y-1/2 rounded-full" />
                     <div
                        className="absolute top-1/2 left-4 h-[1px] bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 96}%` }}
                     />
                     {steps.map((s) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                           <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-inner ${isActive ? 'bg-emerald-600 text-white shadow-emerald-950/50 scale-110' :
                                 isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                    'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-slate-700'
                                 }`}>
                                 {isCompleted ? <CheckCircle size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={isActive ? 3 : 2} />}
                              </div>
                              <span className={`text-[6.5px] font-black uppercase tracking-[0.2em] italic ${isActive ? 'text-emerald-500' : 'text-slate-800'}`}>
                                 {s.label}
                              </span>
                           </div>
                        );
                     })}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                     {step === 1 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           {!isVerified ? (
                              <div className="space-y-6 max-w-sm mx-auto py-4">
                                 <div className="space-y-1 text-center mb-8">
                                    <h3 className="text-xl font-black text-emerald-500 uppercase italic tracking-tight">Identity Access</h3>
                                    <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest italic leading-relaxed">Enter credentials for secure onboarding session</p>
                                 </div>

                                 <div className="space-y-4">
                                    <div className="space-y-1.5 relative z-50">
                                       <label className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest ml-1 italic">Authorized Phone Number</label>
                                       <div className="relative">
                                          <input
                                             required
                                             type="tel"
                                             value={phone}
                                             onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                             className={`w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-black text-white italic tracking-[0.2em] placeholder:text-slate-800 outline-none focus:border-emerald-500/40 transition-all ${otpSent ? 'opacity-50' : 'cursor-text'}`}
                                             placeholder="ENTER 10-DIGIT NUMBER"
                                             readOnly={otpSent}
                                          />
                                          {!otpSent && (
                                             <button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={isSubmitting || phone.length < 10}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[7px] font-black uppercase rounded-xl transition-all disabled:opacity-30 italic shadow-xl z-50"
                                             >
                                                SEND CODE
                                             </button>
                                          )}
                                       </div>
                                    </div>

                                    {otpSent && (
                                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                          <div className="space-y-1.5">
                                             <label className="text-[7px] font-black text-blue-500/60 uppercase tracking-widest ml-1 italic">Validation Key</label>
                                             <input
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-2xl font-black text-emerald-500 text-center tracking-[1em] outline-none shadow-inner focus:border-emerald-500/20"
                                                placeholder="••••••"
                                             />
                                          </div>
                                          <button
                                             onClick={handleVerifyOTP}
                                             disabled={isSubmitting || otp.length < 6}
                                             className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase rounded-2xl transition-all shadow-xl shadow-emerald-950/40 italic flex items-center justify-center gap-3 group"
                                          >
                                             INITIALIZE_SESSION <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                          </button>
                                          <button
                                             type="button"
                                             onClick={handleSendOTP}
                                             disabled={isSubmitting}
                                             className="w-full py-1 text-[7.5px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest italic transition-colors mt-2"
                                          >
                                             RESEND_OTP
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => { setOtpSent(false); setOtp(''); }}
                                             className="w-full py-1 text-[7px] font-black text-slate-700 hover:text-white uppercase tracking-widest italic transition-colors"
                                          >
                                             USE_DIFFERENT_NUMBER
                                          </button>
                                       </motion.div>
                                    )}

                                    {otpError && (
                                       <p className="text-[7px] font-black text-rose-500 text-center uppercase tracking-widest animate-pulse italic mt-2">{otpError}</p>
                                    )}
                                 </div>
                              </div>
                           ) : (
                              <div className="space-y-6">
                                 <div className="space-y-0.5">
                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Personal Details</h3>
                                    <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Owner Information & Contact</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 space-y-1.5">
                                       <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Full Legal Name</label>
                                       <input
                                          required
                                          disabled={isAadhaarVerified}
                                          value={formData.ownerName}
                                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                          className={`w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20 ${isAadhaarVerified ? 'opacity-70' : ''}`}
                                          placeholder="ENTER FULL NAME..."
                                       />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                       <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Aadhaar Number (eKYC)</label>
                                       <div className="flex gap-2">
                                          <div className={`flex-1 flex items-center gap-3 px-4 py-2.5 bg-black/20 border ${isAadhaarVerified ? 'border-emerald-500' : 'border-[var(--border-subtle)]'} rounded-xl transition-all shadow-inner`}>
                                             <Fingerprint size={14} className={isAadhaarVerified ? 'text-emerald-500' : 'text-slate-700'} />
                                             <input
                                                required
                                                disabled={isAadhaarVerified}
                                                value={formData.aadhaarNumber}
                                                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                                className="bg-transparent border-none outline-none text-[9px] font-black text-[var(--text-primary)] tracking-widest w-full placeholder:text-slate-800 italic"
                                                placeholder="12 DIGIT AADHAAR"
                                             />
                                             {isAadhaarVerified && <CheckCircle size={14} className="text-emerald-500" />}
                                          </div>
                                          {!isAadhaarVerified && !ekycOtpSent && (
                                             <button
                                                type="button"
                                                onClick={handleEkycGenerateOTP}
                                                disabled={formData.aadhaarNumber.length !== 12 || ekycLoading}
                                                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[7px] font-black uppercase rounded-xl transition-all disabled:opacity-30 italic shadow-xl"
                                             >
                                                {ekycLoading ? '...' : 'VERIFY'}
                                             </button>
                                          )}
                                       </div>

                                       {ekycOtpSent && !isAadhaarVerified && (
                                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 mt-2">
                                             <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-black/40 border border-emerald-500/30 rounded-xl shadow-inner">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                                <input
                                                   value={ekycOtp}
                                                   onChange={(e) => setEkycOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                   className="bg-transparent border-none outline-none text-lg font-black text-emerald-500 tracking-[0.5em] w-full placeholder:text-slate-800 italic"
                                                   placeholder="OTP"
                                                />
                                             </div>
                                             <button
                                                type="button"
                                                onClick={handleEkycVerifyOTP}
                                                disabled={ekycOtp.length !== 6 || ekycLoading}
                                                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[7px] font-black uppercase rounded-xl transition-all disabled:opacity-30 italic shadow-xl"
                                             >
                                                {ekycLoading ? '...' : 'CONFIRM'}
                                             </button>
                                          </motion.div>
                                       )}

                                       {ekycOtpSent && !isAadhaarVerified && (
                                          <button
                                             type="button"
                                             onClick={handleEkycGenerateOTP}
                                             disabled={ekycLoading}
                                             className="text-[7px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest italic mt-2 ml-1"
                                          >
                                             RESEND_AADHAAR_OTP
                                          </button>
                                       )}
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">PAN Card Number</label>
                                       <input
                                          required
                                          value={formData.panNumber}
                                          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                          className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                          placeholder="ABCDE1234F"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Mobile Number</label>
                                       <input
                                          required
                                          type="tel"
                                          value={phone}
                                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                          className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                          placeholder="ENTER 10-DIGIT MOBILE"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Email Address</label>
                                       <input
                                          required
                                          type="email"
                                          value={formData.email}
                                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                          className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] lowercase tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                          placeholder="partner@domain.com"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     )}

                     {step === 2 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Business Profile</h3>
                              <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Company & Hub Details</p>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2 space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Business Name</label>
                                 <input
                                    required
                                    value={formData.businessDetails.name}
                                    onChange={(e) => setFormData({ ...formData, businessDetails: { ...formData.businessDetails, name: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="FIRM IDENTITY"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">GST Number</label>
                                 <input
                                    required
                                    value={formData.businessDetails.type}
                                    onChange={(e) => setFormData({ ...formData, businessDetails: { ...formData.businessDetails, type: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="29XXXXX"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Operational City</label>
                                 <input
                                    required
                                    value={formData.businessDetails.location}
                                    onChange={(e) => setFormData({ ...formData, businessDetails: { ...formData.businessDetails, location: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="BANGALORE"
                                 />
                              </div>
                              <div className="col-span-2 space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Hub Address</label>
                                 <textarea
                                    rows={2}
                                    required
                                    value={formData.businessDetails.address}
                                    onChange={(e) => setFormData({ ...formData, businessDetails: { ...formData.businessDetails, address: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20 no-scrollbar"
                                    placeholder="Enter complete hub location address..."
                                 />
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Select Plan</h3>
                              <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Choose your hub scale</p>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {plans && plans.length > 0 ? plans.map((tier) => (
                                 <div
                                    key={tier._id || tier.id}
                                    onClick={() => {
                                       const planId = tier._id || tier.id;
                                       const planData = { id: planId, name: tier.name, price: tier.price };
                                       setFormData({ ...formData, hubPlan: planData });
                                       updateRegistration({ hubPlan: planData, phone });
                                    }}
                                    className={`p-4 bg-black/20 border rounded-2xl transition-all cursor-pointer group relative overflow-hidden shadow-inner ${formData.hubPlan.id === (tier._id || tier.id) ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[var(--border-subtle)] hover:border-emerald-500/20'
                                       }`}
                                 >
                                    <div className="text-[6px] font-black uppercase tracking-[0.3em] mb-3 italic text-emerald-500">{tier.name}</div>
                                    <div className="text-xl font-black text-[var(--text-primary)] uppercase italic mb-1 leading-none">₹{(tier.price / 1000).toFixed(0)}K</div>
                                    <div className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Monthly Plan Fee</div>
                                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                                       <span className="text-[7px] font-black text-[var(--text-tertiary)] italic uppercase">
                                          {tier.features && tier.features[0] ? tier.features[0] : 'Standard Fleet'}
                                       </span>
                                       <div className={`w-4 h-4 rounded-lg border flex items-center justify-center transition-all ${formData.hubPlan.id === (tier._id || tier.id) ? 'border-emerald-500' : 'border-[var(--border-subtle)] group-hover:border-emerald-500'
                                          }`}>
                                          <div className={`w-1.5 h-1.5 rounded transition-all ${formData.hubPlan.id === (tier._id || tier.id) ? 'bg-emerald-500 opacity-100 shadow-[0_0_8px_#10b981]' : 'bg-emerald-500 opacity-0 group-hover:opacity-10'
                                             }`} />
                                       </div>
                                    </div>
                                 </div>
                              )) : (
                                 <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] opacity-40">
                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] italic animate-pulse">Syncing with Plan Registry...</div>
                                 </div>
                              )}
                           </div>
                        </motion.div>
                     )}

                     {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Bank Information</h3>
                              <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Payment and Settlement Details</p>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2 space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Beneficiary Name</label>
                                 <input
                                    required
                                    value={formData.bankDetails.beneficiary}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, beneficiary: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="NAME AS PER BANK"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">Account Number</label>
                                 <input
                                    required
                                    type="text"
                                    value={formData.bankDetails.accountNo}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNo: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="XXXX XXXX XXXX"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic opacity-40">IFSC Code</label>
                                 <input
                                    required
                                    value={formData.bankDetails.ifsc}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifsc: e.target.value } })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] tracking-widest outline-none transition-all placeholder:text-slate-800 italic shadow-inner focus:border-emerald-500/20"
                                    placeholder="UTIBXXXX"
                                 />
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {step === 5 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Upload Documents</h3>
                              <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Verification and KYC Documents</p>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              {[
                                 { name: 'GST Certificate', key: 'gst' },
                                 { name: 'Registration Proof', key: 'entity' },
                                 { name: 'Aadhaar Copy', key: 'aadhaar' },
                                 { name: 'PAN Card Copy', key: 'pan' }
                              ].map((doc) => (
                                 <div key={doc.key} className="relative group">
                                    <input
                                       type="file"
                                       id={`upload-${doc.key}`}
                                       className="hidden"
                                       accept=".pdf,.jpg,.jpeg,.png"
                                       onChange={(e) => setFormData({ ...formData, kycDocs: { ...formData.kycDocs, [doc.key]: e.target.files[0] } })}
                                    />
                                    <label
                                       htmlFor={`upload-${doc.key}`}
                                       className={`w-full p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all cursor-pointer shadow-inner group ${formData.kycDocs[doc.key] ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:border-emerald-500/20 hover:bg-emerald-500/5'
                                          }`}
                                    >
                                       <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-inner ${formData.kycDocs[doc.key] ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-slate-700'
                                          }`}>
                                          {formData.kycDocs[doc.key] ? <CheckCircle size={14} /> : <Upload size={14} />}
                                       </div>
                                       <div className="text-center">
                                          <p className="text-[7.5px] font-black text-[var(--text-primary)] uppercase tracking-widest italic mb-0.5">{doc.name}</p>
                                          <p className={`text-[6.5px] font-black uppercase tracking-widest opacity-60 ${formData.kycDocs[doc.key] ? 'text-emerald-500' : 'text-slate-700'}`}>
                                             {formData.kycDocs[doc.key] ? 'UPLOADED_✓' : 'PDF/JPEG_AUTH'}
                                          </p>
                                       </div>
                                    </label>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {step === 6 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                           <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">Final Review</h3>
                              <p className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic opacity-60">Confirm your application</p>
                           </div>
                           <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-[2rem] p-6 space-y-6 relative overflow-hidden shadow-inner">
                              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 pointer-events-none">
                                 <Target size={100} />
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <Globe size={20} />
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-[7.5px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">Ready for Verification</p>
                                    <h4 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none">Hub Registration Complete</h4>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="flex items-center gap-2.5 p-3.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl shadow-inner">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[8px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Data Verified</span>
                                 </div>
                                 <div className="flex items-center gap-2.5 p-3.5 bg-black/20 border border-[var(--border-subtle)] rounded-xl shadow-inner">
                                    <Briefcase size={14} className="text-emerald-500" />
                                    <span className="text-[8px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">BILLING_SYNCED</span>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     <div className="flex gap-3 pt-6 border-t border-[var(--border-subtle)]">
                        {step > 1 && (
                           <button
                              type="button"
                              onClick={handlePrev}
                              className="px-6 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] rounded-xl text-[8px] font-black uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all italic shadow-inner"
                           >
                              BACK
                           </button>
                        )}
                        {(step > 1 || isVerified) && (
                           <button
                              type={step === 6 ? 'submit' : 'button'}
                              onClick={step === 6 ? undefined : handleNext}
                              disabled={isSubmitting}
                              className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.4em] shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3 italic relative overflow-hidden group"
                           >
                              {isSubmitting ? (
                                 <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span className="animate-pulse">AUTHORIZING_PAYLOAD...</span>
                                 </div>
                              ) : (
                                 <>
                                    {step === 6 ? 'Submit Application' : 'Continue'} <ChevronRight size={14} />
                                 </>
                              )}
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                           </button>
                        )}
                     </div>
                  </form>
               </div>

               <div className="mt-8 flex items-center justify-center gap-6 opacity-30 italic">
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={10} className="text-emerald-500" />
                     <span className="text-[7.5px] font-black text-[var(--text-primary)] uppercase tracking-widest">Secure Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FileText size={10} className="text-emerald-500" />
                     <span className="text-[7.5px] font-black text-[var(--text-primary)] uppercase tracking-widest">Partner Policy Applied</span>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
