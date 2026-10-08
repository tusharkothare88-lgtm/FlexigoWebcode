import { create } from 'zustand';

export const useRiderNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        id: Date.now(),
        time: 'Just Now',
        ...notification
      },
      ...state.notifications
    ],
    unreadCount: state.unreadCount + 1
  })),
  markAllRead: () => set({ unreadCount: 0 }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));
