"use client"

import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { api } from '@/lib/api'

interface BookingActionsProps {
  bookingId: string
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    setLoading(true)
    try {
      await api.put(`/bookings/${bookingId}`, { status: "CANCELLED" })

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      <X className="mr-2 h-4 w-4" />
      {loading ? "Cancelling..." : "Cancel Booking"}
    </Button>
  )
}
