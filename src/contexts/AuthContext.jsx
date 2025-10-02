import { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken()
        if (token) {
          const response = await apiService.getCurrentUser()
          setUser(response.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // Clear invalid token
        apiService.removeAuthToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password, remember = false) => {
    try {
      const response = await apiService.login({ email, password })
      
      // Store token
      apiService.setAuthToken(response.token, remember)
      
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await apiService.signup(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    apiService.removeAuthToken()
    setUser(null)
  }

  const updateUser = async (updates) => {
    try {
      const response = await apiService.updateProfile(updates)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
