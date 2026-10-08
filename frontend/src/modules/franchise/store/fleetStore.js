import { create } from 'zustand';
import api from '../../../lib/axios';

export const useFleetStore = create((set, get) => ({
  vehicles: [],
  isLoading: false,
  filter: 'all', 

  setFilter: (filter) => set({ filter }),
  
  fetchVehicles: async (franchiseId) => {
    set({ isLoading: true });
    try {
      const params = {};
      if (franchiseId) params.franchiseId = franchiseId;
      
      const res = await api.get('/fleet', { params });
      if (res.data.success) {
        set({ vehicles: res.data.vehicles });
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addVehicle: async (newVehicle) => {
    try {
      const res = await api.post('/franchise/fleet/add', newVehicle);
      if (res.data.success) {
        set((state) => ({
          vehicles: [res.data.vehicle, ...state.vehicles]
        }));
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add vehicle' };
    }
  },

  updateVehicleStatus: async (id, status) => {
    try {
      const res = await api.patch(`/fleet/${id}/status`, { status });
      if (res.data.success) {
        set((state) => ({
          vehicles: state.vehicles.map(v => v._id === id ? res.data.vehicle : v)
        }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  },

  addMaintenanceLog: async (id, log) => {
    try {
      const res = await api.post(`/fleet/${id}/maintenance`, log);
      if (res.data.success) {
        set((state) => ({
          vehicles: state.vehicles.map(v => v._id === id ? res.data.vehicle : v)
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to add maintenance log:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add log' };
    }
  },
  
  updateVehicleAttachment: async (id, attachmentBase64) => {
    try {
      const res = await api.patch(`/admin/fleet/${id}/attachment`, { attachment: attachmentBase64 });
      if (res.data.success) {
        set(state => ({
          vehicles: state.vehicles.map(v => (v._id === id || v.id === id) ? { ...v, attachmentUrl: res.data.attachmentUrl } : v)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update vehicle attachment:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
}));
