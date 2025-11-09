import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, LoginCredentials, Usuario } from '@/shared/types/auth'
import { authService } from '@/shared/services/auth-service'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          const response = await authService.login(credentials)

          set({
            token: response.token,
            usuario: response.usuario,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Limpiar el store
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
          isLoading: false
        })

        // Llamar al endpoint de logout si existe
        authService.logout().catch(() => {
          // Ignorar errores del logout en el servidor
        })
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
      },

      setUsuario: (usuario: Usuario) => {
        set({ usuario })
      },

      initialize: () => {
        const state = get()
        if (state.token && state.usuario) {
          set({ isAuthenticated: true })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
