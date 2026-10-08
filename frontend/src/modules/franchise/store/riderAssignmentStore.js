import { create } from 'zustand';
import api from '../../../lib/axios';

export const useSubscriberStore = create((set, get) => ({
  subscribers: [],
  isLoading: false,

  fetchSubscribers: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/rider/subscribers');
      if (res.data.success) {
        set({ subscribers: res.data.subscribers });
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSubscriber: async (riderData) => {
    try {
      const res = await api.post('/franchise/riders/add', riderData);
      if (res.data.success) {
        set((state) => ({ subscribers: [...state.subscribers, res.data.rider] }));
        return { success: true, rider: res.data.rider };
      }
      return { success: false, message: 'Failed to add rider' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add rider' };
    }
  },

  assignVehicle: async (subscriberId, vehicleId) => {
    try {
      // Logic would be linked to backend: api.post('/rider/assign', { subscriberId, vehicleId })
      set((state) => ({
        subscribers: state.subscribers.map(s =>
          (s._id || s.id) === subscriberId
            ? { ...s, vehicleId, status: 'active', subscriptionStart: new Date().toISOString() }
            : s
        )
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  dispatchVehicle: async (subscriberId, vehicleId, returnDate) => {
    // Similarly linked to backend
    set((state) => ({
      subscribers: state.subscribers.map(s =>
        (s._id || s.id) === subscriberId
          ? {
            ...s,
            vehicleId,
            status: 'active',
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: returnDate
          }
          : s
      )
    }));
  },
  returnVehicle: async (subscriberId, status) => {
    set((state) => ({
      subscribers: state.subscribers.map(s => {
        const id = s._id || s.id;
        return id === subscriberId
          ? { ...s, vehicleId: null, status: status || 'completed', subscriptionStart: null }
          : s;
      })
    }));
  },

  payRiderPlan: async (riderId, planId) => {
    try {
      const res = await api.post('/franchise/riders/pay-plan', { riderId, planId });
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to pay plan' };
    }
  },

  payRiderDeposit: async (riderId, depositAmount = 2800) => {
    try {
      const res = await api.post('/franchise/riders/pay-deposit', { riderId, depositAmount });
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to pay deposit' };
    }
  },

  generateAadhaarOTP: async (aadhaarNumber) => {
    try {
      const res = await api.post('/rider/kyc/aadhaar/generate-otp', { aadhaarNumber });
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  },

  verifyAadhaarOTP: async (client_id, otp, phone) => {
    try {
      const res = await api.post('/rider/kyc/aadhaar/verify-otp', { client_id, otp, phone });
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  }
}));

export const useRiderAssignmentStore = useSubscriberStore;

