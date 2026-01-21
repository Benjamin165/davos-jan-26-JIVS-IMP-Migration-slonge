import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear stored auth data and redirect to login
      localStorage.removeItem('jivs-auth')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
