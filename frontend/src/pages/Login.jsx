import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, X, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import api from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)

    try {
      await api.post('/auth/reset-password', { email: forgotEmail })
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Failed to send reset email')
    }

    setForgotLoading(false)
  }

  const closeForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setForgotSuccess(false)
    setForgotError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="you@example.com"
              required
            />
          </div>
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
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-dark-600 bg-dark-700 text-primary-500" />
            <span className="text-gray-400">Remember me</span>
          </label>
          <button
            type="button"
            className="text-primary-400 hover:text-primary-300"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300">
          Sign up
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="mt-6 p-3 rounded-lg bg-dark-700/50 text-xs text-gray-400">
        <p className="font-medium text-gray-300 mb-1">Demo Credentials:</p>
        <p>Admin: admin@jivs.com / admin123</p>
        <p>User: user@jivs.com / user123</p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeForgotPassword}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Reset Password</h3>
                  <button
                    onClick={closeForgotPassword}
                    className="p-1 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {forgotSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-success-400" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">Check your email</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      If an account exists with that email, we've sent password reset instructions.
                    </p>
                    <button
                      onClick={closeForgotPassword}
                      className="btn-primary px-6 py-2"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>

                    {forgotError && (
                      <div className="p-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400 text-sm">
                        {forgotError}
                      </div>
                    )}

                    <div>
                      <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="input pl-10"
                          placeholder="you@example.com"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeForgotPassword}
                        className="btn-secondary flex-1 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="btn-primary flex-1 py-2"
                      >
                        {forgotLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
