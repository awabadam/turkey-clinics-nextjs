import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// DELETE /api/reviews/:id - Delete a review (admin only)
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

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return Response.json({ error: "Review not found" }, { status: 404 })
    }

    await prisma.review.delete({
      where: { id },
    })

    return Response.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return Response.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
