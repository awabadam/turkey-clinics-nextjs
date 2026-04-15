import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// PUT /api/clinics/admin/:id/approve - Approve clinic (admin only)
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
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { status: "ACTIVE" },
      include: { owner: true },
    })

    // TODO: Send approval email

    return Response.json(clinic)
  } catch (error) {
    console.error("Error approving clinic:", error)
    return Response.json({ error: "Failed to approve clinic" }, { status: 500 })
  }
}
