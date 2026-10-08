import { create } from 'zustand';
import api from '../../../lib/axios';

export const useFranchiseWalletStore = create((set, get) => ({
  balance: 0,
  pendingPayout: 0,
  ledger: [],
  isLoading: false,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/franchise/wallet');
      if (res.data.success) {
        set({ 
          balance: res.data.balance, 
          ledger: res.data.ledger 
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSubscriptionPayment: async (amount, subscriber) => {
    // This would typically be triggered by a backend event or a manual entry
    // For now, we update frontend after a mock success
    set((state) => ({
      balance: state.balance + amount,
      ledger: [
        { 
          id: `T-${state.ledger.length + 1}`, 
          date: new Date().toISOString(), 
          type: 'Subscription', 
          amount, 
          subscriberName: subscriber,
          status: 'completed' 
        }, 
        ...state.ledger
      ]
    }));
  },

  addFunds: async (amount, method) => {
    try {
      const res = await api.post('/franchise/wallet/add', { amount, method });
      if (res.data.success) {
        set((state) => ({
          balance: res.data.walletBalance,
          ledger: [res.data.transaction, ...state.ledger]
        }));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Failed to add funds', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add funds' };
    }
  },

  requestPayout: async (amount) => {
    try {
      // In real app: await api.post('/franchise/payout', { amount });
      set((state) => ({
        balance: state.balance - amount,
        pendingPayout: state.pendingPayout + amount,
        ledger: [
          { 
            id: `T-${state.ledger.length + 1}`, 
            date: new Date().toISOString(), 
            type: 'Payout', 
            amount: -amount,
            subscriberName: null,
            status: 'pending' 
          }, 
          ...state.ledger
        ]
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Payout request failed' };
    }
  }
}));

