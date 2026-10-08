import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Image as ImageIcon, Send, History, Wallet, CheckCircle2, Phone, CreditCard, ExternalLink, X } from 'lucide-react';
import api from '../../../lib/axios';

export default function AdhocPaymentPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [barcodeImage, setBarcodeImage] = useState(null); // base64

  const [adminWallet, setAdminWallet] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For modal view

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    fetchHistory();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/refund/dashboard');
      if (res.data?.success) {
        setAdminWallet(res.data.walletBalance);
      }
    } catch (error) {
      console.error('Failed to load admin wallet dashboard');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/adhoc-payments');
      if (res.data?.success) {
        setHistory(res.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load adhoc payments history');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || amount <= 0) return alert('Please enter a valid amount');
    if (!upiId && !phone && !barcodeImage) return alert('Please provide at least a UPI ID, Phone Number, or Barcode');
    if (adminWallet < Number(amount)) return alert('Insufficient Admin Wallet Balance');

    try {
      setProcessing(true);
      const payload = {
        amount: Number(amount),
        description,
        upiId,
        phone,
        barcodeUrl: barcodeImage
      };

      const res = await api.post('/admin/adhoc-payment', payload);

      if (res.data?.success) {
        alert('Adhoc Payment processed successfully!');
        setAmount('');
        setDescription('');
        setUpiId('');
        setPhone('');
        setBarcodeImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDashboard();
        fetchHistory();
      } else {
        alert(res.data?.message || 'Failed to process payment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing adhoc payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header & Wallet Sync */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Adhoc Payment Console</h1>
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Manual Payouts & Reimbursements</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-lg flex items-center gap-6 min-w-[300px]">
          <div>
            <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1">
              <Wallet size={12} className="text-emerald-500" /> Admin Wallet Balance
            </p>
            <p className="text-3xl font-black text-[var(--text-primary)] mt-1">₹{adminWallet}</p>
          </div>
          <div className="h-10 w-[1px] bg-[var(--border-subtle)]" />
          <div className="flex-1 flex gap-2">
            <button
              onClick={fetchDashboard}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 w-full"
            >
              <History size={16} className="mr-2" /> Sync Balance
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Payment Form Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

          <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-6">
            <Send size={16} className="text-emerald-500" /> Payment Details
          </h2>

          <div className="space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Payment Amount (₹) <span className="text-red-500">*</span></label>
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
                    const val = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
                    if (val.length <= 10) setPhone(val);
                  }}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Description / Reason</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter reason for payment..."
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl p-3 text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors h-20 resize-none"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || (!upiId && !phone && !barcodeImage) || !amount}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-xl py-4 font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {processing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> Process Adhoc Payment</>}
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <History size={16} className="text-emerald-500" /> Adhoc Payment History
          </h2>
          <button onClick={fetchHistory} className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:underline">Refresh</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4">Date & Time</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4">Amount</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4">Remaining</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4">Target Details</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4">Description</th>
                <th className="pb-3 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-4 text-center">Barcode</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No adhoc payments found</p>
                  </td>
                </tr>
              ) : (
                history.map((tx) => (
                  <tr key={tx._id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-[var(--text-primary)]">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] font-bold">{new Date(tx.createdAt).toLocaleTimeString('en-IN')}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-black text-rose-500">-₹{tx.amount}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-black text-[var(--text-primary)]">₹{tx.closingBalance || 0}</p>
                    </td>
                    <td className="py-4 px-4">
                      {tx.upiId && <p className="font-bold text-[var(--text-primary)] text-xs">UPI: {tx.upiId}</p>}
                      {tx.phone && <p className="font-bold text-[var(--text-secondary)] text-xs mt-0.5">Ph: {tx.phone}</p>}
                      {!tx.upiId && !tx.phone && <p className="font-bold text-[var(--text-tertiary)] text-xs">N/A</p>}
                    </td>
                    <td className="py-4 px-4 max-w-[250px]">
                      <p className="text-xs font-bold text-[var(--text-secondary)] truncate" title={tx.description}>{tx.description}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {tx.barcodeUrl ? (
                        <button
                          onClick={() => setSelectedImage(tx.barcodeUrl)}
                          className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
                        >
                          <ImageIcon size={12} /> View
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-md w-full max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <img src={selectedImage} alt="Uploaded Barcode" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
