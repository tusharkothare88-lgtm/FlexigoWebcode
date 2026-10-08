import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import api from '../../../lib/axios';

export default function SubscriptionPlans() {
  const { plans, selectedPlan, selectPlan, activePlan, activatePlan, fetchPlans } = useSubscriptionStore();
  const { user, fetchProfile } = useAuthStore();
  const { balance, fetchWalletData } = useWalletStore();

  const [systemSettings, setSystemSettings] = useState({ securityDepositAmount: 2800 });

  useEffect(() => {
    fetchPlans();
    if (user?.phone) {
      fetchWalletData(user.phone);
      fetchProfile();
    }
    const fetchSettings = async () => {
      try {
        const res = await api.get('/rider/settings');
        if (res.data.success) {
          setSystemSettings({ securityDepositAmount: res.data.securityDepositAmount || 2800 });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, [user?.phone]);

  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [isPaying, setIsPaying] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('RAZORPAY');

  const handleUpdatePlan = () => {
    if (!selectedPlan || !user) return;
    setIsPaying(true);
  };

  const handleWalletPayment = async () => {
    if (balance < selectedPlan.price) {
      alert("Insufficient wallet balance! Please add money to your wallet.");
      return;
    }

    try {
      const res = await api.post('/rider/payments/wallet', {
        planId: selectedPlan.id,
        phone: user.phone
      });

      if (res.data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          activatePlan(selectedPlan);
          setIsPaying(false);
          setPaymentSuccess(false);
          selectPlan(null);
          window.location.reload();
        }, 4500);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Wallet payment failed!");
    }
  };

  const [showQRCode, setShowQRCode] = useState(false);
  const [qrSubmitted, setQrSubmitted] = useState(false);

  const handleQRPayment = () => {
    setShowQRCode(true);
  };

  const handleQRPaid = async () => {
    try {
      const res = await api.post('/rider/payments/qr-request', {
        planId: selectedPlan.id,
        phone: user.phone
      });

      if (res.data.success) {
        setQrSubmitted(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit payment request.");
    }
  };

  const handleOpenRazorpay = async () => {
    if (selectedMethod === 'WALLET') {
      return handleWalletPayment();
    }

    if (selectedMethod === 'UPI_QR') {
      return handleQRPayment();
    }

    try {
      const orderRes = await api.post('/rider/payments/create-order', {
        planId: selectedPlan.id,
        phone: user.phone
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      if (orderRes.data.amountPayable === 0) {
        return handleWalletPayment();
      }

      const orderData = orderRes.data.order;

      // 2. Open Razorpay Interface
      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ', // Hardcoded Live Key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Flexigo Mobility",
        description: `Upgrade to ${selectedPlan.label}`,
        order_id: orderData.id,
        handler: async (response) => {
          // 3. Verify Payment on Backend
          try {
            const verifyRes = await api.post('/rider/payments/verify', {
              ...response,
              planId: selectedPlan.id,
              phone: user.phone
            });

            if (verifyRes.data.success) {
              setPaymentSuccess(true);
              setTimeout(() => {
                activatePlan(selectedPlan);
                setIsPaying(false);
                setPaymentSuccess(false);
                selectPlan(null);
                window.location.reload();
              }, 4500);
            }
          } catch (err) {
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: user?.name || "Rider",
          email: user?.email || "rider@flexigo.in",
          contact: user?.phone
        },
        theme: {
          color: "#39FF14"
        },
        modal: {
          ondismiss: () => { }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment Initiation Failed!");
    }
  };

  const handleFinalPayment = () => {
    handleOpenRazorpay();
  };

  const paymentMethods = [
    { id: 'RAZORPAY', label: balance > 0 ? 'Razorpay + Redeem Amount' : 'Razorpay UPI', sub: balance > 0 ? 'Redeem Amount auto-applied' : 'Instant Online Payment', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg> },
  ];

  const depositMethods = [
    { id: 'RAZORPAY', label: 'Razorpay UPI', sub: 'Instant Online Payment', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg> },
  ];

  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [depositPaymentSuccess, setDepositPaymentSuccess] = useState(false);
  const [depositMethod, setDepositMethod] = useState('RAZORPAY');
  const [showDepositQRCode, setShowDepositQRCode] = useState(false);

  const handleDepositWallet = async () => {
    if (balance < systemSettings.securityDepositAmount) { alert("Insufficient wallet balance!"); return; }
    try {
      const res = await api.post('/rider/payments/deposit/wallet', { phone: user.phone, planId: selectedPlan?.id });
      if (res.data.success) {
        setDepositPaymentSuccess(true);
        setTimeout(() => { setIsPayingDeposit(false); fetchProfile(); }, 3000);
      }
    } catch (err) { alert(err.response?.data?.message || "Wallet payment failed!"); }
  };

  const handleDepositQR = async () => {
    try {
      const res = await api.post('/rider/payments/deposit/qr-request', { phone: user.phone, planId: selectedPlan?.id });
      if (res.data.success) {
        alert("Deposit QR request submitted.");
        setIsPayingDeposit(false); setShowDepositQRCode(false);
      }
    } catch (e) { alert("Failed QR request"); }
  };

  const handleDepositRazorpay = async () => {
    if (depositMethod === 'WALLET') return handleDepositWallet();
    if (depositMethod === 'UPI_QR') { setShowDepositQRCode(true); return; }
    try {
      const orderRes = await api.post('/rider/payments/deposit/create-order', { phone: user.phone, planId: selectedPlan?.id });

      if (orderRes.data.amountPayable === 0) {
        return handleDepositWallet();
      }

      const orderData = orderRes.data.order;
      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ', // Hardcoded Live Key
        amount: orderData.amount, currency: orderData.currency,
        name: "Flexigo Mobility", description: "Security Deposit", order_id: orderData.id,
        handler: async (response) => {
          const verifyRes = await api.post('/rider/payments/deposit/verify', { ...response, phone: user.phone, planId: selectedPlan?.id });
          if (verifyRes.data.success) {
            setDepositPaymentSuccess(true);
            setTimeout(() => { setIsPayingDeposit(false); fetchProfile(); }, 3000);
          }
        },
        prefill: { name: user.name, email: user.email || "rider@flexigo.in", contact: user.phone },
        theme: { color: "#39FF14" }
      };
      new window.Razorpay(options).open();
    } catch (e) { alert("Payment Failed"); }
  };

  const [addOffAmount, setAddOffAmount] = useState('');
  const [adhocDescription, setAdhocDescription] = useState('');

  const handleAddOffPayment = async () => {
    if (!addOffAmount || Number(addOffAmount) <= 0) return alert('Enter valid amount');
    try {
      const orderRes = await api.post('/rider/payments/add-off/create-order', { amount: Number(addOffAmount) });
      const orderData = orderRes.data.order;
      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ',
        amount: orderData.amount, currency: orderData.currency,
        name: "Flexigo Mobility", description: adhocDescription || "Adhoc Payment", order_id: orderData.id,
        handler: async (response) => {
          const verifyRes = await api.post('/rider/payments/add-off/verify', { ...response, amount: Number(addOffAmount), phone: user?.phone, description: adhocDescription });
          if (verifyRes.data.success) {
            alert('Adhoc Payment successful!');
            setAddOffAmount('');
            setAdhocDescription('');
            fetchProfile();
          }
        },
        prefill: { name: user?.name || "Rider", email: user?.email || "rider@flexigo.in", contact: user?.phone || "0000000000" },
        theme: { color: "#39FF14" }
      };
      new window.Razorpay(options).open();
    } catch (e) {
      console.error("Adhoc Payment Error:", e);
      alert('Payment failed: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <PageWrapper className="flex flex-col p-6 pt-6 pb-32">
      <AnimatePresence>
        {isPayingDeposit && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !depositPaymentSuccess && setIsPayingDeposit(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`relative w-full max-w-lg rounded-t-[2.5rem] p-8 pb-12 shadow-2xl border-t border-white/10 ${isDark ? 'bg-[#0A1120]' : 'bg-white'}`}>
              {depositPaymentSuccess ? (
                <div className="text-center py-6 space-y-6">
                  <h3 className={`text-2xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Deposit Paid!</h3>
                  <p className="text-flexigo-teal text-[11px] font-black uppercase">You can now purchase a plan.</p>
                </div>
              ) : showDepositQRCode ? (
                <div className="space-y-6 py-4 text-center">
                  <h3 className={`text-lg font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Scan & Pay <span className="text-flexigo-teal">₹{selectedPlan?.deposit || systemSettings.securityDepositAmount}</span></h3>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici&pn=Flexigo E-Mobility&am=${selectedPlan?.deposit || systemSettings.securityDepositAmount}&cu=INR&tn=Security Deposit`)}`} className="w-[220px] h-[220px] mx-auto" />
                  <button onClick={handleDepositQR} className="w-full py-3 bg-flexigo-teal text-white rounded-xl text-[9px] font-black uppercase">I Have Paid</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className={`text-2xl font-heading font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Checkout <span className="text-flexigo-teal">Deposit</span></h3>
                  <div className="space-y-2 mb-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)]">
                    <div className="flex justify-between text-xs font-black uppercase text-[var(--text-secondary)]">
                      <span>Total Deposit</span>
                      <span>₹{selectedPlan?.deposit || systemSettings.securityDepositAmount}</span>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-sm font-black uppercase text-[var(--text-primary)]">
                      <span>Net Payable</span>
                      <span>₹{selectedPlan?.deposit || systemSettings.securityDepositAmount}</span>
                    </div>
                  </div>
                  <NeonButton variant="solid" size="full" onClick={handleDepositRazorpay}>Complete Secure Purchase</NeonButton>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mb-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 bg-flexigo-teal rounded-full" />
          <h1 className={`text-3xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>Subscription <span className="text-flexigo-teal">Management</span></h1>
        </div>
        <p className={`text-xs ml-4 font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>Manage your fleet access and billing tiers.</p>
      </div>

      {/* Current Active Plan Banner */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] px-2 mb-3 transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-500'
            }`}>Current Active Plan</h3>
          <GlassCard className="p-6 border-flexigo-teal/30 bg-flexigo-teal/[0.03] relative overflow-hidden group shadow-2xl">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-flexigo-teal/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h4 className={`text-2xl font-heading font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activePlan.label} <span className="text-flexigo-teal">Tier</span>
                </h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-flexigo-teal mt-1">Status: Active & Verified</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{activePlan.price}</span>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">/ Monthly</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className={`space-y-4 flex-1`}>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] px-2 mb-2 transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-950 font-black'
          }`}>{activePlan ? 'Upgrade Options' : 'Available Plans'}</h3>

        {(Array.isArray(plans) ? plans : []).filter(p => p.id !== activePlan?.id).map((plan) => {
          const savedPlanId = user?.subscriptionPlan?._id || (typeof user?.subscriptionPlan === 'string' ? user?.subscriptionPlan : null);
          const hasSavedPlan = !!savedPlanId;
          const isThisPlanSaved = savedPlanId === plan.id;
          const isDisabled = hasSavedPlan && !isThisPlanSaved;

          return (
          <motion.div
            key={plan.id}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            className={isDisabled ? "opacity-50 grayscale" : ""}
          >
            <GlassCard
              className={`relative p-5 overflow-hidden transition-all duration-300 border shadow-lg ${selectedPlan?.id === plan.id
                ? 'border-flexigo-teal bg-flexigo-teal/5'
                : isDark ? 'border-white/05' : 'border-slate-300 bg-white'
                }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${selectedPlan?.id === plan.id ? 'bg-flexigo-teal/20 border-flexigo-teal/30' : (isDark ? 'bg-slate-500/5 border-white/05' : 'bg-slate-100 border-slate-200')
                    }`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={selectedPlan?.id === plan.id ? plan.color : '#6B7280'} strokeWidth="2.5" className="w-6 h-6">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-heading font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.label}</h3>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{plan.duration} Access</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {plan.perks.slice(0, 3).map((perk, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-500'
                    }`}>
                    <div className="w-1 h-1 rounded-full bg-flexigo-teal" />
                    {perk}
                  </div>
                ))}
              </div>

              <div className="space-y-4 mt-4 border-t border-white/10 pt-4">
                {/* Deposit Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Security Deposit</div>
                    <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{plan.deposit || systemSettings.securityDepositAmount}</div>
                  </div>
                  <NeonButton 
                    variant={user?.depositPaid && isThisPlanSaved ? "outline" : "solid"} 
                    size="sm" 
                    onClick={() => {
                       if (isDisabled) return;
                       if (user?.depositPaid && isThisPlanSaved) return;
                       selectPlan(plan);
                       setIsPayingDeposit(true);
                    }}
                    disabled={isDisabled || (user?.depositPaid && isThisPlanSaved)}
                    className={`px-4 py-1.5 text-[10px] min-w-[90px] ${user?.depositPaid && isThisPlanSaved ? 'opacity-50' : ''}`}
                  >
                    {user?.depositPaid && isThisPlanSaved ? 'Paid' : 'Pay Now'}
                  </NeonButton>
                </div>

                {/* Rental Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-[10px] font-black uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{plan.duration} Rental</div>
                    <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{plan.price}</div>
                  </div>
                  <NeonButton 
                    variant={!(user?.depositPaid && isThisPlanSaved) ? "outline" : "solid"} 
                    size="sm"
                    onClick={() => {
                       if (isDisabled) return;
                       if (!(user?.depositPaid && isThisPlanSaved)) {
                          alert("Please pay the Security Deposit for this plan first!");
                          return;
                       }
                       selectPlan(plan);
                       handleUpdatePlan();
                    }}
                    disabled={isDisabled || !(user?.depositPaid && isThisPlanSaved)}
                    className="px-4 py-1.5 text-[10px] min-w-[90px]"
                  >
                    Pay Now
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          );
        })}
      </div>



      {/* Adhoc Payment Section (Always Visible) */}
      <div className="mt-8">
        <GlassCard className={`p-4 border shadow-md ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Adhoc Payment</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={addOffAmount}
                  onChange={(e) => setAddOffAmount(e.target.value)}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:border-flexigo-teal transition-all`}
                />
                <button
                  type="button"
                  onClick={handleAddOffPayment}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  PAY NOW
                </button>
              </div>
              <input
                type="text"
                placeholder="Payment Description (Optional)"
                value={adhocDescription}
                onChange={(e) => setAdhocDescription(e.target.value)}
                className={`w-full rounded-xl px-4 py-2 text-xs font-bold border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:border-flexigo-teal transition-all`}
              />
            </div>
          </div>
        </GlassCard>
      </div>



      <AnimatePresence>
        {isPaying && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !paymentSuccess && !showRazorpay && setIsPaying(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative w-full max-w-lg rounded-t-[2.5rem] p-8 pb-12 shadow-2xl border-t border-white/10 ${isDark ? 'bg-[#0A1120]' : 'bg-white'
                }`}
            >
              {paymentSuccess ? (
                <div className="text-center py-6 space-y-6">
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-flexigo-teal/20 border-2 border-flexigo-teal rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="4" className="w-10 h-10">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>

                  {/* Thank You Text */}
                  <div className="space-y-1">
                    <h3 className={`text-2xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Thank You!
                    </h3>
                    <p className="text-flexigo-teal text-[11px] font-black uppercase tracking-[0.25em]">
                      Payment Successful
                    </p>
                    <p className={`text-[10px] font-bold mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Thank you for your payment to{' '}
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Flexigo Pvt. Limited
                      </span>
                    </p>
                    <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                      Your subscription has been activated successfully.
                    </p>
                  </div>

                  {/* Office Address Card */}
                  <div className={`text-left rounded-2xl p-4 border space-y-2 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-4 h-4 shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-[9px] font-black uppercase tracking-widest text-flexigo-teal">Vehicle Pickup Office</span>
                    </div>
                    <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Phase 2, Shop Number 3, Baner Rd,<br />
                      Behind Domino's, Veerbhadra Nagar,<br />
                      Baner, Pune,<br />
                      Maharashtra – 411069, India
                    </p>
                    <button
                      onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Phase+2+Shop+Number+3+Baner+Rd+behind+Dominos+Veerbhadra+Nagar+Baner+Pune+Maharashtra+411069', '_blank')}
                      className="mt-2 w-full py-2 bg-flexigo-teal text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95"
                    >
                      Open in Google Maps
                    </button>
                  </div>

                  {/* Vehicle Handover Card */}
                  <div className={`text-left rounded-2xl p-4 border-2 border-flexigo-teal/30 bg-flexigo-teal/5 space-y-3`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-flexigo-teal flex items-center justify-center text-white shadow-[0_0_12px_rgba(57,255,20,0.4)] shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Pickup Your Vehicle
                        </h4>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                          Visit office to complete delivery
                        </p>
                      </div>
                    </div>
                    <p className={`text-[10px] font-bold leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Please visit our office with a valid ID proof to collect your assigned Flexigo vehicle. Our team will complete the handover formalities.
                    </p>
                  </div>
                </div>
              ) : showQRCode ? (
                <div className="space-y-6 py-4">
                  {qrSubmitted ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="3" className="w-8 h-8">
                          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-xl font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Under Review</h3>
                        <p className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          Your payment request has been submitted. Admin will verify and activate your subscription shortly.
                        </p>
                      </div>
                      <button
                        onClick={() => { setIsPaying(false); setShowQRCode(false); setQrSubmitted(false); }}
                        className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-100 text-slate-900'
                          }`}
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <h3 className={`text-lg font-heading font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Scan & Pay <span className="text-flexigo-teal">₹{selectedPlan?.price}</span>
                        </h3>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          Flexigo E-Mobility Private Limited
                        </p>
                      </div>

                      {/* QR Code - UPI deep link */}
                      <div className="flex justify-center">
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white' : 'bg-white border-slate-200'}`}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici&pn=Flexigo E-Mobility&am=${selectedPlan?.price}&cu=INR&tn=Plan:${selectedPlan?.label}`)}`}
                            alt="UPI QR Code"
                            className="w-[220px] h-[220px]"
                          />
                        </div>
                      </div>

                      <div className={`text-center space-y-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest">UPI ID</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici');
                              alert('UPI ID copied!');
                            }}
                            className="px-2 py-1 bg-flexigo-teal/10 border border-flexigo-teal/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-flexigo-teal hover:bg-flexigo-teal/20 transition-all active:scale-95"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={handleQRPaid}
                          className="w-full py-3 bg-flexigo-teal text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-400 transition-all active:scale-95"
                        >
                          I Have Paid
                        </button>
                        <button
                          onClick={() => { setShowQRCode(false); }}
                          className={`w-full py-2 text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                          Go Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : showRazorpay ? (
                <div className="space-y-8 py-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-black text-lg shadow-lg">R</div>
                      <span className="font-heading font-black text-slate-900 italic">Razorpay <span className="text-blue-500">Checkout</span></span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Order Ref</p>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">#ORD_{Math.floor(Math.random() * 999999)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">Paying To</p>
                        <p className="text-sm font-black text-slate-900 italic">Flexigo Hub Operations</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">Total</p>
                        <p className="text-2xl font-black text-slate-900 leading-none italic">₹{selectedPlan?.price}</p>
                      </div>
                    </div>
                    {selectedMethod === 'RAZORPAY' && balance > 0 && (
                      <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200 border-dashed">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Redeem Amount</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-600 leading-none italic">-₹{Math.min(selectedPlan?.price, balance)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">Net Payable</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900 leading-none italic">
                          ₹{selectedMethod === 'RAZORPAY' ? Math.max(0, selectedPlan?.price - balance) : selectedPlan?.price}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-between shadow-sm`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                          </div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{selectedMethod}</span>
                        </div>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Channel ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleFinalPayment}
                      className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-xl"
                    >
                      Finalize Secure Payment
                    </button>
                    <button
                      onClick={() => setShowRazorpay(false)}
                      className="w-full text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900"
                    >
                      Go Back to Summary
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2 opacity-60">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /></div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-900">Encrypted</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-900 tracking-[0.4em]">PCI_SECURE</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-2xl font-heading font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Checkout <span className="text-flexigo-teal">Summary</span></h3>
                    <button onClick={() => setIsPaying(false)} className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <GlassCard className={`p-6 space-y-4 border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-300 bg-white shadow-xl shadow-slate-200/50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-slate-950 font-black'}`}>Selected Tier</span>
                      <span className={`text-sm font-black uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPlan?.label}</span>
                    </div>
                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-slate-950 font-black'}`}>Amount Payable</span>
                      <span className={`text-2xl font-black italic text-flexigo-teal`}>₹{selectedPlan?.price}</span>
                    </div>
                  </GlassCard>

                  <div className="space-y-4">
                    <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-slate-950 font-black opacity-80'}`}>Secure Payment Channels</p>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedMethod === method.id
                            ? 'border-flexigo-teal bg-flexigo-teal/5 shadow-[0_0_20px_rgba(57,255,20,0.1)]'
                            : (isDark ? 'border-white/5 bg-white/[0.02] hover:border-white/10' : 'border-slate-300 bg-white hover:border-slate-300')
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedMethod === method.id ? 'bg-flexigo-teal text-white shadow-neon-sm' : (isDark ? 'bg-white/10 text-gray-500' : 'bg-slate-100 text-slate-500')
                              }`}>
                              {method.icon}
                            </div>
                            <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? (selectedMethod === method.id ? 'text-white' : 'text-gray-400') : (selectedMethod === method.id ? 'text-flexigo-teal' : 'text-slate-950')}`}>{method.label}</p>
                              <p className={`text-[8px] font-black italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{method.sub}</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === method.id ? 'border-flexigo-teal bg-flexigo-teal shadow-[0_0_8px_#39FF1444]' : (isDark ? 'border-white/10' : 'border-slate-300')
                            }`}>
                            {selectedMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <NeonButton variant="solid" size="full" onClick={handleOpenRazorpay}>
                      Complete Secure Purchase
                    </NeonButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
