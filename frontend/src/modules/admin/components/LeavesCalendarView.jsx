import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';

export default function LeavesCalendarView() {
  const { leaves, fetchLeaves, staff, addLeave, updateLeaveStatus } = useAdminDataStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLeave, setNewLeave] = useState({
    staffId: '',
    startDate: '',
    endDate: '',
    leaveType: 'Casual',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.staffId || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;

    setIsSubmitting(true);
    await addLeave(newLeave);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewLeave({ staffId: '', startDate: '', endDate: '', leaveType: 'Casual', reason: '' });
  };

  // Helper to check if a date has a leave
  const getLeavesForDate = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    targetDate.setHours(0, 0, 0, 0);

    return leaves.filter(l => {
      const start = new Date(l.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.endDate);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    });
  };

  const getLeaveColor = (type) => {
    switch (type) {
      case 'Sick': return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
      case 'Paid': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'Unpaid': return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
      default: return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)]/40 p-1 rounded-lg border border-[var(--border-subtle)]">
            <button onClick={handlePrevMonth} className="p-1.5 hover:text-emerald-500 transition-all"><ChevronLeft size={16} /></button>
            <span className="text-[11px] font-black uppercase px-2 text-[var(--text-primary)] tracking-widest min-w-[120px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 hover:text-emerald-500 transition-all"><ChevronRight size={16} /></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-[9px] font-bold text-[var(--text-tertiary)] hover:text-emerald-500 uppercase transition-all">Today</button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={14} /> Mark Leave
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest border-r border-[var(--border-subtle)] last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] bg-[var(--bg-tertiary)]/10 border-r border-b border-[var(--border-subtle)] p-2 opacity-50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayLeaves = getLeavesForDate(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div key={day} className={`min-h-[120px] border-r border-b border-[var(--border-subtle)] p-2 transition-colors hover:bg-[var(--bg-tertiary)]/20 ${isToday ? 'bg-emerald-500/5' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black ${isToday ? 'text-emerald-500 bg-emerald-500/10 px-1.5 rounded' : 'text-[var(--text-secondary)]'}`}>
                    {day}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {dayLeaves.slice(0, 3).map(leave => (
                    <div
                      key={leave._id}
                      title={`${leave.reason}\nApplied on: ${new Date(leave.createdAt).toLocaleDateString()}`}
                      className={`px-2 py-1.5 flex flex-col gap-0.5 rounded-md border ${getLeaveColor(leave.leaveType)}`}
                    >
                      <span className="text-[10px] font-black uppercase truncate">
                        {leave.staffId?.name || 'Unknown'} - {leave.leaveType}
                      </span>
                      {leave.createdAt && (
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <span className="text-[8px] font-bold opacity-80 uppercase tracking-widest truncate">
                            Duration: {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest truncate">
                            Applied: {new Date(leave.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayLeaves.length > 3 && (
                    <div className="text-[7px] font-black text-[var(--text-tertiary)] text-center uppercase tracking-widest mt-1">
                      +{dayLeaves.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Leave Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                    Record <span className="text-emerald-500">Leave</span>
                  </h2>
                  <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">STAFF_ABSENCE_PROTOCOL</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLeave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Staff Member</label>
                  <select
                    required
                    value={newLeave.staffId}
                    onChange={(e) => setNewLeave({ ...newLeave, staffId: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                  >
                    <option value="">Select Staff</option>
                    {staff.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Start Date</label>
                    <input
                      required
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">End Date</label>
                    <input
                      required
                      type="date"
                      value={newLeave.endDate}
                      min={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Leave Type</label>
                  <select
                    required
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Paid">Paid Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Reason / Note</label>
                  <textarea
                    required
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    placeholder="Brief reason for leave..."
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all resize-none h-20 text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Leave'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
