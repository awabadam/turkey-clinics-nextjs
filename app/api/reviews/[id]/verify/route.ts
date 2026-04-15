import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// PUT /api/reviews/:id/verify - Toggle review verification (admin only)
export async function PUT(
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
    const body = await request.json()
    const { verified } = body

    if (typeof verified !== "boolean") {
      return Response.json({ error: "verified must be a boolean" }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id },
      data: { verified },
    })

    return Response.json(review)
  } catch (error) {
    console.error("Error updating review verification:", error)
    return Response.json({ error: "Failed to update review" }, { status: 500 })
  }
}
