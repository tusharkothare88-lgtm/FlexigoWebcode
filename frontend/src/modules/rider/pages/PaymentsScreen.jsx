import { useState, useEffect } from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import api from '../../../lib/axios';
import { RefreshCw, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentsScreen() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';
  
  const [data, setData] = useState({
    transactions: [],
    isDue: false,
    dueAmount: 0,
    dueReason: '',
    planId: null,
    nextDueDate: null
  });
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [user?.phone]);

  const fetchPayments = async () => {
    if (!user?.phone) return;
    try {
      setLoading(true);
      const res = await api.get(`/rider/payments/${user.phone}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayDue = async () => {
    try {
      setPayLoading(true);
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load');
        setPayLoading(false);
        return;
      }

      const orderRes = await api.post('/rider/payments/create-order', { planId: data.planId });
      if (!orderRes.data.success) {
        alert('Failed to create order');
        setPayLoading(false);
        return;
      }

      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ', // Hardcoded Live Key
        amount: orderRes.data.order.amount,
        currency: 'INR',
        name: 'Flexigo Rides',
        description: data.dueReason,
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/rider/payments/verify', {
              ...response,
              planId: data.planId,
              phone: user?.phone
            });
            if (verifyRes.data.success) {
              alert('Payment Successful!');
              fetchPayments(); // Refresh list and status
            }
          } catch (err) {
            alert('Verification failed');
          }
        },
        prefill: {
          name: user?.name || 'Rider',
          email: user?.email || 'rider@flexigo.in',
          contact: user?.phone
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
    } finally {
      setPayLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <PageWrapper className={`flex flex-col px-6 pt-6 pb-24 min-h-[100dvh] transition-colors duration-500 ${isDark ? 'bg-[#0A0A10]' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Payments</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Manage your weekly deposits & rent</p>
        </div>
        <button onClick={fetchPayments} className={`p-2 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-200 border-slate-300'}`}>
          <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} ${isDark ? 'text-flexigo-teal' : 'text-slate-700'}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-flexigo-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card (Due Status) */}
          <GlassCard className={`p-5 flex flex-col items-center justify-center text-center relative overflow-hidden ${
            data.isDue 
              ? (isDark ? 'border-rose-500/30 bg-rose-500/5' : 'border-rose-500/20 bg-rose-50')
              : (isDark ? 'border-flexigo-teal/30 bg-flexigo-teal/5' : 'border-emerald-500/20 bg-emerald-50')
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={64} className={data.isDue ? 'text-rose-500' : 'text-flexigo-teal'} />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              {data.isDue ? <AlertCircle size={24} className="text-rose-500" /> : <CheckCircle size={24} className="text-flexigo-teal" />}
              <h2 className={`text-lg font-black uppercase tracking-wider ${data.isDue ? 'text-rose-500' : 'text-flexigo-teal'}`}>
                {data.isDue ? 'Payment Due' : 'All Clear!'}
              </h2>
            </div>
            
            <div className="mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Next Due Date
              </span>
              <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {data.nextDueDate ? formatDate(data.nextDueDate) : 'No Active Plan'}
              </p>
            </div>

            {data.isDue && (
              <div className="w-full flex flex-col gap-3 mt-2">
                <div className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Amount Due</span>
                  <span className="text-xl font-black text-rose-500">₹{data.dueAmount}</span>
                </div>
                <NeonButton onClick={handlePayDue} disabled={payLoading} className="w-full bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  {payLoading ? 'Loading...' : `Pay Now (₹${data.dueAmount})`}
                </NeonButton>
              </div>
            )}
          </GlassCard>

          {/* Transactions List */}
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Payment History
            </h3>
            
            {data.transactions.length === 0 ? (
              <div className={`text-center py-8 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-gray-500' : 'border-slate-300 text-slate-500'}`}>
                <p className="text-xs font-bold uppercase tracking-widest">No past transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.transactions.map((trx) => (
                  <GlassCard key={trx._id} className="p-4 flex items-center justify-between group transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        trx.status === 'success' 
                          ? 'bg-flexigo-teal/10 text-flexigo-teal' 
                          : trx.status === 'failed' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {trx.status === 'success' ? <CheckCircle size={18} /> : trx.status === 'failed' ? <AlertCircle size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {trx.description || 'Payment'}
                        </h4>
                        <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {formatDate(trx.createdAt)} • {trx.method}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{trx.amount}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 ${
                        trx.status === 'success' ? 'bg-flexigo-teal/20 text-flexigo-teal' :
                        trx.status === 'failed' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {trx.status === 'success' ? 'Paid' : trx.status}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
