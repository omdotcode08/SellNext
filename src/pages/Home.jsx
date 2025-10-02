import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../contexts/NotificationContext'
import TestConnection from '../components/TestConnection'

const Home = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  
  const [selectedRole, setSelectedRole] = useState(null)
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      setLocation(savedLocation)
    }
  }, [])

  const handleRoleSelection = useCallback((role) => {
    setSelectedRole(role)
    localStorage.setItem('selectedRole', role)
    
    showNotification(`You selected: ${role.charAt(0).toUpperCase() + role.slice(1)}`, 'success')
    
    // Redirect after a short delay
    setTimeout(() => {
      if (role === 'buyer') {
        navigate('/buy')
      } else if (role === 'seller') {
        navigate('/sell')
      }
    }, 1500)
  }, [navigate, showNotification])

  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true)
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        
        // Get location from coordinates using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
        )
        const data = await response.json()
        
        if (data.display_name) {
          const city = data.address.city || data.address.town || data.address.village || 'Unknown Location'
          setLocation(city)
          localStorage.setItem('userLocation', city)
          showNotification(`Location detected: ${city}`, 'success')
        } else {
          showNotification('Location detected but could not get city name.', 'warning')
        }
      } catch (error) {
        console.error('Error getting location:', error)
        showNotification('Unable to detect location. Please enter manually.', 'error')
      }
    } else {
      showNotification('Geolocation is not supported by this browser.', 'error')
    }
    
    setIsDetectingLocation(false)
  }, [showNotification])

  const saveLocation = useCallback(() => {
    if (location.trim()) {
      localStorage.setItem('userLocation', location.trim())
      showNotification(`Location saved: ${location.trim()}`, 'success')
    } else {
      showNotification('Please enter a valid location.', 'error')
    }
  }, [location, showNotification])

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      localStorage.setItem('searchQuery', searchQuery.trim())
      navigate(`/buy?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      showNotification('Please enter a search term.', 'error')
    }
  }, [searchQuery, navigate, showNotification])

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      action()
    }
  }, [])

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-16 text-center min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-5">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent animate-fade-in-up">
            SellNext
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Your Local Marketplace for Buying and Selling
          </p>
          
          {/* User Role Selection */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-semibold mb-8">Choose Your Role</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div 
                className={`role-card bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/20 hover:shadow-2xl min-w-[250px] ${
                  selectedRole === 'buyer' ? 'bg-white/30 transform scale-105' : ''
                }`}
                onClick={() => handleRoleSelection('buyer')}
              >
                <i className="fas fa-shopping-cart text-5xl mb-4 text-white"></i>
                <h3 className="text-2xl font-semibold mb-2">Buyer</h3>
                <p className="opacity-90 text-sm">Discover amazing products from local sellers</p>
              </div>
              <div 
                className={`role-card bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/20 hover:shadow-2xl min-w-[250px] ${
                  selectedRole === 'seller' ? 'bg-white/30 transform scale-105' : ''
                }`}
                onClick={() => handleRoleSelection('seller')}
              >
                <i className="fas fa-store text-5xl mb-4 text-white"></i>
                <h3 className="text-2xl font-semibold mb-2">Seller</h3>
                <p className="opacity-90 text-sm">Sell your products to local buyers</p>
              </div>
            </div>
          </div>

          {/* Location Selection */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-3xl font-semibold mb-8">Select Your Location</h2>
            <div className="flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 max-w-lg mx-auto">
              <i className="fas fa-map-marker-alt text-white ml-4 mr-2 text-lg"></i>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, saveLocation)}
                placeholder="Enter your city or zip code" 
                className="flex-1 bg-transparent border-none text-white placeholder-white/70 p-4 text-lg outline-none"
              />
              <button 
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="detect-btn bg-white/20 border-none text-white px-6 py-3 rounded-full cursor-pointer transition-all duration-300 font-medium flex items-center gap-2 hover:bg-white/30 hover:transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDetectingLocation ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <i className="fas fa-crosshairs"></i>
                )}
                {isDetectingLocation ? 'Detecting...' : 'Detect'}
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 max-w-2xl mx-auto">
              <i className="fas fa-search text-white ml-4 mr-2 text-lg"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSearch)}
                placeholder="Search for products..." 
                className="flex-1 bg-transparent border-none text-white placeholder-white/70 p-4 text-lg outline-none"
              />
              <button 
                onClick={handleSearch}
                className="bg-green-500 border-none text-white px-8 py-3 rounded-full cursor-pointer transition-all duration-300 font-medium hover:bg-green-600 hover:transform hover:-translate-y-1"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-semibold mb-6 text-gray-800">About SellNext</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                SellNext is your trusted local marketplace connecting buyers and sellers in your community. We believe in the power of local commerce and building strong community relationships.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-md rounded-xl">
                  <i className="fas fa-shield-alt text-2xl text-purple-600 w-10 text-center"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Secure Transactions</h3>
                    <p className="text-gray-600 text-sm">Safe and secure payment processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-md rounded-xl">
                  <i className="fas fa-users text-2xl text-purple-600 w-10 text-center"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Local Community</h3>
                    <p className="text-gray-600 text-sm">Connect with people in your area</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-md rounded-xl">
                  <i className="fas fa-mobile-alt text-2xl text-purple-600 w-10 text-center"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Easy to Use</h3>
                    <p className="text-gray-600 text-sm">Simple and intuitive interface</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-store text-6xl text-white opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-4xl font-semibold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Role</h3>
              <p className="opacity-90 leading-relaxed">Decide whether you want to buy or sell</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold mb-4">Set Your Location</h3>
              <p className="opacity-90 leading-relaxed">Enter your location to find local deals</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold mb-4">Start Trading</h3>
              <p className="opacity-90 leading-relaxed">Browse products or list your items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Connection Test - Developer Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-4">Developer Tools</h2>
            <p className="text-gray-300">Test backend connectivity and system status</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6">
            <TestConnection />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
