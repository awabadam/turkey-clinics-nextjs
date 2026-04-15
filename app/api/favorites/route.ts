import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/favorites - Get all favorites or check if specific clinic is favorited
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clinicId = request.nextUrl.searchParams.get("clinicId")

    if (clinicId) {
      // Check if specific clinic is favorited
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_clinicId: {
            userId: user.id,
            clinicId,
          },
        },
      })

      return Response.json({ isFavorite: !!favorite })
    }

    // Get all favorites for user
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        clinic: {
          include: {
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return Response.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clinicId } = body

    if (!clinicId) {
      return Response.json({ error: "Missing clinicId" }, { status: 400 })
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    })

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 })
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_clinicId: {
          userId: user.id,
          clinicId,
        },
      },
    })

    if (existing) {
      return Response.json({ error: "Already favorited" }, { status: 400 })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        clinicId,
      },
      include: {
        clinic: {
          include: {
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
    })

    return Response.json(favorite, { status: 201 })
  } catch (error) {
    console.error("Error creating favorite:", error)
    return Response.json({ error: "Failed to create favorite" }, { status: 500 })
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clinicId = request.nextUrl.searchParams.get("clinicId")

    if (!clinicId) {
      return Response.json({ error: "Missing clinicId" }, { status: 400 })
    }

    await prisma.favorite.delete({
      where: {
        userId_clinicId: {
          userId: user.id,
          clinicId,
        },
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting favorite:", error)
    return Response.json({ error: "Failed to delete favorite" }, { status: 500 })
  }
}
