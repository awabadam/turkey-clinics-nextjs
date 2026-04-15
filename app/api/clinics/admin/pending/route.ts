import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/clinics/admin/pending - List pending clinics (admin only)
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const clinics = await prisma.clinic.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { owner: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(clinics)
  } catch (error) {
    console.error("Error fetching pending clinics:", error)
    return Response.json({ error: "Failed to fetch pending clinics" }, { status: 500 })
  }
}
