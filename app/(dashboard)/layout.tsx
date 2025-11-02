import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'
import MobileMenu from '@/components/dashboard/mobile-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileMenu />
    </div>
  )
}
