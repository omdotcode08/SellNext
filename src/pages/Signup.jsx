import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { showNotification } = useNotification()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    userType: [],
    newsletter: false,
    terms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false
  })

  // Password validation effect
  useEffect(() => {
    const password = formData.password
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    })
  }, [formData.password])

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'userType') {
      // Handle checkbox group for userType
      setFormData(prev => ({
        ...prev,
        userType: checked 
          ? [...prev.userType, value]
          : prev.userType.filter(type => type !== value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }, [])

  const togglePasswordVisibility = useCallback((field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev)
    } else {
      setShowConfirmPassword(prev => !prev)
    }
  }, [])

  const validateForm = useCallback(() => {
    const requiredFields = ['fullName', 'email', 'phone', 'location', 'password', 'confirmPassword']
    
    // Check required fields
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error')
        return false
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address.', 'error')
      return false
    }

    // Validate phone (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      showNotification('Please enter a valid 10-digit mobile number.', 'error')
      return false
    }

    // Validate password
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match.', 'error')
      return false
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      showNotification('Password must meet all requirements.', 'error')
      return false
    }

    // Check user type selection
    if (formData.userType.length === 0) {
      showNotification('Please select at least one user type (buyer or seller).', 'error')
      return false
    }

    // Check terms agreement
    if (!formData.terms) {
      showNotification('Please agree to the terms and conditions.', 'error')
      return false
    }

    return true
  }, [formData, passwordValidation, showNotification])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        userType: formData.userType,
        newsletter: formData.newsletter
      }

      const result = await signup(userData)
      
      if (result.success) {
        showNotification('Account created successfully!', 'success')
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          location: '',
          password: '',
          confirmPassword: '',
          userType: [],
          newsletter: false,
          terms: false
        })
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        showNotification(result.error || 'Signup failed. Please try again.', 'error')
      }
    } catch (error) {
      showNotification('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [formData, signup, navigate, showNotification, validateForm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center">
            <i className="fas fa-store text-white text-xl"></i>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Join SellNext Today
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Create your account to start buying and selling locally
          </p>
        </div>
        
        <form className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-white/90 mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your city"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 pr-12 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors duration-200"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 pr-12 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors duration-200"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4">
            <h4 className="text-sm font-medium text-white/90 mb-3">Password Requirements:</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-400' : 'text-white/60'}`}>
                <i className={`fas ${passwordValidation.length ? 'fa-check' : 'fa-times'}`}></i>
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-400' : 'text-white/60'}`}>
                <i className={`fas ${passwordValidation.uppercase ? 'fa-check' : 'fa-times'}`}></i>
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-400' : 'text-white/60'}`}>
                <i className={`fas ${passwordValidation.number ? 'fa-check' : 'fa-times'}`}></i>
                <span>One number</span>
              </div>
            </div>
          </div>

          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              I want to: *
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="buyer"
                  name="userType"
                  type="checkbox"
                  value="buyer"
                  checked={formData.userType.includes('buyer')}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10 backdrop-blur-md"
                />
                <label htmlFor="buyer" className="ml-3 text-sm text-white/80">
                  Buy products from local sellers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="seller"
                  name="userType"
                  type="checkbox"
                  value="seller"
                  checked={formData.userType.includes('seller')}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10 backdrop-blur-md"
                />
                <label htmlFor="seller" className="ml-3 text-sm text-white/80">
                  Sell products to local buyers
                </label>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="flex items-center">
            <input
              id="newsletter"
              name="newsletter"
              type="checkbox"
              checked={formData.newsletter}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10 backdrop-blur-md"
            />
            <label htmlFor="newsletter" className="ml-3 text-sm text-white/80">
              Subscribe to our newsletter for updates and offers
            </label>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.terms}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10 backdrop-blur-md mt-1"
            />
            <label htmlFor="terms" className="ml-3 text-sm text-white/80">
              I agree to the{' '}
              <a href="#" className="text-white hover:text-white/80 underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-white hover:text-white/80 underline">
                Privacy Policy
              </a>
              *
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-purple-600 bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-white/80">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-white hover:text-white/80 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
