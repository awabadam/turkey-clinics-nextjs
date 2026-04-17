import { NextResponse, type NextRequest } from "next/server"

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  return atob(padded)
}

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const payload = JSON.parse(base64UrlDecode(parts[1]))

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) return false

    return true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const isAuthenticated = token ? isTokenValid(token) : false

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
