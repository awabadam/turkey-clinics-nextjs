import { prisma } from "@/lib/prisma"

// GET /api/clinics/stats - Get clinic statistics
export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        city: true,
      },
    })

    const uniqueCities = Array.from(new Set(clinics.map((c) => c.city))).sort()
    const totalCount = clinics.length

    return Response.json({
      _count: totalCount,
      cities: uniqueCities,
    })
  } catch (error) {
    console.error("Error fetching clinic stats:", error)
    return Response.json({ error: "Failed to fetch clinic stats" }, { status: 500 })
  }
}
