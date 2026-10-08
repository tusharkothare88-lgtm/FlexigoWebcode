import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // Force light theme
      toggleTheme: () => {}, // Disable toggle
      setTheme: (theme) => {
        document.documentElement.classList.remove('dark');
        set({ theme: 'light' });
      },
    }),
    {
      name: 'admin-theme-storage',
    }
  )
);
