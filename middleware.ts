import { NextResponse, type NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  let isAuthenticated = false

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      isAuthenticated = true
    } catch {
      // Invalid token
    }
  }

  // Redirect unauthenticated users from protected routes
  const protectedPaths = ["/account", "/favorites", "/clinic-portal", "/admin"]
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/register"]
  const isAuthPage = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isAuthPage && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
