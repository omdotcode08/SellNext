import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useNotification } from '../contexts/NotificationContext'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import apiService from '../services/api'

const Buy = () => {
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotification()
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  // Set search query from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchParams])

  // Filter and sort products when filters change
  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiService.getProducts()
      // Add seller information to products if not already present
      const productsWithSellers = (response.products || []).map(product => ({
        ...product,
        sellerId: product.sellerId || product.ownerId || `seller_${product.id}`,
        sellerName: product.sellerName || product.seller || 'Unknown Seller',
        ownerId: product.sellerId || product.ownerId || `seller_${product.id}`
      }))
      setProducts(productsWithSellers)
    } catch (error) {
      console.error('Error loading products:', error)
      showNotification('Failed to load products. Please try again.', 'error')
      // Fallback to sample data if API fails
      await loadSampleProducts()
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  // Keep the sample data as fallback for development
  const loadSampleProducts = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Sample products data with detailed seller information
      const sampleProducts = [
        {
          id: 1,
          title: "iPhone 13 Pro",
          description: "Excellent condition iPhone 13 Pro, 256GB, Space Gray. No scratches, 95% battery health, original box and accessories included.",
          price: 65000,
          originalPrice: 119900,
          category: "Electronics",
          condition: "Excellent",
          location: "Mumbai",
          seller: "TechGuru",
          sellerId: "seller_1",
          sellerName: "TechGuru",
          sellerRating: 4.8,
          sellerReviews: 127,
          sellerMemberSince: "2022",
          sellerResponseRate: "98%",
          sellerResponseTime: "Usually within 2 hours",
          images: [
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
          ],
          postedDate: "2024-01-15"
        },
         {
           id: 2,
           title: "MacBook Air M2",
           description: "Like new MacBook Air M2, 8GB RAM, 256GB SSD, Space Gray. Purchased 6 months ago, barely used.",
           price: 85000,
           originalPrice: 114900,
           category: "Electronics",
           condition: "Like New",
           location: "Delhi",
           seller: "AppleFan",
           sellerId: "seller_2",
           sellerName: "AppleFan",
           sellerRating: 4.9,
           sellerReviews: 89,
           sellerMemberSince: "2021",
           sellerResponseRate: "95%",
           sellerResponseTime: "Usually within 4 hours",
           images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-14"
         },
         {
           id: 3,
           title: "Nike Air Max 270",
           description: "Size 10, barely worn Nike Air Max 270, original box included. Perfect for daily wear.",
           price: 4500,
           originalPrice: 8995,
           category: "Fashion",
           condition: "Good",
           location: "Bangalore",
           seller: "SneakerHead",
           sellerId: "seller_3",
           sellerName: "SneakerHead",
           sellerRating: 4.7,
           sellerReviews: 45,
           sellerMemberSince: "2023",
           sellerResponseRate: "92%",
           sellerResponseTime: "Usually within 6 hours",
           images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-13"
         },
         {
           id: 4,
           title: "Samsung Galaxy S23 Ultra",
           description: "Mint condition Samsung Galaxy S23 Ultra, 256GB, Phantom Black. Includes S Pen and all accessories.",
           price: 75000,
           originalPrice: 124999,
           category: "Electronics",
           condition: "Excellent",
           location: "Chennai",
           seller: "MobileWorld",
           sellerId: "seller_4",
           sellerName: "MobileWorld",
           sellerRating: 4.6,
           sellerReviews: 156,
           sellerMemberSince: "2020",
           sellerResponseRate: "97%",
           sellerResponseTime: "Usually within 1 hour",
           images: [
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-12"
         },
         {
           id: 5,
           title: "Canon EOS R6 Mark II",
           description: "Professional camera, excellent condition, 24.2MP, 4K video. Perfect for photography enthusiasts.",
           price: 180000,
           originalPrice: 249999,
           category: "Electronics",
           condition: "Excellent",
           location: "Hyderabad",
           seller: "PhotoPro",
           sellerId: "seller_5",
           sellerName: "PhotoPro",
           sellerRating: 4.9,
           sellerReviews: 67,
           sellerMemberSince: "2019",
           sellerResponseRate: "99%",
           sellerResponseTime: "Usually within 30 minutes",
           images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-11"
         },
         {
           id: 6,
           title: "Apple Watch Series 8",
           description: "45mm GPS + Cellular, Midnight color. Excellent condition, includes all bands and charger.",
           price: 35000,
           originalPrice: 49900,
           category: "Electronics",
           condition: "Excellent",
           location: "Pune",
           seller: "GadgetStore",
           sellerRating: 4.5,
           sellerReviews: 234,
           sellerMemberSince: "2021",
           sellerResponseRate: "94%",
           sellerResponseTime: "Usually within 3 hours",
           images: [
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-10"
         },
         {
           id: 7,
           title: "Adidas Ultraboost 22",
           description: "Size 9, white color, excellent condition. Perfect for running and daily wear.",
           price: 3500,
           originalPrice: 7999,
           category: "Fashion",
           condition: "Good",
           location: "Kolkata",
           seller: "SportsZone",
           sellerRating: 4.4,
           sellerReviews: 78,
           sellerMemberSince: "2022",
           sellerResponseRate: "91%",
           sellerResponseTime: "Usually within 5 hours",
           images: [
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-09"
         },
         {
           id: 8,
           title: "Sony WH-1000XM5",
           description: "Wireless noise-canceling headphones, black color. Like new condition with original case.",
           price: 22000,
           originalPrice: 29990,
           category: "Electronics",
           condition: "Like New",
           location: "Ahmedabad",
           seller: "AudioHub",
           sellerRating: 4.7,
           sellerReviews: 112,
           sellerMemberSince: "2020",
           sellerResponseRate: "96%",
           sellerResponseTime: "Usually within 2 hours",
           images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-08"
         },
         {
           id: 9,
           title: "Levi's 501 Original Jeans",
           description: "Size 32x32, dark blue wash, excellent condition. Perfect fit and no signs of wear.",
           price: 1200,
           originalPrice: 2999,
           category: "Fashion",
           condition: "Good",
           location: "Mumbai",
           seller: "FashionHub",
           sellerRating: 4.3,
           sellerReviews: 56,
           sellerMemberSince: "2023",
           sellerResponseRate: "89%",
           sellerResponseTime: "Usually within 8 hours",
           images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-07"
         },
         {
           id: 10,
           title: "iPad Pro 12.9-inch",
           description: "2022 model, 128GB, Space Gray, excellent condition with Apple Pencil and Magic Keyboard.",
           price: 75000,
           originalPrice: 99900,
           category: "Electronics",
           condition: "Excellent",
           location: "Delhi",
           seller: "TechZone",
           sellerRating: 4.8,
           sellerReviews: 203,
           sellerMemberSince: "2021",
           sellerResponseRate: "97%",
           sellerResponseTime: "Usually within 1 hour",
           images: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-06"
         },
         {
           id: 11,
           title: "Nike Air Jordan 1",
           description: "Size 9, Chicago colorway, excellent condition. Rare find in perfect condition.",
           price: 8500,
           originalPrice: 15995,
           category: "Fashion",
           condition: "Excellent",
           location: "Bangalore",
           seller: "SneakerCollector",
           sellerRating: 4.9,
           sellerReviews: 34,
           sellerMemberSince: "2022",
           sellerResponseRate: "100%",
           sellerResponseTime: "Usually within 1 hour",
           images: [
            "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-05"
         },
         {
           id: 12,
           title: "DJI Mini 3 Pro Drone",
           description: "4K camera drone, excellent condition, includes extra batteries and carrying case.",
           price: 65000,
           originalPrice: 89990,
           category: "Electronics",
           condition: "Excellent",
           location: "Chennai",
           seller: "DroneWorld",
           sellerRating: 4.6,
           sellerReviews: 78,
           sellerMemberSince: "2021",
           sellerResponseRate: "93%",
           sellerResponseTime: "Usually within 3 hours",
           images: [
            "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop&crop=face&auto=format&q=80"
           ],
           postedDate: "2024-01-04"
         }
       ]
      // Add ownerId to sample products for consistency
      const sampleProductsWithOwners = sampleProducts.map(product => ({
        ...product,
        ownerId: product.sellerId || product.ownerId || `seller_${product.id}`
      }))
      setProducts(sampleProductsWithOwners)
    } catch (error) {
      console.error('Error loading sample products:', error)
      showNotification('Failed to load products. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max))
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      showNotification('Please enter a search term.', 'error')
      return
    }
    // Search is handled by the filter effect
  }, [searchQuery, showNotification])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange({ min: '', max: '' })
    setSortBy('newest')
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))]
    return ['all', ...uniqueCategories]
  }, [products])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      showNotification('Please login to add items to cart', 'warning')
      return
    }

    // Add owner/seller information to the product
    const productWithOwner = {
      ...product,
      ownerId: product.sellerId || product.ownerId || product.seller || `seller_${product.id || product._id}`,
      sellerId: product.sellerId || product.ownerId || product.seller || `seller_${product.id || product._id}`,
      sellerName: product.sellerName || product.seller || 'Unknown Seller',
      seller: product.seller || 'Unknown Seller'
    }

    addToCart(productWithOwner)
    showNotification(`${product.title} added to cart!`, 'success')
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Products</h1>
          <p className="text-gray-600">Discover amazing products from local sellers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear All Filters
              </button>
              <p className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Link key={product._id || product.id} to={`/item/${product._id || product.id}`} className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image'
                    }}
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {getDiscountPercentage(product.originalPrice, product.price)}% OFF
                    </div>
                  )}
                </div>
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleFavorite(product._id || product.id)
                  }}
                  className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-colors duration-200 z-10 ${
                    isFavorited(product._id || product.id) 
                      ? 'bg-red-50 hover:bg-red-100' 
                      : 'hover:bg-red-50'
                  }`}
                  title={isFavorited(product._id || product.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <i className={`fas fa-heart transition-colors duration-200 ${
                    isFavorited(product._id || product.id) 
                      ? 'text-red-500' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}></i>
                </button>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {product.location}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {product.condition}
                    </span>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isInCart(product._id || product.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isInCart(product._id || product.id)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                    }`}
                  >
                    {isInCart(product._id || product.id) ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        In Cart
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Buy
