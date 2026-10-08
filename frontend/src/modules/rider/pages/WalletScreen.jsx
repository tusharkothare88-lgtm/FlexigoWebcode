import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { Modal } from '../components/Modal';
import { useWalletStore } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../../../lib/axios';

export default function WalletScreen() {
  const { balance, transactions, addMoney, fetchWalletData } = useWalletStore();
  const { phone, user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const isFranchiseRider = !!user?.franchise;
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (phone) {
      fetchWalletData(phone);
    }
  }, [phone]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setProcessing(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load');
        setProcessing(false);
        return;
      }

      const orderRes = await api.post('/rider/wallet/create-topup-order', { amount: Number(amount) });
      if (!orderRes.data.success) {
        alert('Failed to create order');
        setProcessing(false);
        return;
      }

      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ', // Hardcoded Live Key
        amount: orderRes.data.order.amount,
        currency: 'INR',
        name: 'Flexigo Wallet',
        description: 'Add money to wallet',
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/rider/wallet/verify-topup', {
              ...response,
              amount: Number(amount),
              phone: phone
            });
            if (verifyRes.data.success) {
              fetchWalletData(phone);
              setIsTopUpOpen(false);
              setAmount('');
            }
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || 'rider@flexigo.in',
          contact: phone
        },
        theme: {
          color: '#39FF14'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error('Payment flow error', error);
      alert('Something went wrong during payment');
    }
    setProcessing(false);
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!upiId) {
      alert('Please enter your UPI ID');
      return;
    }
    if (Number(amount) > balance) {
      alert('Insufficient wallet balance');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/rider/wallet/withdraw', {
        amount: Number(amount),
        upiId: upiId,
        phone: phone
      });
      if (res.data.success) {
        fetchWalletData(phone);
        setIsWithdrawOpen(false);
        setAmount('');
        setUpiId('');
        alert('Withdrawal request submitted successfully');
      } else {
        alert(res.data.message || 'Failed to request withdrawal');
      }
    } catch (error) {
      console.error('Withdrawal error', error);
      alert(error.response?.data?.message || 'Something went wrong');
    }
    setProcessing(false);
  };

  return (
    <PageWrapper className="flex flex-col p-6 pb-24">
      {/* Balance Card */}
      <GlassCard
        className="p-8 mb-10 overflow-hidden relative"
      >
        <div className="relative z-10 flex flex-col gap-4">
          <span className={`text-[10px] uppercase font-black transition-colors duration-500 tracking-[0.4em] ${isDark ? 'text-gray-500' : 'text-slate-500'
            }`}>
            Current Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              ₹{balance.toLocaleString()}
            </span>
            <span className="text-flexigo-teal font-black uppercase text-[10px] tracking-widest shadow-sm">Active</span>
          </div>
          <div className="mt-4 flex gap-3">
            {/* Add Money button removed as per requirement: only Admin can add bonus/funds */}
            {!isFranchiseRider ? (
              <button
                onClick={() => { setAmount(''); setUpiId(''); setIsWithdrawOpen(true); }}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-colors duration-300 ${isDark
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                Withdraw
              </button>
            ) : (
              <button
                disabled
                title="Your payouts are managed directly by your Franchise Owner"
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border opacity-50 cursor-not-allowed transition-colors duration-300 ${isDark
                  ? 'border-white/10 text-white/50 bg-white/5'
                  : 'border-slate-200 text-slate-400 bg-slate-50'
                  }`}
              >
                Managed by Franchise
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-500'
            }`}>
            Recent Activity
          </h3>
          <button className={`text-[10px] font-black uppercase transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
            }`}>
            View All
          </button>
        </div>

        <div className="space-y-4">
          {[...transactions].map((tx) => (
            <div key={tx._id} className={`flex items-center gap-4 py-2 border-b transition-colors duration-500 last:border-0 ${isDark ? 'border-white/05' : 'border-slate-100'
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${tx.type === 'credit'
                ? 'bg-flexigo-teal/10'
                : isDark ? 'bg-white/[0.03]' : 'bg-slate-100'
                }`}>
                {tx.type === 'credit' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-5 h-5">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? '#00D4FF' : '#0EA5E9'} strokeWidth="2.5" className="w-5 h-5">
                    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                  {tx.description}
                </h4>
                <p className={`text-[10px] font-bold mt-0.5 transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-slate-400'
                  }`}>
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className={`text-right font-black transition-colors duration-500 ${tx.type === 'credit'
                ? 'text-flexigo-teal'
                : isDark ? 'text-white/80' : 'text-slate-900'
                }`}>
                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Modal */}
      <Modal
        isOpen={isTopUpOpen}
        onClose={() => !processing && setIsTopUpOpen(false)}
        title="Add Money to Wallet"
      >
        <div className="p-6 pt-2 pb-10 space-y-8">
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
              }`}>
              Enter Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={processing}
              className={`w-full text-4xl font-heading font-black bg-transparent border-none outline-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}
              autoFocus
            />
            <div className={`h-px w-full transition-all duration-500 ${isDark ? 'bg-white/10' : 'bg-slate-200 shadow-sm'
              }`} />
          </div>

          <div className={`p-4 rounded-xl flex items-center gap-4 transition-colors duration-500 ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'
            }`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" className="w-5 h-5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed flex-1 transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
              Secure checkout powered by <span className="text-[#6366F1] font-black">Razorpay</span>
            </p>
          </div>

          <NeonButton
            size="full"
            variant="solid"
            onClick={handleTopUp}
            disabled={!amount || Number(amount) <= 0 || processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                </svg>
                Processing Payment...
              </span>
            ) : `Add ₹${amount || '0'} Now →`}
          </NeonButton>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => !processing && setIsWithdrawOpen(false)}
        title="Withdraw Money"
      >
        <div className="p-6 pt-2 pb-10 space-y-8">
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
              }`}>
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={processing}
              className={`w-full text-4xl font-heading font-black bg-transparent border-none outline-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}
              autoFocus
            />
            <div className={`h-px w-full transition-all duration-500 ${isDark ? 'bg-white/10' : 'bg-slate-200 shadow-sm'
              }`} />
            <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Available Balance: ₹{balance}</p>
          </div>

          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
              }`}>
              Your UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@bank"
              disabled={processing}
              className={`w-full p-4 rounded-xl text-sm font-bold bg-transparent border outline-none transition-colors duration-500 ${isDark
                ? 'text-white border-white/10 focus:border-flexigo-teal'
                : 'text-slate-900 border-slate-200 focus:border-slate-400'
                }`}
            />
          </div>

          <NeonButton
            size="full"
            variant="solid"
            onClick={handleWithdraw}
            disabled={!amount || Number(amount) <= 0 || !upiId || processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                </svg>
                Processing...
              </span>
            ) : `Withdraw ₹${amount || '0'}`}
          </NeonButton>
        </div>
      </Modal>
    </PageWrapper>
  );
}
