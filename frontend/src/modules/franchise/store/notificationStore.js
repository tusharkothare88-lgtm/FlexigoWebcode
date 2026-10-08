import { create } from 'zustand';
import api from '../../../lib/axios';

export const useFranchiseNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  get unreadCount() {
    return get().notifications.filter(n => !n.read).length;
  },

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/franchise/notifications');
      if (res.data.success) {
        set({ notifications: res.data.notifications });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ loading: false });
    }
  },

  readNotification: async (id) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map(n => 
          (n._id === id || n.id === id) ? { ...n, read: true } : n
        )
      }));
      await api.patch(`/franchise/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  },

  markAllRead: async () => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
      await api.patch('/franchise/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  },

  addNotification: (notification) => set((state) => ({
    notifications: [{ 
      _id: `temp-${Date.now()}`, 
      read: false, 
      createdAt: new Date(), 
      ...notification 
    }, ...state.notifications]
  }))
}));
