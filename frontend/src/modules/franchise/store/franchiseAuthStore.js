import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useFranchiseAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      phone: null,
      otpSent: false,
      registrationData: {},
      currentStep: 1,
      isVerified: false,
      token: null,
      plans: [],

      setStep: (step) => set({ currentStep: step }),
      setIsVerified: (status) => set({ isVerified: status }),
      setPhone: (phone) => set({ phone }),

      fetchPlans: async () => {
        try {
          const res = await api.get('/franchise/plans');
          if (res.data.success) {
            set({ plans: res.data.plans });
          }
        } catch (error) {
          console.error('Failed to fetch plans:', error);
        }
      },

      sendOTP: async (phone) => {
        try {
          const res = await api.post('/franchise/auth/send-otp', { phone });
          if (res.data.success) {
            set({ phone, otpSent: true });
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
        }
      },

      verifyOTP: async (otp, fcmToken = null) => {
        try {
          const { phone } = get();
          const res = await api.post('/franchise/auth/verify-otp', { phone, otp, fcmToken });
          if (res.data.success) {
            set({ 
              isAuthenticated: true, 
              user: res.data.franchise, 
              token: res.data.token 
            });
            return { success: true, franchise: res.data.franchise };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
        }
      },

      resetPassword: async (phone, otp, newPassword) => {
        try {
          const res = await api.post('/franchise/auth/reset-password', { phone, otp, newPassword });
          if (res.data.success) {
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
        }
      },

      loginWithPassword: async (email, password) => {
        try {
          const res = await api.post('/franchise/auth/login', { email, password });
          if (res.data.success) {
            set({ 
              isAuthenticated: true, 
              user: res.data.franchise, 
              token: res.data.token 
            });
            return { success: true, franchise: res.data.franchise };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Invalid Credentials' };
        }
      },

      updateRegistration: async (data) => {
        try {
          const { user, phone: storePhone } = get();
          const id = user?.id || user?._id; 
          const phone = data.phone || storePhone;
          const res = await api.post('/franchise/update-registration', { ...data, phone, id });
          
          if (res.data.success) {
            // Filter out any potentially large data before updating state
            const { kycDetails, ...cleanFranchise } = res.data.franchise;
            
            set({ 
              registrationData: cleanFranchise,
              user: cleanFranchise,
              phone: cleanFranchise.phone 
            });
            
            return res.data;
          }
          return res.data;
        } catch (error) {
          console.error('Update Error:', error);
          return { success: false, message: 'Failed to update' };
        }
      },

      generateAadhaarOTP: async (aadhaarNumber) => {
        try {
          const res = await api.post('/franchise/kyc/aadhaar/generate-otp', { aadhaarNumber });
          return res.data;
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to send Aadhaar OTP' };
        }
      },

      verifyAadhaarOTP: async (client_id, otp) => {
        try {
          const { phone } = get();
          const res = await api.post('/franchise/kyc/aadhaar/verify-otp', { client_id, otp, phone });
          return res.data;
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Aadhaar Verification Failed' };
        }
      },

      logout: () => {
          set({ isAuthenticated: false, user: null, phone: null, otpSent: false, registrationData: {}, currentStep: 1, isVerified: false, token: null });
          localStorage.removeItem('franchise-auth');
      },
    }),
    { 
      name: 'franchise-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        phone: state.phone,
        currentStep: state.currentStep,
        isVerified: state.isVerified,
        registrationData: state.registrationData, 
      })
    }
  )
);
