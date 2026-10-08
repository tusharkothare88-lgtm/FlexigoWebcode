import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, CreditCard, User, IndianRupee, FileText, CheckCircle2, Wallet, History, Plus, Image as ImageIcon, X, Phone } from 'lucide-react';
import api from '../../../lib/axios';

export default function RiderRefundPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedRider, setSelectedRider] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [barcodeImage, setBarcodeImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBarcodeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin Wallet State
  const [adminWallet, setAdminWallet] = useState(0);
  const [adminHistory, setAdminHistory] = useState([]);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    fetchRiders();
    fetchDashboard();
  }, []);

  const fetchRiders = async () => {
    try {
      const res = await api.get('/admin/refund/riders-list');
      if (res.data?.success) {
        setRiders(res.data.riders);
      }
    } catch (error) {
      alert('Failed to load riders list');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/refund/dashboard');
      if (res.data?.success) {
        setAdminWallet(res.data.walletBalance);
        setAdminHistory(res.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load admin wallet dashboard');
    }
  };

  const filteredRiders = riders.filter(r =>
    (r.name?.toLowerCase().includes(search.toLowerCase())) ||
    (r.phone?.includes(search))
  );

  const handleAddFunds = async () => {
    if (!addFundsAmount || isNaN(addFundsAmount) || addFundsAmount <= 0) return alert('Enter valid amount');
    try {
      setAddingFunds(true);
      const res = await api.post('/admin/refund/add-funds-order', { amount: Number(addFundsAmount) });
      if (!res.data?.success) throw new Error('Failed');

      const options = {
        key: 'rzp_live_SxBAcIEtexyUUQ',
        amount: res.data.order.amount,
        currency: "INR",
        name: "Admin Wallet Recharge",
        description: "Adding funds to Admin Wallet",
        order_id: res.data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/admin/refund/verify-add-funds', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(addFundsAmount)
            });
            if (verifyRes.data?.success) {
              alert('Wallet recharged successfully!');
              setAddFundsAmount('');
              fetchDashboard();
            } else alert('Verification failed');
          } catch (e) { alert('Error verifying payment'); }
        },
        prefill: {
          name: "Admin",
          email: "admin@flexigo.com",
          contact: "9999999999"
        },
        theme: { color: "#10b981" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate recharge');
    } finally {
      setAddingFunds(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedRider) return alert('Please select a rider first');
    if (!amount || isNaN(amount) || amount <= 0) return alert('Please enter a valid amount');
    if (adminWallet < Number(amount)) return alert('Insufficient Admin Wallet Balance. Please add funds first.');

    try {
      setProcessing(true);
      const res = await api.post('/admin/refund/process-wallet-refund', {
        amount: Number(amount),
        riderId: selectedRider.id,
        description,
        upiId,
        phone,
        barcodeUrl: barcodeImage
      });

      if (res.data?.success) {
        alert('Refund processed successfully!');
        setSelectedRider(null);
        setAmount('');
        setDescription('');
        setUpiId('');
        setPhone('');
        setBarcodeImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchRiders(); // Refresh list to get updated balance
        fetchDashboard(); // Refresh admin wallet
      } else {
        alert(res.data?.message || 'Failed to process refund');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Rider Refund Console</h1>
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Manage Admin Wallet & Refund Riders</p>
        </div>

        {/* Admin Wallet Quick Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-lg flex items-center gap-6 min-w-[300px]">
          <div>
            <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1">
              <Wallet size={12} className="text-emerald-500" /> Admin Wallet
            </p>
            <p className="text-2xl font-black text-emerald-500 tracking-wider">₹{adminWallet}</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-subtle)] mx-2"></div>
          <div className="flex-1 flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={addFundsAmount}
              onChange={(e) => setAddFundsAmount(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddFunds}
              disabled={addingFunds}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              {addingFunds ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rider Selection Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

          <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-6">
            <User size={16} className="text-emerald-500" /> Select Rider
          </h2>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
            <input
              type="text"
              placeholder="SEARCH BY NAME OR PHONE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-[11px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] uppercase tracking-wider focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-3 h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredRiders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <User size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">No riders found</p>
              </div>
            ) : (
              filteredRiders.map(rider => (
                <motion.button
                  key={rider.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedRider(rider)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${selectedRider?.id === rider.id
                    ? 'bg-emerald-500/10 border-emerald-500'
                    : 'bg-[var(--bg-tertiary)]/50 border-[var(--border-subtle)] hover:border-emerald-500/50'
                    }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{rider.name || 'Unknown'}</h3>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">{rider.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Wallet</p>
                    <p className="text-xs font-black text-emerald-500 tracking-wider">₹{rider.walletBalance}</p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Refund Form Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative">
          <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-6">
            <CreditCard size={16} className="text-emerald-500" /> Refund Details
          </h2>

          {selectedRider ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Selected Target</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{selectedRider.name || selectedRider.phone}</p>
                </div>
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Refund Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ENTER AMOUNT..."
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-lg font-black text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Barcode Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Upload Barcode (QR Code)</label>
                <div className="relative flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="barcode-upload"
                  />
                  <label
                    htmlFor="barcode-upload"
                    className="flex-1 bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-subtle)] hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <ImageIcon size={24} className="text-[var(--text-tertiary)] mb-2" />
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Click to Upload Image</span>
                  </label>
                  {barcodeImage && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-500/30">
                      <img src={barcodeImage} alt="Barcode Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setBarcodeImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">UPI ID</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9999999999@upi"
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-[var(--text-tertiary)]" size={16} />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="REASON FOR REFUND..."
                    rows={4}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-[12px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={processing || !amount}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    PAY NOW FROM WALLET <CreditCard size={16} />
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-[var(--border-subtle)] rounded-2xl opacity-50">
              <User size={48} className="mb-4 text-[var(--text-tertiary)]" />
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">No Target Selected</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mt-2 max-w-[200px]">Select a rider from the list to proceed with refund</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Wallet History Section */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl">
        <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-6">
          <History size={16} className="text-emerald-500" /> Admin Wallet History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Date & Time</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Type</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Amount</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Remaining</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Target</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {adminHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                    No transactions found
                  </td>
                </tr>
              ) : (
                adminHistory.map(tx => (
                  <tr key={tx._id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                    <td className="py-4 text-[11px] font-bold text-[var(--text-primary)]">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${
                        tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-4 text-xs font-black tracking-wider ${
                      tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td className="py-4 text-xs font-black tracking-wider text-[var(--text-secondary)]">
                      ₹{tx.closingBalance || 0}
                    </td>
                    <td className="py-4 text-[11px] font-bold text-[var(--text-primary)]">
                      {tx.targetType === 'Self' ? 'Admin Wallet' : (tx.targetRider?.name || tx.targetRider?.phone || 'Unknown Rider')}
                    </td>
                    <td className="py-4 text-[11px] font-bold text-[var(--text-tertiary)] max-w-[200px] truncate">
                      {tx.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
