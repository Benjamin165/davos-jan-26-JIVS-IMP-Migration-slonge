import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error || 'Login failed'
          }
        }
      },

      register: async (email, password, name) => {
        try {
          const response = await api.post('/auth/register', { email, password, name })
          const { user, token } = response.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error || 'Registration failed'
          }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      checkAuth: async () => {
        const { token } = get()

        if (!token) {
          set({ isLoading: false })
          return
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        try {
          const response = await api.get('/auth/me')
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          })
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }))
      }
    }),
    {
      name: 'jivs-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
)
