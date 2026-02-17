import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    // This will be checked in the component
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    throw redirect({ to: '/login' })
  }

  if (user.role !== 'ADMIN') {
    throw redirect({ to: '/', search: { city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined } })
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
