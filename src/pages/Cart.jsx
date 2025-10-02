import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId, productTitle) => {
    removeFromCart(productId)
    showNotification(`${productTitle} removed from cart`, 'success')
  }

  const handleClearCart = () => {
    clearCart()
    showNotification('Cart cleared successfully', 'success')
  }

  const handleConnectWithOwner = (product) => {
    if (!isAuthenticated) {
      showNotification('Please login to contact the seller', 'warning')
      navigate('/login')
      return
    }
    
    // Check if user is trying to contact themselves
    const sellerId = product.ownerId || product.sellerId || product.seller
    console.log('Product seller info:', {
      ownerId: product.ownerId,
      sellerId: product.sellerId,
      seller: product.seller,
      selectedSellerId: sellerId,
      productId: product.id || product._id
    })
    
    if (sellerId === user?._id || sellerId === user?.id) {
      showNotification('This is your own product! Redirecting to your profile.', 'info')
      navigate('/profile')
      return
    }
    
    // Navigate to owner profile with product context
    const productId = product.id || product._id
    navigate(`/owner/${sellerId}?product=${productId}`)
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your cart.</p>
          <Link
            to="/login"
            className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-6xl text-gray-400 mb-6"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/buy"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
            >
              <i className="fas fa-search mr-2"></i>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/cccccc/666666?text=No+Image'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description?.substring(0, 100)}...</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                        <span className="text-sm text-gray-500">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {item.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <i className="fas fa-minus text-sm"></i>
                        </button>
                        <span className="px-4 py-2 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <i className="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                      
                      {/* Connect with Owner Button */}
                      <button
                        onClick={() => handleConnectWithOwner(item)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                      >
                        <i className="fas fa-user"></i>
                        Contact Seller
                      </button>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.title)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Item Total:</span>
                    <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unique Sellers</span>
                    <span className="font-medium">{new Set(cartItems.map(item => item.ownerId || item.sellerId)).size}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Value</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-info-circle text-blue-600"></i>
                      <h3 className="font-medium text-blue-900">How it works</h3>
                    </div>
                    <p className="text-sm text-blue-800">
                      Contact sellers directly to negotiate prices and arrange pickup/delivery. 
                      No payment processing - you deal directly with the seller.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-handshake text-green-600"></i>
                      <h3 className="font-medium text-green-900">Benefits</h3>
                    </div>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Direct communication with sellers</li>
                      <li>• Negotiate better prices</li>
                      <li>• Arrange convenient pickup</li>
                      <li>• No platform fees</li>
                    </ul>
                  </div>
                </div>
                
                <Link
                  to="/buy"
                  className="block w-full text-center text-purple-600 hover:text-purple-700 py-3 px-4 border border-purple-600 rounded-lg mt-4 transition-colors duration-200 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart