import { create } from 'zustand';
import api from '../../../lib/axios';

export const useHandoverStore = create((set, get) => ({
  activeStep: 0,
  mode: 'intake', // intake | dispatch
  handoverData: {
    subscriberId: null,
    vehicleId: null,
    photos: { front: null, back: null, left: null, right: null },
    inspection: { body: false, tires: false, mirrors: false, lights: false, batteryCable: false },
    batteryLevel: 80,
    returnDate: null,
    dues: 0,
    finalStatus: 'available', // available | quarantined | in-service
  },

  setStep: (step) => set({ activeStep: step }),
  setMode: (mode) => set({ mode, activeStep: 0 }),
  
  updateHandoverData: (data) => set((state) => ({
    handoverData: { ...state.handoverData, ...data }
  })),

  submitHandover: async () => {
    const { mode, handoverData } = get();
    try {
      const res = await api.post('/franchise/handover', {
        mode,
        ...handoverData
      });
      return res.data;
    } catch (error) {
      console.error('Handover submission failed:', error);
      return { success: false, message: error.message };
    }
  },

  resetHandover: () => set((state) => ({
    activeStep: 0,
    handoverData: {
      subscriberId: null,
      vehicleId: null,
      photos: { front: null, back: null, left: null, right: null },
      inspection: { body: false, tires: false, mirrors: false, lights: false, batteryCable: false },
      batteryLevel: 80,
      returnDate: null,
      dues: 0,
      finalStatus: 'available',
    }
  }))
}));

