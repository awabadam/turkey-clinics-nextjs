import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = "token"

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  return user
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
