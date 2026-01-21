import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      initTheme: () => {
        const { theme } = get()
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }),
    {
      name: 'jivs-theme'
    }
  )
)
