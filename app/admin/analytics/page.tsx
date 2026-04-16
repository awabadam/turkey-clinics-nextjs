"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Calendar, Star, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AnalyticsData {
  overview: {
    totalClinics: number
    totalBookings: number
    totalReviews: number
    totalFavorites: number
    recentBookings: number
    recentReviews: number
  }
  period: number
  popularServices: Array<{ service: string; count: number }>
  topClinics: Array<{
    id: string
    name: string
    slug: string
    averageRating: number
    reviewCount: number
    bookingCount: number
    favoriteCount: number
  }>
  trends: {
    bookings: Array<{ date: string; count: number }>
    reviews: Array<{ date: string; count: number }>
  }
}

export default function AdminAnalyticsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const period = searchParams.get("period") || "30"

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const response = await api.get<AnalyticsData>(`/analytics?period=${period}`)
      return response
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Failed to load analytics data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={period} onValueChange={(value) => {
          router.push(`/admin/analytics?period=${value}`)
        }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalClinics}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.recentBookings} in last {data.period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.recentReviews} in last {data.period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalFavorites}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>Most offered services across clinics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.popularServices.length > 0 ? (
                data.popularServices.map((item) => (
                  <div
                    key={item.service}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm">{item.service}</span>
                    <Badge variant="secondary">{item.count} clinics</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Clinics */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clinics</CardTitle>
            <CardDescription>Clinics with most reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topClinics.length > 0 ? (
                data.topClinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/admin/clinics/${clinic.id}`}
                        className="font-medium hover:underline"
                      >
                        {clinic.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">
                            {clinic.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({clinic.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {clinic.bookingCount} bookings
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {clinic.favoriteCount} favorites
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>
            Bookings and reviews over the last {data.period} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
              </h3>
              <div className="text-sm text-muted-foreground">
                Total: {data.trends.bookings.reduce((sum, t) => sum + t.count, 0)} bookings
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </h3>
              <div className="text-sm text-muted-foreground">
                Total: {data.trends.reviews.reduce((sum, t) => sum + t.count, 0)} reviews
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              <p>
                Note: Detailed trend charts can be added with a charting library like
                Recharts or Chart.js
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
