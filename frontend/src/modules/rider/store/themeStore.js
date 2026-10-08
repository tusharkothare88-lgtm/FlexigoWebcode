import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // Force light theme
      toggleTheme: () => {}, // Disable toggle
      setTheme: (theme) => set({ theme: 'light' }),
    }),
    {
      name: 'flexigo-theme-storage',
    }
  )
);
