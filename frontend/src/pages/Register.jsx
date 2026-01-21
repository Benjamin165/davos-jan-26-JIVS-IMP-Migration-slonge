import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuthStore } from '../context/authStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate individual field
  const validateField = (field, value) => {
    const errors = { ...fieldErrors }

    switch (field) {
      case 'email':
        if (value && !isValidEmail(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
      case 'password':
        if (value && value.length < 8) {
          errors.password = 'Password must be at least 8 characters'
        } else {
          delete errors.password
        }
        break
      case 'confirmPassword':
        if (value && value !== password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          delete errors.confirmPassword
        }
        break
      case 'name':
        if (value && value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters'
        } else {
          delete errors.name
        }
        break
      default:
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    // Clear error when user types a valid email
    if (fieldErrors.email && isValidEmail(value)) {
      setFieldErrors(prev => {
        const { email, ...rest } = prev
        return rest
      })
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    // Clear password error when valid
    if (fieldErrors.password && value.length >= 8) {
      setFieldErrors(prev => {
        const { password, ...rest } = prev
        return rest
      })
    }
    // Re-validate confirm password when password changes
    if (confirmPassword && value !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else if (confirmPassword) {
      setFieldErrors(prev => {
        const { confirmPassword, ...rest } = prev
        return rest
      })
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    // Clear error when passwords match
    if (value === password) {
      setFieldErrors(prev => {
        const { confirmPassword, ...rest } = prev
        return rest
      })
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    }
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    // Clear name error when valid
    if (fieldErrors.name && value.trim().length >= 2) {
      setFieldErrors(prev => {
        const { name, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate all fields
    const errors = {}

    if (!name.trim()) {
      errors.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    const result = await register(email, password, name)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400 text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={() => validateField('name', name)}
              className={`input pl-10 ${fieldErrors.name ? 'border-error-500 focus:border-error-500' : ''}`}
              placeholder="John Doe"
            />
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-error-400 mt-1" role="alert" aria-live="polite">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateField('email', email)}
              className={`input pl-10 ${fieldErrors.email ? 'border-error-500 focus:border-error-500' : ''}`}
              placeholder="you@example.com"
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-error-400 mt-1" role="alert" aria-live="polite">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validateField('password', password)}
              className={`input pl-10 ${fieldErrors.password ? 'border-error-500 focus:border-error-500' : ''}`}
              placeholder="••••••••"
            />
          </div>
          {fieldErrors.password ? (
            <p className="text-xs text-error-400 mt-1" role="alert" aria-live="polite">{fieldErrors.password}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              className={`input pl-10 ${fieldErrors.confirmPassword ? 'border-error-500 focus:border-error-500' : ''}`}
              placeholder="••••••••"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-error-400 mt-1" role="alert" aria-live="polite">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
