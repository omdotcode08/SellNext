import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showNotification } = useNotification()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.email || !formData.password) {
      showNotification('Please fill in all required fields.', 'error')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address.', 'error')
      return false
    }

    return true
  }, [formData, showNotification])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const result = await login(formData.email, formData.password, formData.remember)
      
      if (result.success) {
        showNotification('Login successful! Welcome back.', 'success')
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        showNotification(result.error || 'Login failed. Please try again.', 'error')
      }
    } catch (error) {
      showNotification('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [formData, login, navigate, showNotification, validateForm])

  // Test login function
  const handleTestLogin = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Create a test user if it doesn't exist
      const testUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+91 9876543210',
        location: 'Mumbai',
        userType: 'buyer'
      }

      // Check if test user exists, if not create it
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const existingUser = users.find(u => u.email === testUser.email)
      
      if (!existingUser) {
        const newUser = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          ...testUser,
          createdAt: new Date().toISOString(),
          isActive: true
        }
        users.push(newUser)
        localStorage.setItem('registeredUsers', JSON.stringify(users))
      }

      // Login with test user
      const result = await login(testUser.email, testUser.password, true)
      if (result.success) {
        showNotification('Test login successful!', 'success')
        navigate('/')
      } else {
        showNotification(result.error || 'Test login failed. Please try again.', 'error')
      }
    } catch (error) {
      showNotification('An unexpected error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [login, navigate, showNotification])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center">
            <i className="fas fa-store text-white text-xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome back to SellNext
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Sign in to your account to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 pr-12 border border-white/20 placeholder-white/50 text-white bg-white/10 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors duration-200"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/10 backdrop-blur-md"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-white/80">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-white hover:text-white/80 transition-colors duration-200">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-purple-600 bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* Test Login Button */}
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Signing In...
                </>
              ) : (
                'Quick Test Login'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-white/80">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-white hover:text-white/80 transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
