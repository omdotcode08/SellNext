import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'
import apiService from '../services/api'

const FavoritesContext = createContext()

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // Load user favorites
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      setFavorites([])
      return
    }

    setLoading(true)
    try {
      const response = await apiService.getUserFavorites()
      const favoriteIds = (response.products || []).map(product => product._id)
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Error loading favorites:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?._id])

  // Load favorites when user changes
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Check if product is favorited
  const isFavorited = useCallback((productId) => {
    return favorites.includes(productId)
  }, [favorites])

  // Add to favorites
  const addToFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) {
      showNotification('Please login to add favorites.', 'error')
      return false
    }

    try {
      await apiService.addToFavorites(productId)
      setFavorites(prev => [...prev, productId])
      showNotification('Added to favorites!', 'success')
      return true
    } catch (error) {
      console.error('Error adding to favorites:', error)
      const errorMessage = error.response?.data?.message || 'Failed to add to favorites.'
      showNotification(errorMessage, 'error')
      return false
    }
  }, [isAuthenticated, showNotification])

  // Remove from favorites
  const removeFromFavorites = useCallback(async (productId) => {
    try {
      await apiService.removeFromFavorites(productId)
      setFavorites(prev => prev.filter(id => id !== productId))
      showNotification('Removed from favorites!', 'success')
      return true
    } catch (error) {
      console.error('Error removing from favorites:', error)
      const errorMessage = error.response?.data?.message || 'Failed to remove from favorites.'
      showNotification(errorMessage, 'error')
      return false
    }
  }, [showNotification])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId) => {
    if (isFavorited(productId)) {
      return await removeFromFavorites(productId)
    } else {
      return await addToFavorites(productId)
    }
  }, [isFavorited, addToFavorites, removeFromFavorites])

  const value = {
    favorites,
    loading,
    isFavorited,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    loadFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export default FavoritesContext
