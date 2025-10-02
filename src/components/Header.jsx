import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useCart } from '../contexts/CartContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const { getCartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    showNotification('Logged out successfully', 'success')
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <i className="fas fa-store text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-800">
              SellNext
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/') 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/buy"
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/buy') 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Buy
            </Link>
            <Link
              to="/sell"
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/sell') 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Sell
            </Link>
            {isAuthenticated && (
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActive('/profile') 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <div className="relative">
                  <Link 
                    to="/cart"
                    className="p-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 block"
                  >
                    <i className="fas fa-shopping-cart text-xl"></i>
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    Welcome, {user?.fullName?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user?.userType?.includes('buyer') ? 'Buyer' : 'Seller'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white rounded-b-lg shadow-lg">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive('/') 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/buy"
                className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive('/buy') 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Buy
              </Link>
              <Link
                to="/sell"
                className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive('/sell') 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Sell
              </Link>
              {isAuthenticated && (
                <Link
                  to="/profile"
                  className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive('/profile') 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  Profile
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {/* Cart Button for Mobile */}
                  <Link 
                    to="/cart"
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-shopping-cart mr-3"></i>
                      Cart
                    </div>
                    {getCartCount() > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      Welcome, {user?.fullName?.split(' ')[0]}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.userType?.includes('buyer') ? 'Buyer' : 'Seller'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium text-center shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
