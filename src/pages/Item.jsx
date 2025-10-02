import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { useMessaging } from '../contexts/MessagingContext'
import apiService from '../services/api'

const Item = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const { isFavorited, toggleFavorite } = useFavorites()
  const { createConversation, openConversation } = useMessaging()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  console.log('Item component rendered with ID:', id)

  // Load product details on mount
  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = useCallback(async () => {
    console.log('Loading product with ID:', id)
    setLoading(true)
    try {
      // Try to fetch from API first
      try {
        const response = await apiService.getProduct(id)
        if (response.product) {
          console.log('Product loaded from API:', response.product)
          
          // Transform API response to match expected format
          const transformedProduct = {
            ...response.product,
            // Handle seller information from populated field
            seller: response.product.seller?.fullName || 'Unknown Seller',
            sellerId: response.product.seller?._id || response.product.seller,
            sellerName: response.product.seller?.fullName || 'Unknown Seller',
            ownerId: response.product.seller?._id || response.product.seller,
            sellerRating: response.product.seller?.rating || 4.5,
            sellerReviews: response.product.seller?.reviewCount || 0,
            sellerMemberSince: response.product.seller?.createdAt ? new Date(response.product.seller.createdAt).getFullYear().toString() : '2023',
            sellerResponseRate: '98%',
            sellerResponseTime: 'Usually within 2 hours',
            // Add default features if not present
            features: response.product.features || [
              'Good Condition',
              'Well Maintained', 
              'Original Accessories',
              'Fair Price',
              'Quick Response',
              'Reliable Seller'
            ],
            // Ensure images array exists
            images: response.product.images || ['https://via.placeholder.com/600x400/cccccc/666666?text=No+Image'],
            // Add default values for missing fields
            views: response.product.views || 0,
            postedDate: response.product.createdAt || new Date().toISOString()
          }
          
          setProduct(transformedProduct)
          setLoading(false)
          return
        }
      } catch (error) {
        console.log('API call failed, using mock data:', error)
      }
      
      // Simulate API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
             // Mock product data based on ID
               const productData = {
          1: {
            title: "iPhone 13 Pro",
            description: "Excellent condition iPhone 13 Pro with 256GB storage in Space Gray. This phone has been well taken care of and comes with the original box and accessories. No scratches or dents, battery health is at 95%. Perfect for anyone looking for a premium smartphone at a great price.",
            price: 65000,
            originalPrice: 119900,
            category: "Electronics",
            condition: "Excellent",
            location: "Mumbai",
            seller: "TechGuru",
            sellerId: "seller_1",
            sellerName: "TechGuru",
            ownerId: "seller_1",
            sellerRating: 4.8,
            sellerReviews: 127,
            sellerMemberSince: "2022",
            sellerResponseRate: "98%",
            sellerResponseTime: "Usually within 2 hours",
            images: [
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-15",
            views: 156,
            features: [
              "256GB Storage",
              "Space Gray Color",
              "Original Box Included",
              "All Accessories",
              "95% Battery Health",
              "No Scratches"
            ]
          },
                   2: {
            title: "MacBook Air M2",
            description: "Like new MacBook Air M2 with 8GB RAM and 256GB SSD in Space Gray. Purchased 6 months ago and barely used. Perfect condition with all original accessories and box included.",
            price: 85000,
            originalPrice: 114900,
            category: "Electronics",
            condition: "Like New",
            location: "Delhi",
            seller: "AppleFan",
            sellerId: "seller_2",
            sellerName: "AppleFan",
            ownerId: "seller_2",
            sellerRating: 4.9,
            sellerReviews: 89,
            sellerMemberSince: "2021",
            sellerResponseRate: "95%",
            sellerResponseTime: "Usually within 4 hours",
            images: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-14",
            views: 203,
            features: [
              "8GB RAM",
              "256GB SSD",
              "Space Gray Color",
              "Original Box Included",
              "All Accessories",
              "6 Months Old"
            ]
          },
         3: {
           title: "Nike Air Max 270",
           description: "Size 10 Nike Air Max 270 in excellent condition. Barely worn with original box included. Perfect for daily wear and running. No signs of wear and tear.",
           price: 4500,
           originalPrice: 8995,
           category: "Fashion",
           condition: "Good",
           location: "Bangalore",
            seller: "SneakerHead",
            sellerId: "seller_3",
            sellerName: "SneakerHead",
            ownerId: "seller_3",
            sellerRating: 4.7,
            sellerReviews: 45,
           images: [
             "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
             "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&crop=face",
             "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&crop=entropy",
             "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&crop=edges"
           ],
           postedDate: "2024-01-13",
           views: 78,
           features: [
             "Size 10",
             "Original Box",
             "Barely Worn",
             "Perfect Condition",
             "Great for Running",
             "Daily Wear Ready"
           ]
         },
         4: {
           title: "Samsung Galaxy S23 Ultra",
           description: "Mint condition Samsung Galaxy S23 Ultra with 256GB storage in Phantom Black. Includes S Pen and all original accessories. Perfect for photography and productivity.",
           price: 75000,
           originalPrice: 124999,
           category: "Electronics",
           condition: "Excellent",
           location: "Chennai",
            seller: "MobileWorld",
            sellerId: "seller_4",
            sellerName: "MobileWorld",
            ownerId: "seller_4",
            sellerRating: 4.6,
            sellerReviews: 156,
           images: [
             "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop",
             "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop&crop=face",
             "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop&crop=entropy",
             "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop&crop=edges"
           ],
           postedDate: "2024-01-12",
           views: 234,
           features: [
             "256GB Storage",
             "Phantom Black",
             "S Pen Included",
             "All Accessories",
             "Mint Condition",
             "Perfect Camera"
           ]
         },
                   5: {
            title: "Canon EOS R6 Mark II",
            description: "Professional Canon EOS R6 Mark II camera in excellent condition. 24.2MP full-frame sensor with 4K video capability. Perfect for photography enthusiasts and professionals.",
            price: 180000,
            originalPrice: 249999,
            category: "Electronics",
            condition: "Excellent",
            location: "Hyderabad",
            seller: "PhotoPro",
            sellerId: "seller_5",
            sellerName: "PhotoPro",
            ownerId: "seller_5",
            sellerRating: 4.9,
            sellerReviews: 67,
            sellerMemberSince: "2019",
            sellerResponseRate: "99%",
            sellerResponseTime: "Usually within 30 minutes",
            images: [
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-11",
            views: 89,
            features: [
              "24.2MP Full-Frame",
              "4K Video Recording",
              "Professional Grade",
              "Excellent Condition",
              "All Accessories",
              "Perfect for Pro Use"
            ]
          },
          6: {
            title: "Apple Watch Series 8",
            description: "45mm GPS + Cellular, Midnight color. Excellent condition, includes all bands and charger.",
            price: 35000,
            originalPrice: 49900,
            category: "Electronics",
            condition: "Excellent",
            location: "Pune",
            seller: "GadgetStore",
            sellerId: "seller_6",
            sellerName: "GadgetStore",
            ownerId: "seller_6",
            sellerRating: 4.5,
            sellerReviews: 234,
            sellerMemberSince: "2021",
            sellerResponseRate: "94%",
            sellerResponseTime: "Usually within 3 hours",
            images: [
              "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-10",
            views: 156,
            features: [
              "45mm GPS + Cellular",
              "Midnight Color",
              "All Bands Included",
              "Charger Included",
              "Excellent Condition",
              "Perfect for Fitness"
            ]
          },
          7: {
            title: "Adidas Ultraboost 22",
            description: "Size 9, white color, excellent condition. Perfect for running and daily wear.",
            price: 3500,
            originalPrice: 7999,
            category: "Fashion",
            condition: "Good",
            location: "Kolkata",
            seller: "SportsZone",
            sellerId: "seller_7",
            sellerName: "SportsZone",
            ownerId: "seller_7",
            sellerRating: 4.4,
            sellerReviews: 78,
            sellerMemberSince: "2022",
            sellerResponseRate: "91%",
            sellerResponseTime: "Usually within 5 hours",
            images: [
              "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-09",
            views: 67,
            features: [
              "Size 9",
              "White Color",
              "Excellent Condition",
              "Perfect for Running",
              "Daily Wear Ready",
              "Original Box"
            ]
          },
          8: {
            title: "Sony WH-1000XM5",
            description: "Wireless noise-canceling headphones, black color. Like new condition with original case.",
            price: 22000,
            originalPrice: 29990,
            category: "Electronics",
            condition: "Like New",
            location: "Ahmedabad",
            seller: "AudioHub",
            sellerId: "seller_8",
            sellerName: "AudioHub",
            ownerId: "seller_8",
            sellerRating: 4.7,
            sellerReviews: 112,
            sellerMemberSince: "2020",
            sellerResponseRate: "96%",
            sellerResponseTime: "Usually within 2 hours",
            images: [
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-08",
            views: 89,
            features: [
              "Wireless Noise-Canceling",
              "Black Color",
              "Like New Condition",
              "Original Case Included",
              "Premium Sound Quality",
              "Long Battery Life"
            ]
          },
          9: {
            title: "Levi's 501 Original Jeans",
            description: "Size 32x32, dark blue wash, excellent condition. Perfect fit and no signs of wear.",
            price: 1200,
            originalPrice: 2999,
            category: "Fashion",
            condition: "Good",
            location: "Mumbai",
            seller: "FashionHub",
            sellerId: "seller_9",
            sellerName: "FashionHub",
            ownerId: "seller_9",
            sellerRating: 4.3,
            sellerReviews: 56,
            sellerMemberSince: "2023",
            sellerResponseRate: "89%",
            sellerResponseTime: "Usually within 8 hours",
            images: [
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-07",
            views: 45,
            features: [
              "Size 32x32",
              "Dark Blue Wash",
              "Excellent Condition",
              "Perfect Fit",
              "No Signs of Wear",
              "Classic Style"
            ]
          },
          10: {
            title: "iPad Pro 12.9-inch",
            description: "2022 model, 128GB, Space Gray, excellent condition with Apple Pencil and Magic Keyboard.",
            price: 75000,
            originalPrice: 99900,
            category: "Electronics",
            condition: "Excellent",
            location: "Delhi",
            seller: "TechZone",
            sellerId: "seller_10",
            sellerName: "TechZone",
            ownerId: "seller_10",
            sellerRating: 4.8,
            sellerReviews: 203,
            sellerMemberSince: "2021",
            sellerResponseRate: "97%",
            sellerResponseTime: "Usually within 1 hour",
            images: [
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-06",
            views: 178,
            features: [
              "2022 Model",
              "128GB Storage",
              "Space Gray",
              "Apple Pencil Included",
              "Magic Keyboard Included",
              "Excellent Condition"
            ]
          },
          11: {
            title: "Nike Air Jordan 1",
            description: "Size 9, Chicago colorway, excellent condition. Rare find in perfect condition.",
            price: 8500,
            originalPrice: 15995,
            category: "Fashion",
            condition: "Excellent",
            location: "Bangalore",
            seller: "SneakerCollector",
            sellerId: "seller_11",
            sellerName: "SneakerCollector",
            ownerId: "seller_11",
            sellerRating: 4.9,
            sellerReviews: 34,
            sellerMemberSince: "2022",
            sellerResponseRate: "100%",
            sellerResponseTime: "Usually within 1 hour",
            images: [
              "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-05",
            views: 234,
            features: [
              "Size 9",
              "Chicago Colorway",
              "Excellent Condition",
              "Rare Find",
              "Perfect Condition",
              "Collector's Item"
            ]
          },
          12: {
            title: "DJI Mini 3 Pro Drone",
            description: "4K camera drone, excellent condition, includes extra batteries and carrying case.",
            price: 65000,
            originalPrice: 89990,
            category: "Electronics",
            condition: "Excellent",
            location: "Chennai",
            seller: "DroneWorld",
            sellerId: "seller_12",
            sellerName: "DroneWorld",
            ownerId: "seller_12",
            sellerRating: 4.6,
            sellerReviews: 78,
            sellerMemberSince: "2021",
            sellerResponseRate: "93%",
            sellerResponseTime: "Usually within 3 hours",
            images: [
              "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&h=400&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&h=400&fit=crop&crop=entropy",
              "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&h=400&fit=crop&crop=edges"
            ],
            postedDate: "2024-01-04",
            views: 123,
            features: [
              "4K Camera",
              "Excellent Condition",
              "Extra Batteries",
              "Carrying Case",
              "Professional Grade",
              "Perfect for Photography"
            ]
          }
       }
       
       // Check if we have mock data for this ID
       const mockProduct = productData[parseInt(id)] || {
         // If no mock data, create a generic product for any ID
         title: `Product ${id}`,
         description: "This is a product created by a user. The seller has provided detailed information about this item.",
         price: 1000, // Default price
         originalPrice: 1500,
         category: "General",
         condition: "Good",
         location: "India",
         seller: "User",
         sellerId: "user_" + id,
         sellerName: "User",
         ownerId: "user_" + id,
         sellerRating: 4.5,
         sellerReviews: 10,
         sellerMemberSince: "2024",
         sellerResponseRate: "95%",
         sellerResponseTime: "Usually within 2 hours",
         images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"],
         postedDate: new Date().toISOString().split('T')[0],
         views: Math.floor(Math.random() * 100) + 10,
         features: [
           "Good Condition",
           "Well Maintained",
           "Original Accessories",
           "Fair Price",
           "Quick Response",
           "Reliable Seller"
         ]
       }
      
      console.log('Product loaded from mock data:', mockProduct)
      setProduct(mockProduct)
    } catch (error) {
      console.error('Error loading product:', error)
      showNotification('Failed to load product details.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showNotification])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  const handleContactSeller = useCallback(async () => {
    if (!isAuthenticated) {
      showNotification('Please login to contact the seller.', 'error')
      return
    }
    
    // Check if user is trying to contact themselves
    const sellerId = product.sellerId || product.ownerId
    if (sellerId === user?._id || sellerId === user?.id) {
      showNotification('This is your own product! Redirecting to your profile.', 'info')
      navigate('/profile')
      return
    }

    try {
      // Create or get existing conversation
      const conversation = await createConversation(sellerId, product._id || product.id)
      
      // Navigate to profile messages tab and open conversation
      navigate('/profile?tab=messages')
      
      // Small delay to ensure navigation completes
      setTimeout(() => {
        openConversation(conversation)
      }, 100)
      
      showNotification('Opening conversation with seller...', 'success')
      
    } catch (error) {
      console.error('Error starting conversation:', error)
      showNotification('Failed to start conversation. Please try again.', 'error')
    }
  }, [isAuthenticated, showNotification, product, user, navigate, createConversation, openConversation])

  const handleSendMessage = useCallback(() => {
    showNotification('Message sent to seller!', 'success')
    setShowContactModal(false)
  }, [showNotification])

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="ml-4">Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/buy"
              className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Browse Other Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering product details for:', product)

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-purple-600">Home</Link></li>
            <li><i className="fas fa-chevron-right text-xs"></i></li>
            <li><Link to="/buy" className="hover:text-purple-600">Buy</Link></li>
            <li><i className="fas fa-chevron-right text-xs"></i></li>
            <li><span className="text-gray-900">{product.title}</span></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden">
              <img
                src={(product.images && product.images[selectedImage]) || 'https://via.placeholder.com/600x400/cccccc/666666?text=No+Image'}
                alt={product.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400/cccccc/666666?text=No+Image'
                }}
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {(product.images || []).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x100/cccccc/666666?text=No+Image'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {product.location}
                </span>
                <span className="flex items-center">
                  <i className="fas fa-eye mr-1"></i>
                  {product.views || 0} views
                </span>
                <span className="flex items-center">
                  <i className="fas fa-calendar mr-1"></i>
                  Posted {product.postedDate ? new Date(product.postedDate).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      {getDiscountPercentage(product.originalPrice, product.price)}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Negotiable</p>
                <button
                  onClick={() => showNotification('Added to favorites!', 'success')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
                >
                  <i className="fas fa-heart"></i>
                  <span className="text-sm">Add to Favorites</span>
                </button>
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Condition</h3>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.condition}
              </span>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.seller || 'Seller'}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span>{product.sellerRating || '4.5'}</span>
                    </div>
                    <span>•</span>
                    <span>{product.sellerReviews || 0} reviews</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleContactSeller}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <i className="fas fa-comment mr-2"></i>
                  Message Seller
                </button>
                
                {/* Add to Favorites Button */}
                <button
                  onClick={() => toggleFavorite(product._id || product.id)}
                  className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isFavorited(product._id || product.id)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fas fa-heart mr-2 ${
                    isFavorited(product._id || product.id) ? 'text-red-500' : ''
                  }`}></i>
                  {isFavorited(product._id || product.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                
                <button
                  onClick={() => {
                    const sellerId = product.sellerId || product.ownerId
                    if (sellerId === user?._id || sellerId === user?.id) {
                      navigate('/profile')
                    } else {
                      navigate(`/owner/${sellerId}`)
                    }
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <i className="fas fa-user mr-2"></i>
                  View Seller Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(product.features || []).map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Contact Seller</h3>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Details */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={(product.images && product.images[selectedImage]) || 'https://via.placeholder.com/80x80/cccccc/666666?text=No+Image'}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80/cccccc/666666?text=No+Image'
                          }}
                        />
                        <div>
                          <h5 className="font-semibold text-gray-900">{product.title}</h5>
                          <p className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</p>
                          <p className="text-sm text-gray-600">{product.condition} • {product.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-semibold">{product.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-semibold">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-semibold">{product.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posted:</span>
                        <span className="font-semibold">{new Date(product.postedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-semibold">{product.views}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Profile */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Seller Profile</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-white text-xl"></i>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{product.seller || 'Seller'}</h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-400 mr-1"></i>
                              <span>{product.sellerRating || '4.5'}</span>
                            </div>
                            <span>•</span>
                            <span>{product.sellerReviews || 0} reviews</span>
                          </div>
                          <p className="text-sm text-gray-600">Member since {product.sellerMemberSince || "2023"}</p>
                        </div>
                      </div>
                    </div>
                    
                                         <div className="space-y-3 mb-6">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Rating:</span>
                         <span className="font-semibold">{product.sellerRating || '4.5'}/5.0</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Reviews:</span>
                         <span className="font-semibold">{product.sellerReviews || 0}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Member Since:</span>
                         <span className="font-semibold">{product.sellerMemberSince || "2023"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Response Rate:</span>
                         <span className="font-semibold text-green-600">{product.sellerResponseRate || "98%"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Response Time:</span>
                         <span className="font-semibold">{product.sellerResponseTime || "Usually within 2 hours"}</span>
                       </div>
                     </div>

                    {/* Contact Form */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Send Message</h5>
                      <textarea
                        placeholder={`Hi ${product.seller || 'Seller'}, I'm interested in your ${product.title}...`}
                        rows={4}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowContactModal(false)}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendMessage}
                          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                          <i className="fas fa-paper-plane mr-2"></i>
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Item
