import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import AlertBanner from './AlertBanner'
import Breadcrumbs from '../ui/Breadcrumbs'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <AlertBanner />
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 lg:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
