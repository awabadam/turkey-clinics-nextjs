import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/clinics/slug/:slug - Get clinic by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const clinic = await prisma.clinic.findUnique({
      where: { slug },
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
