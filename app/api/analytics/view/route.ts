import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/analytics/view - Record a clinic view (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clinicId } = body

    if (!clinicId) {
      return Response.json({ error: "Missing clinicId" }, { status: 400 })
    }

    await prisma.clinicView.create({
      data: {
        clinicId,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error recording view:", error)
    return Response.json({ error: "Failed to record view" }, { status: 500 })
  }
}
