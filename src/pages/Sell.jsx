import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const Sell = () => {
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    originalPrice: '',
    location: '',
    images: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    setIsProcessingImages(true)
    
    // Convert files to base64 strings for storage
    // Check if adding these images would exceed the limit
    if (formData.images.length + files.length > 5) {
      showNotification(`You can only upload up to 5 images total. You currently have ${formData.images.length} image(s).`, 'error')
      setIsProcessingImages(false)
      return
    }

    Promise.all(
      files.map(file => {
        return new Promise((resolve, reject) => {
          // Check file size (limit to 5MB)
          if (file.size > 5 * 1024 * 1024) {
            showNotification(`Image ${file.name} is too large. Please use images under 5MB.`, 'error')
            reject(new Error('File too large'))
            return
          }
          
          // Check file type
          if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} is not a valid image file.`, 'error')
            reject(new Error('Invalid file type'))
            return
          }
          
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
    ).then(base64Images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }))
      showNotification(`${base64Images.length} image(s) uploaded successfully!`, 'success')
    }).catch(error => {
      console.error('Error processing images:', error)
      showNotification('Error processing images. Please try again.', 'error')
    }).finally(() => {
      setIsProcessingImages(false)
      // Reset the input so the same file can be selected again if needed
      e.target.value = ''
    })
  }, [showNotification])

  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.title.trim()) {
      showNotification('Please enter a product title.', 'error')
      return false
    }
    if (!formData.description.trim()) {
      showNotification('Please enter a product description.', 'error')
      return false
    }
    if (!formData.category) {
      showNotification('Please select a category.', 'error')
      return false
    }
    if (!formData.condition) {
      showNotification('Please select the condition.', 'error')
      return false
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showNotification('Please enter a valid price.', 'error')
      return false
    }
    if (!formData.location.trim()) {
      showNotification('Please enter your location.', 'error')
      return false
    }
    if (formData.images.length === 0) {
      showNotification('Please upload at least one image.', 'error')
      return false
    }
    if (formData.images.length > 5) {
      showNotification('You can upload maximum 5 images per product.', 'error')
      return false
    }
    return true
  }, [formData, showNotification])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      showNotification('Please login to list your products.', 'error')
      return
    }
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Prepare product data - only send fields expected by backend
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        images: formData.images.length > 0 ? formData.images : [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
        ],
        deliveryOptions: ['pickup'],
        negotiable: true
      }

      // Add originalPrice only if provided
      if (formData.originalPrice && parseFloat(formData.originalPrice) > 0) {
        productData.originalPrice = parseFloat(formData.originalPrice)
      }

      const response = await apiService.createProduct(productData)
      console.log('Product creation response:', response)
      
      showNotification('Product listed successfully!', 'success')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        condition: '',
        price: '',
        originalPrice: '',
        location: '',
        images: []
      })

      // Navigate to profile page to see the product
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
      
    } catch (error) {
      console.error('Error creating product:', error)
      showNotification(error.message || 'Failed to list product. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [formData, isAuthenticated, showNotification, validateForm])

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to list your products for sale.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Product</h1>
          <p className="text-gray-600">Sell your products to local buyers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your product"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your product in detail..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isProcessingImages}
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${isProcessingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isProcessingImages ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-3xl text-purple-600 mb-2"></i>
                      <p className="text-purple-600">Processing images...</p>
                      <p className="text-sm text-gray-500">Please wait while we process your images</p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-gray-600">Click to upload images or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                    </>
                  )}
                </label>
              </div>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Images ({formData.images.length}/5):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Listing Product...
                  </>
                ) : (
                  'List Product'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Sell
