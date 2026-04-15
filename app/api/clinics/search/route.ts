import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/clinics/search - Autocomplete search
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")
    if (!query || query.length < 2) {
      return Response.json([])
    }

    const clinics = await prisma.clinic.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        images: true,
      },
      take: 5,
    })

    return Response.json(clinics)
  } catch (error) {
    console.error("Error searching clinics:", error)
    return Response.json({ error: "Failed to search clinics" }, { status: 500 })
  }
}
