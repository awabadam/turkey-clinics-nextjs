import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// PUT /api/bookings/:id - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = user.role === "ADMIN"
    const body = await request.json()
    const { status } = body

    if (!status || !["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 })
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    const isOwner = booking.userId === user.id

    // Only allow cancellation if user is admin or owner
    if (status === "CANCELLED" && !isAdmin && !isOwner) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Only admins can change status to CONFIRMED
    if (status === "CONFIRMED" && !isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return Response.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return Response.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
