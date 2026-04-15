import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// PUT /api/clinics/admin/:id/reject - Reject/suspend clinic (admin only)
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
    await prisma.clinic.update({
      where: { id },
      data: { status: "SUSPENDED" },
    })

    return Response.json({ message: "Clinic rejected/suspended" })
  } catch (error) {
    console.error("Error rejecting clinic:", error)
    return Response.json({ error: "Failed to reject clinic" }, { status: 500 })
  }
}
