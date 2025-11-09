import toast from 'react-hot-toast'

// Configuración personalizada de toasts con el tema naranja de UESVALLE
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#1a1a1a',
        border: '1px solid #22c55e',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#22c55e',
        secondary: '#fff',
      },
    })
  },

  error: (message: string) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#1a1a1a',
        border: '1px solid #ef4444',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#1a1a1a',
        border: '1px solid #f97316',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#f97316',
        secondary: '#fff',
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          background: '#fff',
          color: '#1a1a1a',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }
    )
  },
}
