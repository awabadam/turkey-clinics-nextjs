import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/procedures - Get all procedures (public, optional clinicId filter)
export async function GET(request: NextRequest) {
  try {
    const clinicId = request.nextUrl.searchParams.get("clinicId")

    const where: any = {}
    if (clinicId) {
      where.clinicId = clinicId
    }

    const procedures = await prisma.procedure.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return Response.json(procedures)
  } catch (error) {
    console.error("Error fetching procedures:", error)
    return Response.json({ error: "Failed to fetch procedures" }, { status: 500 })
  }
}

// POST /api/procedures - Create a new procedure (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, averagePrice, clinicId } = body

    if (!name || !clinicId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const procedure = await prisma.procedure.create({
      data: {
        name,
        description: description || null,
        averagePrice: averagePrice ? parseFloat(averagePrice) : null,
        clinicId,
      },
    })

    return Response.json(procedure, { status: 201 })
  } catch (error) {
    console.error("Error creating procedure:", error)
    return Response.json({ error: "Failed to create procedure" }, { status: 500 })
  }
}
