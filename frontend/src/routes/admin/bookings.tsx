import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, MessageSquare, Calendar } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"

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
  }
}

export const Route = createFileRoute('/admin/bookings')({
  component: AdminBookingsPage,
})

function AdminBookingsPage() {
  const search = useSearch({ from: '/admin/bookings' })
  const status = (search as any).status || ""
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append("status", status)
      const response = await api.get<Booking[]>(`/bookings?${params.toString()}`)
      return response
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return api.put(`/bookings/${bookingId}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast({
        title: "Booking updated",
        description: "The booking status has been updated.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      })
    },
  })

  const updateStatus = (bookingId: string, newStatus: string) => {
    updateStatusMutation.mutate({ bookingId, status: newStatus })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    )
  }

  const bookingsList = bookings || []

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Bookings</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                      title="No bookings found"
                      description={
                        status
                          ? `No bookings with status "${status}" found.`
                          : "No bookings have been made yet."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                bookingsList.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.clinic.name}</TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{booking.email}</div>
                        <div className="text-muted-foreground">{booking.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              onClick={() => updateStatus(booking.id, "CONFIRMED")}
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              onClick={() => updateStatus(booking.id, "CANCELLED")}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.message && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Message from {booking.name}</DialogTitle>
                                <DialogDescription>
                                  {booking.message}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
