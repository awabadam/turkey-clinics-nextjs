import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
})

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return Response.json({ message: "Password updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Change password error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
