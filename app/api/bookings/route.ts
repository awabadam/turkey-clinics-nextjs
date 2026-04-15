import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createBookingSchema } from "@/schemas/booking"
import { emailService } from "@/lib/email"
import { z } from "zod"

// GET /api/bookings - Get bookings (admin: all, user: own)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = user.role === "ADMIN"
    const status = request.nextUrl.searchParams.get("status")

    const where: any = {}
    if (!isAdmin) {
      where.userId = user.id
    }
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// POST /api/bookings - Create a new booking (public, optionally authenticated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createBookingSchema.parse(body)

    const clinic = await prisma.clinic.findUnique({
      where: { id: data.clinicId },
    })

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 })
    }

    // Get userId if authenticated (optional)
    let userId: string | null = null
    try {
      const user = await getAuthUser()
      if (user) {
        userId = user.id
      }
    } catch {
      // Not authenticated, continue without userId
    }

    const booking = await prisma.booking.create({
      data: {
        clinicId: data.clinicId,
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        status: "PENDING",
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    // Send notifications (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || clinic.email
    if (adminEmail) {
      emailService.sendNewLeadNotification(adminEmail, booking, clinic).catch(console.error)
    }
    emailService.sendBookingConfirmation(booking.email, booking, clinic).catch(console.error)

    return Response.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Validation Error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating booking:", error)
    return Response.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
