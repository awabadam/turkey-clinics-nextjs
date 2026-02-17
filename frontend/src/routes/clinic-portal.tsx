import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/clinic-portal')({
  component: ClinicPortalLayout,
})

function ClinicPortalLayout() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return <div className="p-8">Loading...</div>

  if (!user) {
    throw redirect({ to: '/clinic-login' })
  }

  if (user.role !== 'CLINIC_OWNER') {
    throw redirect({ to: '/', search: { city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined } })
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-background border-b h-16 flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">Clinic Portal</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/clinic-portal" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/clinic-portal/manage" className="text-muted-foreground hover:text-primary transition-colors">Manage Profile</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user.name}</span>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-6 max-w-7xl">
        <Outlet />
      </main>
    </div>
  )
}
