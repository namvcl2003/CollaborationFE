import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,

      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.isDarkMode;

        // Apply dark mode to document
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        return { isDarkMode: newDarkMode };
      }),

      setDarkMode: (isDark) => set(() => {
        // Apply dark mode to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        return { isDarkMode: isDark };
      }),

      initDarkMode: () => set((state) => {
        // Initialize dark mode from stored state
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return state;
      }),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);
