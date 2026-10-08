import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, X, CheckCircle2, AlertCircle, Info, Wallet } from 'lucide-react';
import api from '../../../lib/axios';

export default function FranchisePaymentModal({ isOpen, onClose, rider, type, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');
  const [adhocAmount, setAdhocAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'wallet' or 'razorpay'
  const [depositAmount, setDepositAmount] = useState(2800);

  // Fetch plans always when modal opens for 'deposit' or 'plan'
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const { data } = await api.get('/franchise/plans');
          if (data.success) setPlans(data.plans);
        } catch (err) {
          console.error('Failed to fetch plans', err);
        }

        try {
          const res = await api.get('/rider/settings');
          if (res.data.success && res.data.securityDepositAmount) {
            setDepositAmount(res.data.securityDepositAmount);
          }
        } catch (err) {
          console.error('Failed to fetch settings', err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen || !rider) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayDeposit = async () => {
    if (!selectedPlan) {
      setError('Please select a Subscription Tier first');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const finalDepositAmount = adhocAmount ? Number(adhocAmount) : depositAmount;

      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const orderRes = await api.post('/franchise/riders/deposit-create-order', {
          amount: finalDepositAmount
        });

        if (!orderRes.data.success) throw new Error('Failed to create Razorpay order');

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SxBAcIEtexyUUQ',
          amount: orderRes.data.order.amount,
          currency: orderRes.data.order.currency,
          name: 'Flexigo Mobility',
          description: `Security Deposit for ${rider.name || rider.phone}`,
          order_id: orderRes.data.order.id,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/franchise/riders/deposit-verify', {
                ...response,
                riderId: rider._id || rider.id,
                depositAmount: finalDepositAmount,
                planId: selectedPlan?._id
              });

              if (verifyRes.data.success) {
                onSuccess();
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: { email: 'franchise@flexigo.in', contact: '0000000000' },
          theme: { color: '#10b981' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Wallet Payment
        const res = await api.post('/franchise/riders/pay-deposit', {
          riderId: rider._id || rider.id,
          depositAmount: finalDepositAmount,
          planId: selectedPlan?._id,
          paymentMethod: paymentMethod
        });

        if (res.data.success) {
          onSuccess();
        } else {
          setError(res.data.message || 'Failed to pay deposit');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPlan = async () => {
    if (!selectedPlan) {
      setError('Please select a plan first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const orderRes = await api.post('/franchise/riders/plan-create-order', {
          amount: selectedPlan.price
        });

        if (!orderRes.data.success) throw new Error('Failed to create Razorpay order');

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SxBAcIEtexyUUQ',
          amount: orderRes.data.order.amount,
          currency: orderRes.data.order.currency,
          name: 'Flexigo Mobility',
          description: `Plan Payment for ${rider.name || rider.phone}`,
          order_id: orderRes.data.order.id,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/franchise/riders/plan-verify', {
                ...response,
                riderId: rider._id || rider.id,
                planId: selectedPlan?._id,
                depositAmount: depositAmount,
                planPrice: selectedPlan.price
              });

              if (verifyRes.data.success) {
                onSuccess();
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: { email: 'franchise@flexigo.in', contact: '0000000000' },
          theme: { color: '#10b981' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const res = await api.post('/franchise/riders/pay-plan', {
          riderId: rider._id || rider.id,
          planId: selectedPlan._id
        });
        if (res.data.success) {
          onSuccess();
        } else {
          setError(res.data.message || 'Plan payment failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-emerald-500 tracking-tight">
                {type === 'deposit' ? 'Subscription Management' : 'Activate Plan'}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {type === 'deposit' ? 'MANAGE YOUR FLEET ACCESS AND BILLING TIERS' : `PAY BILLING TIER FOR ${rider.name}`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {error && (
              <div className="flex items-center gap-2 p-3 text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Plans Section */}
            {(type === 'deposit' || type === 'plan') && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Available Plans</p>
                <div className="space-y-3">
                  {plans.map(plan => (
                    <div
                      key={plan._id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all bg-white dark:bg-slate-900 ${selectedPlan?._id === plan._id ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-500/30'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan?._id === plan._id ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            <ShieldCheck size={20} className={selectedPlan?._id === plan._id ? 'fill-current text-emerald-200' : ''} />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">{plan.name}</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{plan.duration || '7 DAYS ACCESS'}</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-slate-900 dark:text-white">₹{plan.price}</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>₹{plan.price} PER {plan.type === 'Weekly' ? 'WEEK' : plan.type === 'Monthly' ? 'MONTH' : 'CYCLE'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>₹299 ONE TIME REGISTRATION</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>₹{depositAmount} DEPOSIT</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${selectedPlan?._id === plan._id ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {selectedPlan?._id === plan._id ? 'READY TO UPGRADE' : 'SELECT TIER'}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan?._id === plan._id ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {selectedPlan?._id === plan._id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deposit Section */}
            {type === 'deposit' && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-emerald-500 tracking-tight">
                    Security <span className="text-emerald-500">Deposit</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                    MANDATORY ONE-TIME DEPOSIT<br />REQUIRED.
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">Security Deposit</h3>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">ONE-TIME & REFUNDABLE</p>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">₹{adhocAmount ? adhocAmount : depositAmount}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">ADHOC PAYMENT</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={adhocAmount}
                      onChange={(e) => setAdhocAmount(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={handlePayDeposit}
                      disabled={loading}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      PAY<br />NOW
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Payment Description (Optional)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {(type === 'deposit' || type === 'plan') && (
              <div className="space-y-3 pt-2">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">SELECT PAYMENT METHOD</p>

                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <Info size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        RAZORPAY UPI
                      </h4>
                      <p className="text-[9px] font-medium text-slate-500 italic">Instant Online Payment</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
            <button
              onClick={type === 'deposit' ? handlePayDeposit : handlePayPlan}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 ${loading ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                type === 'deposit' ? `PAY ₹${adhocAmount ? adhocAmount : depositAmount} SECURITY DEPOSIT & SAVE PLAN` : 'PAY & ACTIVATE PLAN NOW'
              )}
            </button>
            {type === 'deposit' && (
              <p className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-4">
                NEXT BILLING ON IMMEDIATELY
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
