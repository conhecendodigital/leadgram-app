import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/roles'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'
import AdminMobileMenu from '@/components/admin/admin-mobile-menu'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const role = await getUserRole(user.id)

  if (role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - visible only on desktop */}
      <AdminSidebar user={user} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <AdminHeader user={user} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile menu - visible only on mobile */}
      <AdminMobileMenu user={user} />
    </div>
  )
}
