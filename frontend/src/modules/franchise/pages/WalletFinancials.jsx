import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Wallet,
   TrendingUp,
   ArrowUpRight,
   ArrowDownRight,
   Download,
   Filter,
   Calendar,
   Clock,
   ArrowRight,
   History,
   X,
   ShieldCheck
} from 'lucide-react';
import { useFranchiseWalletStore } from '../store/walletStore';
import GlassTable from '../components/GlassTable';
import StatusBadge from '../components/StatusBadge';
import api from '../../../lib/axios';

export default function WalletFinancials() {
   const { balance, ledger = [], fetchWallet, requestPayout, addFunds } = useFranchiseWalletStore();
   const payoutRequests = ledger.filter(t => t.type === 'Payout');
   const [isPayoutModalOpen, setPayoutModalOpen] = useState(false);
   const [payoutAmount, setPayoutAmount] = useState('');
   const [showSettlement, setShowSettlement] = useState(false);

   // Add Funds State
   const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
   const [addFundsAmount, setAddFundsAmount] = useState('');
   const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
   const [isProcessingAddFunds, setIsProcessingAddFunds] = useState(false);
   const [showQRCode, setShowQRCode] = useState(false);
   const [qrSubmitted, setQrSubmitted] = useState(false);

   useEffect(() => {
      fetchWallet();
   }, [fetchWallet]);

   const handlePayoutRequest = (e) => {
      e.preventDefault();
      const amount = parseFloat(payoutAmount);
      if (amount > 0 && amount <= balance) {
         requestPayout(amount);
         setPayoutModalOpen(false);
         setPayoutAmount('');
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

   const handleAddFunds = async (e) => {
      e.preventDefault();
      const amount = parseFloat(addFundsAmount);
      if (amount > 0) {
         if (paymentMethod === 'UPI_QR') {
            setShowQRCode(true);
            return;
         }

         setIsProcessingAddFunds(true);

         if (paymentMethod.toLowerCase() === 'razorpay') {
            const res = await loadRazorpay();
            if (!res) {
               alert('Razorpay SDK failed to load');
               setIsProcessingAddFunds(false);
               return;
            }

            try {
               const { data: orderRes } = await api.post('/franchise/wallet/create-order', { amount });
               
               if (!orderRes.success) {
                  alert('Failed to create order');
                  setIsProcessingAddFunds(false);
                  return;
               }

               const options = {
                  key: 'rzp_live_SxBAcIEtexyUUQ', // Hardcoded Live Key
                  amount: orderRes.order.amount,
                  currency: 'INR',
                  name: 'Flexigo Franchise',
                  description: 'Wallet Recharge',
                  order_id: orderRes.order.id,
                  handler: async function (response) {
                     try {
                        const { data: verifyRes } = await api.post('/franchise/wallet/verify-payment', {
                           ...response,
                           amount
                        });
                        if (verifyRes.success) {
                           alert('Payment Successful!');
                           setAddFundsModalOpen(false);
                           setAddFundsAmount('');
                           fetchWallet(); // refresh state
                        } else {
                           alert('Payment verification failed');
                        }
                     } catch (err) {
                        alert('Verification failed: ' + err.message);
                     }
                  },
                  prefill: { email: 'franchise@flexigo.in', contact: '0000000000' },
                  theme: {
                     color: '#10B981' // emerald-500
                  }
               };

               const rzp = new window.Razorpay(options);
               rzp.on('payment.failed', function (response) {
                  alert('Payment failed: ' + response.error.description);
               });
               rzp.open();
            } catch (error) {
               console.error('Payment flow error', error);
               alert(error.response?.data?.message || error.message || 'Something went wrong during payment');
            } finally {
               setIsProcessingAddFunds(false);
            }
         } else {
            // Ensure payment method is lowercase to match backend enum
            const res = await addFunds(amount, paymentMethod.toLowerCase());
            setIsProcessingAddFunds(false);
            if (res.success) {
               setAddFundsModalOpen(false);
               setAddFundsAmount('');
               alert(`Successfully added ₹${amount} via ${paymentMethod}`);
            } else {
               alert(res.message || 'Failed to process payment');
            }
         }
      }
   };

   const handleUPIConfirmation = async () => {
      setQrSubmitted(true);
      // Simulate backend review and approval after 2 seconds
      setTimeout(async () => {
         const amount = parseFloat(addFundsAmount);
         const res = await addFunds(amount, 'upi_qr');
         if (res.success) {
            setAddFundsModalOpen(false);
            setAddFundsAmount('');
            setShowQRCode(false);
            setQrSubmitted(false);
            alert(`Successfully added ₹${amount} via UPI QR`);
         } else {
            alert(res.message || 'Failed to process payment');
            setQrSubmitted(false);
         }
      }, 2000);
   };

   const totalYield = ledger.filter(t => t.type === 'Subscription' || t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
   const totalSettled = ledger.filter(t => t.type === 'Payout' && t.status === 'completed').reduce((acc, t) => acc + Math.abs(t.amount), 0);
   const platformFee = totalYield * 0.1;

   const columns = [
      {
         header: 'Reference ID',
         accessor: 'id',
         render: (row) => <span className="text-[7.5px] font-black font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] italic opacity-60">{row._id || row.id}</span>
      },
      {
         header: 'Operation / Source',
         accessor: 'type',
         render: (row) => (
            <div className="flex items-center gap-2">
               <div className={`p-1.5 rounded-lg border shadow-inner ${row.amount > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                  }`}>
                  {row.amount > 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest italic leading-none">{row.type}</span>
                  {row.subscriberName && <span className="text-[6.5px] font-black text-[var(--text-tertiary)] opacity-60 tracking-[0.2em] truncate uppercase italic mt-0.5 leading-none">SUB: {row.subscriberName}</span>}
               </div>
            </div>
         )
      },
      {
         header: 'Timestamp',
         accessor: 'date',
         render: (row) => (
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-[var(--text-secondary)] italic leading-none">{new Date(row.date).toLocaleDateString()}</span>
               <span className="text-[6.5px] font-black text-[var(--text-tertiary)] opacity-60 uppercase tracking-[0.2em] italic mt-0.5">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
         )
      },
      {
         header: 'Status',
         accessor: 'status',
         render: (row) => <StatusBadge status={row.status} />
      },
      {
         header: 'Nominal Value',
         accessor: 'amount',
         render: (row) => (
            <span className={`text-[10px] font-black tracking-widest italic ${row.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
               {row.amount > 0 ? '+' : ''}₹{Math.abs(row.amount).toLocaleString('en-IN')}
            </span>
         )
      }
   ];

   return (
      <div className="space-y-6 pb-12">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
                     Financial <span className="text-emerald-500">Ledger</span>
                  </h1>
               </div>
               <p className="text-[7.5px] font-black uppercase tracking-[0.3em] ml-3 text-[var(--text-tertiary)] italic opacity-40 leading-none">
                  EARNINGS_TRACKING • FRANCHISE_PAYOUT_CONSOLE
               </p>
            </div>

            <div className="flex items-center gap-2">
               <button
                  onClick={() => setShowSettlement(true)}
                  className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 hover:border-emerald-500/20 transition-all shadow-inner"
               >
                  <Download size={14} />
               </button>
               <button
                  onClick={() => setAddFundsModalOpen(true)}
                  className="px-4 py-2 bg-[var(--bg-secondary)] border border-emerald-500/30 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all shadow-inner active:scale-95 italic flex items-center gap-2 leading-none"
               >
                  PAY NOW <TrendingUp size={12} strokeWidth={3} />
               </button>
               <button
                  onClick={() => setPayoutModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95 italic flex items-center gap-2 shadow-emerald-950/20 leading-none"
               >
                  REQUEST_PAYOUT <ArrowRight size={12} strokeWidth={3} />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Wallet Balance Card */}
            <div className="lg:col-span-2 relative group p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner flex flex-col justify-between min-h-[240px] overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-[2.5] rotate-12 pointer-events-none">
                  <Wallet size={120} className="text-emerald-500" />
               </div>

               <div className="space-y-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 shadow-inner">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                     <span className="text-[6.5px] font-black uppercase tracking-[0.3em] text-emerald-500 italic leading-none">AVAILABLE_LIQUIDITY</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-4">
                     <span className="text-[var(--text-tertiary)] text-xl font-black opacity-40 italic">₹</span>
                     <h2 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] italic">
                        {balance.toLocaleString('en-IN')}
                     </h2>
                     <div className="flex flex-col gap-0 mb-1">
                        <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-1 leading-none">
                           <TrendingUp size={10} strokeWidth={3} />
                           +12.4% <span className="opacity-40 text-[var(--text-tertiary)] tracking-[0.2em]">YTD</span>
                        </span>
                        <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-40 mt-1 leading-none">REALTIME_SYNC</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-subtle)] relative z-10">
                  <div className="space-y-1.5">
                     <p className="text-[6.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic opacity-60 leading-none">TOTAL_YIELD</p>
                     <p className="text-lg font-black text-[var(--text-primary)] italic leading-none">₹{(totalYield / 1000).toFixed(1)}K</p>
                     <div className="w-6 h-0.5 bg-emerald-500/20 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-[6.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic opacity-60 leading-none">PLATFORM_FEE</p>
                     <p className="text-lg font-black text-rose-500 italic leading-none">₹{(platformFee / 1000).toFixed(1)}K</p>
                     <div className="w-6 h-0.5 bg-rose-500/20 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-[6.5px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic opacity-60 leading-none">SETTLED_TO_DATE</p>
                     <p className="text-lg font-black text-blue-500 italic leading-none">₹{(totalSettled / 1000).toFixed(1)}K</p>
                     <div className="w-6 h-0.5 bg-blue-500/20 rounded-full" />
                  </div>
               </div>
            </div>

            {/* Payout History Terminal */}
            <div className="flex flex-col rounded-xl bg-black border border-[var(--border-subtle)] shadow-inner p-4 overflow-hidden max-h-[240px] lg:max-h-full">
               <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white italic leading-none">PAYOUT_TERMINAL</h3>
                  </div>
                  <span className="text-[6.5px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">ACTIVE</span>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {payoutRequests.length > 0 ? payoutRequests.map((req, i) => (
                     <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner group hover:border-emerald-500/20 transition-all flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1.5">
                           <span className="text-[10px] font-black text-emerald-500 tracking-widest italic leading-none">₹{req.amount.toLocaleString('en-IN')}</span>
                           <StatusBadge status={req.status} className="scale-[0.7] origin-right" />
                        </div>
                        <div className="flex items-center justify-between text-[var(--text-tertiary)]">
                           <div className="flex items-center gap-1 text-[6.5px] font-black uppercase tracking-[0.3em] italic opacity-60 leading-none">
                              <Calendar size={8} strokeWidth={3} />
                              {new Date(req.date).toLocaleDateString()}
                           </div>
                           <div className="text-[6.5px] font-black tracking-[0.2em] uppercase italic truncate opacity-40 leading-none">AC*4821</div>
                        </div>
                     </div>
                  )) : (
                     <div className="py-8 flex flex-col items-center justify-center text-center opacity-30 gap-2">
                        <History size={16} strokeWidth={2} className="text-white" />
                        <span className="text-[7.5px] font-black uppercase tracking-[0.3em] leading-none text-white italic">NO_PAYOUT_LOGS</span>
                     </div>
                  )}
               </div>

               <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-inner">
                     <div className="space-y-1">
                        <p className="text-[6.5px] font-black uppercase tracking-[0.3em] text-emerald-500 leading-none italic">NEXT_HUB_CYCLE</p>
                        <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic leading-none">MON_APR_06</p>
                     </div>
                     <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        <Clock size={10} strokeWidth={3} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Transaction Records */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] italic leading-none">JOURNAL_LOG</h3>
                  <p className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase italic tracking-[0.3em] opacity-60 leading-none">OPERATIONAL_SETTLEMENT_RECORDS</p>
               </div>
            </div>
            <GlassTable columns={columns} data={ledger} emptyMessage="No transaction logs available for current operational period" />
         </div>

         <AnimatePresence>
            {isPayoutModalOpen && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPayoutModalOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[70]" />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 z-[80] shadow-2xl flex flex-col gap-6">
                     <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
                           <Wallet size={20} strokeWidth={2} />
                        </div>
                        <div className="space-y-1 px-4">
                           <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">REQUEST_PAYOUT</h3>
                        </div>
                     </div>
                     <form onSubmit={handlePayoutRequest} className="space-y-5">
                        <input
                           type="number"
                           value={payoutAmount}
                           onChange={(e) => setPayoutAmount(e.target.value)}
                           className="bg-transparent border-b border-[var(--border-subtle)] outline-none text-2xl font-black text-[var(--text-primary)] w-full text-center"
                           placeholder="Enter Amount"
                        />
                        <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-black uppercase italic">Authorize</button>
                     </form>
                  </motion.div>
               </>
            )}

            {isAddFundsModalOpen && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isProcessingAddFunds && !showQRCode && setAddFundsModalOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[70]" />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 z-[80] shadow-2xl flex flex-col gap-6">

                     {showQRCode ? (
                        qrSubmitted ? (
                           <div className="text-center py-6 space-y-4">
                              <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto">
                                 <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="3" className="w-8 h-8">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                                 </svg>
                              </div>
                              <div className="space-y-1">
                                 <h3 className="text-xl font-black uppercase italic text-[var(--text-primary)]">Payment Under Review</h3>
                                 <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest italic">
                                    Your payment is being verified by the admin portal. Once verified, funds will reflect automatically.
                                 </p>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              <div className="text-center space-y-2">
                                 <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic">
                                    Scan & Pay <span className="text-emerald-500">₹{addFundsAmount}</span>
                                 </h3>
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] italic">
                                    Flexigo E-Mobility Private Limited
                                 </p>
                              </div>

                              <div className="flex justify-center">
                                 <div className="p-4 rounded-2xl bg-white border-2 border-[var(--border-subtle)] shadow-inner">
                                    <img
                                       src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici&pn=Flexigo E-Mobility&am=${addFundsAmount}&cu=INR&tn=FranchiseWalletRecharge`)}`}
                                       alt="UPI QR Code"
                                       className="w-[220px] h-[220px]"
                                    />
                                 </div>
                              </div>

                              <div className="text-center space-y-1 text-[var(--text-tertiary)]">
                                 <p className="text-[9px] font-black uppercase tracking-widest italic">UPI ID</p>
                                 <div className="flex items-center justify-center gap-2">
                                    <p className="text-[11px] font-bold text-[var(--text-primary)]">
                                       MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici
                                    </p>
                                    <button
                                       onClick={() => {
                                          navigator.clipboard.writeText('MSFLEXIGOEMOBILITYPRIVATELIMITED.eazypay@icici');
                                          alert('UPI ID copied!');
                                       }}
                                       className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95 italic"
                                    >
                                       Copy
                                    </button>
                                 </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                 <button
                                    onClick={handleUPIConfirmation}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest italic transition-all"
                                 >
                                    I HAVE PAID
                                 </button>
                                 <button
                                    onClick={() => setShowQRCode(false)}
                                    className="w-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest transition-colors italic"
                                 >
                                    GO BACK
                                 </button>
                              </div>
                           </div>
                        )
                     ) : (
                        <>
                           <div className="flex flex-col items-center text-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
                                 <TrendingUp size={20} strokeWidth={2} />
                              </div>
                              <div className="space-y-1 px-4">
                                 <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">ADD_FUNDS</h3>
                                 <p className="text-[9px] font-black uppercase text-[var(--text-tertiary)] italic tracking-widest opacity-60">RECHARGE FRANCHISE WALLET</p>
                              </div>
                           </div>
                           <form onSubmit={handleAddFunds} className="space-y-6">
                              <div className="space-y-2 text-center">
                                 <input
                                    type="number"
                                    value={addFundsAmount}
                                    onChange={(e) => setAddFundsAmount(e.target.value)}
                                    disabled={isProcessingAddFunds}
                                    className="bg-transparent border-b border-[var(--border-subtle)] outline-none text-4xl font-black text-emerald-500 w-full text-center tracking-tighter"
                                    placeholder="0.00"
                                 />
                                 <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] italic opacity-50">Amount in INR (₹)</p>
                              </div>

                              <div className="space-y-3">
                                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] opacity-80">Secure Payment Channels</p>

                                 {/* Razorpay Option */}
                                 <div
                                    onClick={() => !isProcessingAddFunds && setPaymentMethod('RAZORPAY')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'RAZORPAY'
                                       ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                       : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:border-blue-500/50'
                                       }`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${paymentMethod === 'RAZORPAY' ? 'bg-blue-500 text-white shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                                          }`}>
                                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                       </div>
                                       <div>
                                          <p className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'RAZORPAY' ? 'text-blue-500' : 'text-[var(--text-primary)]'}`}>Razorpay</p>
                                          <p className="text-[7px] font-black italic text-[var(--text-tertiary)] opacity-60">Cards, Netbanking & Wallets</p>
                                       </div>
                                    </div>
                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'RAZORPAY' ? 'border-blue-500 bg-blue-500' : 'border-[var(--border-subtle)]'
                                       }`}>
                                       {paymentMethod === 'RAZORPAY' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                 </div>

                                 {/* UPI QR Option Hidden 
                                 <div
                                    onClick={() => !isProcessingAddFunds && setPaymentMethod('UPI_QR')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'UPI_QR'
                                       ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                       : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:border-emerald-500/50'
                                       }`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${paymentMethod === 'UPI_QR' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                                          }`}>
                                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 11h2v2H3v-2zm0-4h2v2H3V7zm4 4h2v2H7v-2zm0-4h2v2H7V7zm0-4h2v2H7V3zm4 8h2v2h-2v-2zm0-4h2v2h-2V7zm0-4h2v2h-2V3zm4 8h2v2h-2v-2zm0-8h2v2h-2V3zm4 4h2v2h-2V7zm0 4h2v2h-2v-2zm0-8h2v2h-2V3zM3 3h2v2H3V3zm0 8h2v2H3v-2z" /></svg>
                                       </div>
                                       <div>
                                          <p className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'UPI_QR' ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>UPI QR Code</p>
                                          <p className="text-[7px] font-black italic text-[var(--text-tertiary)] opacity-60">Scan & Pay via any UPI App</p>
                                       </div>
                                    </div>
                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'UPI_QR' ? 'border-emerald-500 bg-emerald-500' : 'border-[var(--border-subtle)]'
                                       }`}>
                                       {paymentMethod === 'UPI_QR' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                 </div>
                                 */}
                              </div>

                              <button
                                 type="submit"
                                 disabled={isProcessingAddFunds || !addFundsAmount || parseFloat(addFundsAmount) <= 0}
                                 className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest italic disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition-all flex items-center justify-center"
                              >
                                 {isProcessingAddFunds ? (
                                    <span className="flex items-center gap-2">
                                       <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                                       </svg>
                                       PROCESSING...
                                    </span>
                                 ) : `PROCEED ₹${addFundsAmount || '0'}`}
                              </button>
                           </form>
                        </>
                     )}
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {showSettlement && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettlement(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100]" />
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white text-slate-900 rounded-t-[3rem] p-10 z-[110] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                     <div className="flex justify-between items-start mb-8">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black uppercase tracking-tighter italic">Flexigo <span className="text-slate-400">Settlement Node</span></h2>
                        </div>
                        <button onClick={() => setShowSettlement(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
                           <X size={24} />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                        <div className="grid grid-cols-2 gap-10">
                           <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Subscription Revenue</h4>
                              <p className="text-2xl font-black">₹{totalYield.toLocaleString()}</p>
                           </div>
                           <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Franchise Commission</h4>
                              <p className="text-2xl font-black text-emerald-600">₹{platformFee.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="bg-slate-900 text-white p-8 rounded-3xl">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Total Payout Amount</p>
                           <h3 className="text-4xl font-black tracking-tighter">₹{platformFee.toLocaleString()}</h3>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                           <ShieldCheck className="text-amber-500 shrink-0" size={20} />
                           <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase tracking-wider">
                              This is an automated system-generated settlement report. Digital audit trail is active for regional compliance verification.
                           </p>
                        </div>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}
