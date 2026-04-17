import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().optional(),
})

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = updateProfileSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name || null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return Response.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Update profile error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
