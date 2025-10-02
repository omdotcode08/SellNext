import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import apiService from '../services/api'

const OwnerProfile = () => {
  const { ownerId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { showNotification } = useNotification()
  
  const [owner, setOwner] = useState(null)
  const [ownerProducts, setOwnerProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  
  const productId = searchParams.get('product')

  // Load owner data
  useEffect(() => {
    // Check if user is trying to contact themselves
    if (isAuthenticated && (ownerId === user?._id || ownerId === user?.id)) {
      // Redirect to their own profile
      navigate('/profile')
      return
    }
    loadOwnerData()
  }, [ownerId, isAuthenticated, user, navigate])

  const loadOwnerData = useCallback(async () => {
    console.log('Loading owner data for ID:', ownerId)
    setLoading(true)
    try {
      // Try to fetch real user data first
      try {
        const response = await apiService.getUserProfile(ownerId)
        if (response.user) {
          const userData = response.user
          const ownerData = {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            location: userData.location,
            bio: userData.bio || "No bio available",
            profileImage: userData.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: userData.rating || 4.5,
            totalSales: userData.reviewCount || 0,
            memberSince: userData.memberSince || "2023-01-15",
            userType: userData.userType || "seller"
          }
          setOwner(ownerData)
          
          // Also fetch the owner's products
          try {
            const productsResponse = await apiService.getUserProducts(ownerId)
            const products = (productsResponse.products || []).map(product => ({
              id: product._id || product.id,
              title: product.title,
              price: product.price,
              originalPrice: product.originalPrice,
              category: product.category,
              condition: product.condition,
              status: product.status,
              views: product.views || 0,
              postedDate: product.createdAt || product.postedDate,
              image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
              description: product.description
            }))
            setOwnerProducts(products)
          } catch (productError) {
            console.log('Could not fetch owner products, using empty array')
            setOwnerProducts([])
          }
          
          setLoading(false)
          return
        }
      } catch (error) {
        console.log('Could not fetch user data, using mock data:', error)
      }
      
      // Fallback to mock data for development
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock owner data - try to match with known sellers
      const knownSellers = {
        'seller_1': {
          id: 'seller_1',
          fullName: "TechGuru",
          email: "techguru@example.com",
          phone: "+91 98765 43210",
          location: "Mumbai, Maharashtra",
          bio: "Tech enthusiast and gadget collector. I sell quality electronics at great prices. All items are tested and in excellent condition.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.8,
          totalSales: 127,
          memberSince: "2022-01-15"
        },
        'seller_2': {
          id: 'seller_2',
          fullName: "AppleFan",
          email: "applefan@example.com",
          phone: "+91 98765 43211",
          location: "Delhi, India",
          bio: "Apple product enthusiast and collector. I sell authentic Apple products in excellent condition.",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.9,
          totalSales: 89,
          memberSince: "2021-03-20"
        },
        'seller_3': {
          id: 'seller_3',
          fullName: "SneakerHead",
          email: "sneakerhead@example.com",
          phone: "+91 98765 43212",
          location: "Bangalore, Karnataka",
          bio: "Sneaker collector and fashion enthusiast. I sell authentic sneakers and fashion items.",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.7,
          totalSales: 45,
          memberSince: "2023-01-10"
        },
        'seller_4': {
          id: 'seller_4',
          fullName: "MobileWorld",
          email: "mobileworld@example.com",
          phone: "+91 98765 43213",
          location: "Chennai, Tamil Nadu",
          bio: "Mobile phone specialist. I sell authentic smartphones and accessories in excellent condition.",
          profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.6,
          totalSales: 156,
          memberSince: "2020-05-15"
        },
        'seller_5': {
          id: 'seller_5',
          fullName: "PhotoPro",
          email: "photopro@example.com",
          phone: "+91 98765 43214",
          location: "Hyderabad, Telangana",
          bio: "Professional photographer and camera equipment seller. All items are professionally maintained.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.9,
          totalSales: 67,
          memberSince: "2019-08-20"
        },
        'seller_6': {
          id: 'seller_6',
          fullName: "GadgetStore",
          email: "gadgetstore@example.com",
          phone: "+91 98765 43215",
          location: "Pune, Maharashtra",
          bio: "Gadget enthusiast and tech seller. I sell quality electronics and accessories.",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.5,
          totalSales: 234,
          memberSince: "2021-02-10"
        },
        'seller_7': {
          id: 'seller_7',
          fullName: "SportsZone",
          email: "sportszone@example.com",
          phone: "+91 98765 43216",
          location: "Kolkata, West Bengal",
          bio: "Sports equipment specialist. I sell authentic sports gear and footwear.",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.4,
          totalSales: 78,
          memberSince: "2022-06-15"
        },
        'seller_8': {
          id: 'seller_8',
          fullName: "AudioHub",
          email: "audiohub@example.com",
          phone: "+91 98765 43217",
          location: "Ahmedabad, Gujarat",
          bio: "Audio equipment specialist. I sell high-quality headphones and audio gear.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.7,
          totalSales: 112,
          memberSince: "2020-09-25"
        },
        'seller_9': {
          id: 'seller_9',
          fullName: "FashionHub",
          email: "fashionhub@example.com",
          phone: "+91 98765 43218",
          location: "Mumbai, Maharashtra",
          bio: "Fashion enthusiast and clothing seller. I sell trendy and authentic fashion items.",
          profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.3,
          totalSales: 56,
          memberSince: "2023-01-05"
        },
        'seller_10': {
          id: 'seller_10',
          fullName: "TechZone",
          email: "techzone@example.com",
          phone: "+91 98765 43219",
          location: "Delhi, India",
          bio: "Technology specialist. I sell the latest tech gadgets and accessories.",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.8,
          totalSales: 203,
          memberSince: "2021-04-12"
        },
        'seller_11': {
          id: 'seller_11',
          fullName: "SneakerCollector",
          email: "sneakercollector@example.com",
          phone: "+91 98765 43220",
          location: "Bangalore, Karnataka",
          bio: "Sneaker collector and reseller. I sell rare and authentic sneakers.",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.9,
          totalSales: 34,
          memberSince: "2022-03-08"
        },
        'seller_12': {
          id: 'seller_12',
          fullName: "DroneWorld",
          email: "droneworld@example.com",
          phone: "+91 98765 43221",
          location: "Chennai, Tamil Nadu",
          bio: "Drone specialist and aerial photography equipment seller.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.6,
          totalSales: 78,
          memberSince: "2021-07-30"
        }
      }
      
      console.log('Looking for seller with ID:', ownerId)
      console.log('Available sellers:', Object.keys(knownSellers))
      
      // Handle MongoDB ObjectId format by creating a consistent seller profile
      let mockOwner
      if (ownerId && (ownerId.startsWith('seller_') && ownerId.length > 20) || (ownerId.length === 24 && /^[0-9a-fA-F]{24}$/.test(ownerId))) {
        // This is a MongoDB ObjectId format, create a consistent seller profile
        const hash = ownerId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
        const sellerIndex = Math.abs(hash) % 12 + 1
        const simpleSellerId = `seller_${sellerIndex}`
        console.log('Mapped MongoDB ID to simple seller ID:', simpleSellerId)
        mockOwner = knownSellers[simpleSellerId] || {
          id: ownerId,
          fullName: `Seller ${sellerIndex}`,
          email: `seller${sellerIndex}@example.com`,
          phone: `+91 98765 432${sellerIndex.toString().padStart(2, '0')}`,
          location: "India",
          bio: "Professional seller with quality products and excellent service.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.5 + (sellerIndex % 5) * 0.1,
          totalSales: 50 + sellerIndex * 10,
          memberSince: "2023-01-15"
        }
      } else {
        mockOwner = knownSellers[ownerId] || {
          id: ownerId,
          fullName: "John Smith",
          email: "john.smith@example.com",
          phone: "+91 98765 43210",
          location: "Mumbai, Maharashtra",
          bio: "Tech enthusiast and gadget collector. I sell quality electronics at great prices. All items are tested and in excellent condition.",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
          rating: 4.8,
          totalSales: 127,
          memberSince: "2023-01-15",
          userType: "seller"
        }
      }
      
      console.log('Selected owner:', mockOwner)
      
      const mockProducts = [
        {
          id: 1,
          title: "iPhone 13 Pro",
          price: 65000,
          originalPrice: 119900,
          category: "Electronics",
          condition: "Excellent",
          status: "active",
          views: 156,
          postedDate: "2024-01-15",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop",
          description: "iPhone 13 Pro in excellent condition with 95% battery health. No scratches, comes with original box and charger."
        },
        {
          id: 2,
          title: "MacBook Air M2",
          price: 85000,
          originalPrice: 114900,
          category: "Electronics",
          condition: "Like New",
          status: "active",
          views: 89,
          postedDate: "2024-01-10",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
          description: "MacBook Air M2 with 8GB RAM and 256GB SSD. Barely used, still under warranty."
        },
        {
          id: 3,
          title: "Nike Air Max 270",
          price: 4500,
          originalPrice: 8995,
          category: "Fashion",
          condition: "Good",
          status: "active",
          views: 45,
          postedDate: "2024-01-20",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
          description: "Nike Air Max 270 in size 10. Worn a few times, excellent condition."
        }
      ]
      
      setOwner(mockOwner)
      setOwnerProducts(mockProducts)
    } catch (error) {
      console.error('Error loading owner data:', error)
      showNotification('Failed to load seller profile.', 'error')
    } finally {
      setLoading(false)
    }
  }, [ownerId, showNotification])

  const handleSendMessage = useCallback(async () => {
    if (!isAuthenticated) {
      showNotification('Please login to send messages', 'warning')
      navigate('/login')
      return
    }

    if (!messageText.trim()) {
      showNotification('Please enter a message', 'warning')
      return
    }

    setSendingMessage(true)
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newMessage = {
        id: Date.now(),
        from: user?.fullName || 'You',
        to: owner?.fullName,
        message: messageText.trim(),
        timestamp: new Date().toISOString(),
        productId: productId,
        productTitle: ownerProducts.find(p => p.id == productId || p.id === productId)?.title || 'Product'
      }
      
      setConversations(prev => [...prev, newMessage])
      setMessageText('')
      showNotification('Message sent successfully!', 'success')
    } catch (error) {
      showNotification('Failed to send message. Please try again.', 'error')
    } finally {
      setSendingMessage(false)
    }
  }, [isAuthenticated, messageText, user, owner, productId, ownerProducts, navigate, showNotification])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h2>
          <p className="text-gray-600 mb-6">The seller profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/buy')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={owner.profileImage}
                alt={owner.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/96x96/cccccc/666666?text=No+Image'
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{owner.fullName}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(owner.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">({owner.rating})</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{owner.totalSales} sales</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">Member since {formatDate(owner.memberSince)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{owner.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fas fa-phone"></i>
                  <span>{owner.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setActiveTab('contact')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <i className="fas fa-comment"></i>
                Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About {owner.fullName}</h2>
          <p className="text-gray-700 leading-relaxed">{owner.bio}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-box mr-2"></i>
                Products ({ownerProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-comment mr-2"></i>
                Contact Seller
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Products by {owner.fullName}</h3>
                {ownerProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-box text-4xl text-gray-400 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No products found</h4>
                    <p className="text-gray-600">This seller hasn't listed any products yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownerProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image'
                          }}
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{product.title}</h4>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                            <span className="text-sm text-gray-500">{product.condition}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{product.views} views</span>
                            <span>{formatDate(product.postedDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>
                  {productId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-info-circle text-blue-600"></i>
                        <span className="font-medium text-blue-900">
                          You're contacting about: {ownerProducts.find(p => p.id == productId || p.id === productId)?.title || 'Product'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Login Required</h4>
                    <p className="text-gray-600 mb-6">Please login to contact the seller.</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Hi! I'm interested in your product. Could you tell me more about it?"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingMessage ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Messages */}
                {conversations.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h4>
                    <div className="space-y-4">
                      {conversations.map((message) => (
                        <div key={message.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{message.from}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                          {message.productTitle && (
                            <div className="mt-2 text-sm text-gray-500">
                              Re: {message.productTitle}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerProfile


