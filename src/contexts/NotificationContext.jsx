import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    }

    setNotifications(prev => [...prev, notification])

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id)
    }, duration)

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle'
      case 'error':
        return 'fas fa-exclamation-circle'
      case 'warning':
        return 'fas fa-exclamation-triangle'
      default:
        return 'fas fa-info-circle'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 transform transition-all duration-500 ease-out hover:scale-105`}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            transform: 'translateX(0)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <i className={`${getIcon(notification.type)} text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed break-words">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
