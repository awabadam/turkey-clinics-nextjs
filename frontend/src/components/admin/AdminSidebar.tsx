import { useState } from "react"
import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Menu,
  X,
  TrendingUp,
  Stethoscope,
  Star,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Requests",
    href: "/admin/clinic-requests",
    icon: ClipboardList,
  },
  {
    name: "Clinics",
    href: "/admin/clinics",
    icon: Building2,
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    name: "Procedures",
    href: "/admin/procedures",
    icon: Stethoscope,
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
]

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouterState()
  const pathname = router.location.pathname

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-xl font-bold text-primary">Admin Panel</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title - hidden on mobile since it's in the header */}
          <div className="hidden lg:flex items-center h-16 px-6 border-b border-border/50">
            <Link to="/admin/dashboard" className="text-xl font-serif font-bold tracking-tight">
              TCG Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Link
              to="/"
              search={{ city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <span>← View Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
