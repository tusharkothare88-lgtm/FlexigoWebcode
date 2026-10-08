import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useSubscriptionStore = create(
  persist(
    (set) => ({
      activePlan: null,
      selectedPlan: null,
      plans: [
        {
          id: 'daily',
          label: 'Daily Quick',
          price: 299,
          duration: '1 Day',
          durationMs: 86400000,
          perks: ['Unlimited rides', 'Free battery swap (2x)', '24/7 support'],
          color: '#00D4FF',
          popular: false,
        },
        {
          id: 'weekly',
          label: 'Weekly Pro',
          price: 1499,
          duration: '7 Days',
          durationMs: 604800000,
          perks: ['Unlimited rides', 'Free battery swap (15x)', 'Priority support', 'Ride insurance'],
          color: '#39FF14',
          popular: true,
        },
        {
          id: 'monthly',
          label: 'Monthly Tier',
          price: 4999,
          duration: '30 Days',
          durationMs: 2592000000,
          perks: ['Unlimited rides', 'Unlimited battery swaps', 'Dedicated support', 'Ride insurance'],
          color: '#BF5AF2',
          popular: false,
        },
      ],

      selectPlan: (plan) => set({ selectedPlan: plan }),
      activatePlan: (plan) => set({ activePlan: { ...plan, activatedAt: Date.now(), expiresAt: Date.now() + plan.durationMs } }),
      
      fetchPlans: async () => {
        try {
          const res = await api.get('/rider/plans');
          if (res.data.success) {
            set({ plans: res.data.plans });
          }
        } catch (err) {
          console.error("Failed to fetch plans:", err);
        }
      }
    }),
    { name: 'rider-subscription' }
  )
);
