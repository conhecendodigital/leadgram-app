import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'
import MobileMenu from '@/components/dashboard/mobile-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - visible only on desktop */}
      <Sidebar />

      {/* Main content - full width on mobile, with sidebar on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile menu - visible only on mobile */}
      <MobileMenu />
    </div>
  )
}
