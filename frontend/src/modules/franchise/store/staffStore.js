import { create } from 'zustand';
import api from '../../../lib/axios';

export const useStaffStore = create((set, get) => ({
  staff: [],
  isLoading: false,

  fetchStaff: async (franchiseId) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/staff', { params: { franchiseId } });
      if (res.data.success) {
        set({ staff: res.data.staff });
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addStaff: async (staffData) => {
    try {
      const res = await api.post('/staff/add', staffData);
      if (res.data.success) {
        set((state) => ({
          staff: [res.data.staff, ...state.staff]
        }));
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add staff' };
    }
  },

  updateStaffStatus: async (id, status) => {
    try {
      const res = await api.patch(`/staff/${id}/status`, { status });
      if (res.data.success) {
        set((state) => ({
          staff: state.staff.map(s => (s._id || s.id) === id ? res.data.staff : s)
        }));
      }
    } catch (error) {
      console.error('Failed to update staff status:', error);
    }
  },

  deleteStaff: async (id) => {
    try {
      const res = await api.delete(`/staff/${id}`);
      if (res.data.success) {
        set((state) => ({
          staff: state.staff.filter(s => (s._id || s.id) !== id)
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete staff' };
    }
  }
}));
