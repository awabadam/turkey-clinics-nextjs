import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

// GET /api/clinics/:id - Get single clinic by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        procedures: true,
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    })

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 })
    }

    return Response.json(clinic)
  } catch (error) {
    console.error("Error fetching clinic:", error)
    return Response.json({ error: "Failed to fetch clinic" }, { status: 500 })
  }
}

// PUT /api/clinics/:id - Update clinic (Admin or Owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check permissions
    if (user.role !== "ADMIN") {
      const existingClinic = await prisma.clinic.findUnique({
        where: { id },
        select: { ownerId: true },
      })

      if (!existingClinic || existingClinic.ownerId !== user.id) {
        return Response.json({ error: "Unauthorized to update this clinic" }, { status: 403 })
      }
    }

    const clinicSchema = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      address: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      services: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      accreditations: z.array(z.string()).optional(),
      doctorCount: z.number().optional(),
      establishedYear: z.number().optional(),
      images: z.array(z.string()).optional(),
      beforeAfterImages: z.array(z.string()).optional(),
      trustBadges: z.array(z.string()).optional(),
      successStories: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
    })

    const body = await request.json()
    const data = clinicSchema.parse(body)

    // Prevent non-admins from updating restricted fields
    if (user.role !== "ADMIN") {
      delete data.featured
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data,
    })
    return Response.json(clinic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating clinic:", error)
    return Response.json({ error: "Failed to update clinic" }, { status: 500 })
  }
}

// DELETE /api/clinics/:id - Delete clinic (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    await prisma.clinic.delete({ where: { id } })
    return Response.json({ message: "Clinic deleted successfully" })
  } catch (error) {
    console.error("Error deleting clinic:", error)
    return Response.json({ error: "Failed to delete clinic" }, { status: 500 })
  }
}
