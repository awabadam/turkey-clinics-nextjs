import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return dbUser
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

export async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  return user
}
