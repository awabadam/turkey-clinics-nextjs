import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from '@tanstack/react-router'
import { Building2, Calendar, Star, Clock } from "lucide-react"

interface DashboardStats {
  clinicsCount: number
  bookingsCount: number
  reviewsCount: number
  pendingBookings: number
}

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // We'll need to create an admin stats endpoint
      // For now, fetch separately
      const [clinics, bookings, reviews, pending] = await Promise.all([
        api.get<{ clinics: any[] }>('/clinics?limit=1000'),
        api.get<{ bookings: any[] }>('/bookings'),
        api.get<{ reviews: any[] }>('/reviews'),
        api.get<{ bookings: any[] }>('/bookings?status=PENDING'),
      ])
      
      return {
        clinicsCount: clinics.clinics?.length || 0,
        bookingsCount: bookings.bookings?.length || 0,
        reviewsCount: reviews.reviews?.length || 0,
        pendingBookings: pending.bookings?.length || 0,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statsData = stats || {
    clinicsCount: 0,
    bookingsCount: 0,
    reviewsCount: 0,
    pendingBookings: 0,
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statsData.clinicsCount}</div>
            <CardDescription>
              <Link to="/admin/clinics" className="hover:underline">
                View all →
              </Link>
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statsData.bookingsCount}</div>
            <CardDescription>
              <Link to="/admin/bookings" className="hover:underline">
                View all →
              </Link>
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statsData.pendingBookings}</div>
            <CardDescription>
              <Link to="/admin/bookings" search={{ status: 'PENDING' }} className="hover:underline">
                View all →
              </Link>
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statsData.reviewsCount}</div>
            <CardDescription>All time reviews</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/admin/clinics/new">
                Add New Clinic
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/bookings">
                View Bookings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
