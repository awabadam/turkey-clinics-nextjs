"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, MapPin, Phone, Mail, MessageSquare } from "lucide-react"
import { BookingActions } from "@/components/account/BookingActions"

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  message: string | null
  status: string
  createdAt: string
  clinic: {
    id: string
    name: string
    slug: string
    address: string
    city: string
    phone: string | null
    email: string | null
  }
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await api.get<Booking[]>("/bookings")
      return response
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Please log in to view your bookings.</p>
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Failed to load bookings. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const bookingsList = bookings || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "PENDING":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your appointment bookings
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/account">Back to Account</Link>
          </Button>
        </div>

        {bookingsList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven&apos;t made any bookings yet. Browse our clinics to book an appointment.
              </p>
              <Button asChild>
                <Link href="/">Browse Clinics</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookingsList.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Link
                          href={`/clinics/${booking.clinic.slug}`}
                          className="hover:underline"
                        >
                          {booking.clinic.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.clinic.address}, {booking.clinic.city}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(booking.status) as any}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Your Details</p>
                        <p className="mt-1">{booking.name}</p>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{booking.phone}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Clinic Contact</p>
                        {booking.clinic.phone && (
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{booking.clinic.phone}</span>
                          </div>
                        )}
                        {booking.clinic.email && (
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{booking.clinic.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.message && (
                      <div>
                        <p className="font-medium text-muted-foreground text-sm mb-1">
                          Message
                        </p>
                        <div className="flex items-start gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-3 w-3 mt-0.5" />
                          <p>{booking.message}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                      {booking.status === "PENDING" && (
                        <BookingActions bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
