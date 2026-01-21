import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '../context/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
          <button type="button" className="text-primary-400 hover:text-primary-300">
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
    </motion.div>
  )
}
