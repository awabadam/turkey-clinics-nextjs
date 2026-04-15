import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/clinics/my-clinic - Get owned clinic (Clinic Owner only)
export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { ownedClinic: true },
    })

    if (!user || !user.ownedClinic) {
      return Response.json({ error: "No clinic found for this user" }, { status: 404 })
    }

    return Response.json(user.ownedClinic)
  } catch (error) {
    console.error("Error fetching my clinic:", error)
    return Response.json({ error: "Failed to fetch clinic" }, { status: 500 })
  }
}
