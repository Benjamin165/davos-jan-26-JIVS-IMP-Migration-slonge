import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

// Route name mappings
const ROUTE_NAMES = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'dashboards': 'My Dashboards',
  'visualizations': 'Visualizations',
  'test-rules': 'Test Rules',
  'comparison': 'Comparison',
  'settings': 'Settings',
  'admin': 'Admin',
  'users': 'User Management',
  'profile': 'Profile',
  'notifications': 'Notifications',
  'appearance': 'Appearance',
  'security': 'Security'
}

// Build breadcrumb items from pathname
function buildBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []

  // Always start with Dashboard as home
  breadcrumbs.push({
    label: 'Dashboard',
    path: '/dashboard',
    isLast: segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')
  })

  // Skip if we're on dashboard (already added above)
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return breadcrumbs
  }

  // Build path incrementally
  let currentPath = ''
  segments.forEach((segment, index) => {
    // Skip 'dashboard' since we already added it
    if (segment === 'dashboard' && index === 0) return

    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Try to get a readable name
    let label = ROUTE_NAMES[segment] || segment

    // Handle numeric IDs (like /dashboards/123)
    if (!isNaN(segment)) {
      label = `#${segment}`
    }

    // Capitalize first letter if no mapping found
    if (!ROUTE_NAMES[segment] && isNaN(segment)) {
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    }

    breadcrumbs.push({
      label,
      path: currentPath,
      isLast
    })
  })

  return breadcrumbs
}

export default function Breadcrumbs({ className = '' }) {
  const location = useLocation()
  const breadcrumbs = buildBreadcrumbs(location.pathname)

  // Don't show breadcrumbs if only home
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-500 mx-1" />
            )}
            {crumb.isLast ? (
              <span className="text-gray-400 font-medium" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-primary-400 hover:text-primary-300 hover:underline transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
