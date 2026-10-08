import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      loading: false,

      fetchWalletData: async (phone) => {
        if (!phone) return;
        set({ loading: true });
        try {
          const res = await api.get(`/rider/wallet/${phone}`);
          if (res.data.success) {
            set({ 
              balance: res.data.walletBalance, 
              transactions: res.data.transactions 
            });
          }
        } catch (error) {
          console.error('Failed to fetch wallet data', error);
        } finally {
          set({ loading: false });
        }
      },

      addMoney: async (phone, amount) => {
        try {
          const res = await api.post('/rider/wallet/add', { phone, amount });
          if (res.data.success) {
            set((state) => ({
              balance: res.data.walletBalance,
              transactions: [
                {
                  _id: Date.now(),
                  type: 'credit',
                  description: 'Added to wallet',
                  amount,
                  createdAt: new Date().toISOString(),
                },
                ...state.transactions,
              ],
            }));
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to add money' };
        }
      },

      deductMoney: (amount, label) => {
        // Logic for local deduction if needed, but ideally should hit API
        set((state) => ({
          balance: Math.max(0, state.balance - amount),
          transactions: [
            {
              _id: Date.now(),
              type: 'debit',
              description: label,
              amount,
              createdAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }));
      },
    }),
    { name: 'rider-wallet' }
  )
);
