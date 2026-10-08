import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle, XCircle, Search, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/withdrawals');
      if (res.data.success) {
        setRequests(res.data.withdrawals);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    if (actionType === 'reject' && !adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const endpoint = `/admin/withdrawals/${selectedRequest._id}/${actionType}`;
      const payload = {
        adminNotes,
        transactionId: actionType === 'approve' ? transactionId : undefined
      };

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        fetchRequests();
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
        setTransactionId('');
      }
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${actionType} request`);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(id);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Withdrawal Requests</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Process rider wallet payouts</p>
        </div>
        
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {['pending', 'approved', 'rejected', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === status 
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl p-12 text-center">
          <p className="text-[var(--text-secondary)] font-medium">No {filter !== 'all' ? filter : ''} requests found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <div key={request._id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  request.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {request.status === 'pending' ? <Clock size={24} /> :
                   request.status === 'approved' ? <CheckCircle size={24} /> :
                   <XCircle size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{request.riderId?.name || request.riderId?.phone || 'Unknown Rider'}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                    {new Date(request.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto">
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">Amount</p>
                  <p className="font-black text-xl text-[var(--text-primary)]">₹{request.amount}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">UPI ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{request.upiId}</p>
                    <button 
                      onClick={() => copyToClipboard(request.upiId, request._id)}
                      className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-tertiary)] hover:text-emerald-500 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi === request._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => { setSelectedRequest(request); setActionType('reject'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => { setSelectedRequest(request); setActionType('approve'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                    >
                      Approve
                    </button>
                  </div>
                )}
                {request.status !== 'pending' && (
                  <div className="ml-auto text-right">
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      request.status === 'approved' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {request.status}
                    </p>
                    {request.transactionId && (
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Ref: {request.transactionId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {selectedRequest && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !processing && setSelectedRequest(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden"
            >
              <div className={`h-2 ${actionType === 'approve' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {actionType === 'approve' 
                      ? `Confirm payment of ₹${selectedRequest.amount} to ${selectedRequest.riderId?.name}.`
                      : `Reject request and refund ₹${selectedRequest.amount} to rider's wallet.`}
                  </p>
                </div>

                <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl space-y-3 border border-[var(--border-subtle)]">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Amount</span>
                     <span className="font-black text-[var(--text-primary)]">₹{selectedRequest.amount}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">UPI ID</span>
                     <div className="flex items-center gap-2">
                       <span className="font-medium text-sm text-[var(--text-primary)]">{selectedRequest.upiId}</span>
                       <button onClick={() => copyToClipboard(selectedRequest.upiId, 'modal')} className="text-[var(--text-tertiary)] hover:text-emerald-500">
                         {copiedUpi === 'modal' ? <Check size={14} /> : <Copy size={14} />}
                       </button>
                     </div>
                   </div>
                </div>

                {actionType === 'approve' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Transaction Ref/UTR (Optional)</label>
                    <input 
                      type="text" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 31234567890"
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3 rounded-xl text-sm outline-none focus:border-emerald-500 text-[var(--text-primary)]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={actionType === 'reject' ? "Reason for rejection..." : "Any additional notes..."}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3 rounded-xl text-sm outline-none focus:border-emerald-500 text-[var(--text-primary)] h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--border-subtle)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    disabled={processing || (actionType === 'reject' && !adminNotes.trim())}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                      actionType === 'approve' 
                        ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50' 
                        : 'bg-red-500 hover:bg-red-600 disabled:bg-red-500/50'
                    }`}
                  >
                    {processing ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      actionType === 'approve' ? 'Mark as Paid' : 'Reject & Refund'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
