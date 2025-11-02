import toast from 'react-hot-toast'

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: 600,
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    })
  },

  error: (message: string) => {
    toast.error(message, {
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: 600,
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: 600,
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
    return toast.promise(promise, messages, {
      style: {
        minWidth: '250px',
        fontWeight: 600,
      },
      success: {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      },
      error: {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      },
    })
  },

  custom: (message: string, emoji?: string) => {
    toast(message, {
      icon: emoji || '✨',
      style: {
        background: '#6366f1',
        color: '#fff',
        fontWeight: 600,
      },
    })
  },
}
