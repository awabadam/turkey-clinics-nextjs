"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ClinicPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role !== "CLINIC_OWNER") {
      router.push("/")
    }
  }, [isLoading, user, router])

  if (isLoading) return <div className="p-8">Loading...</div>

  if (!user || user.role !== "CLINIC_OWNER") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-background border-b h-16 flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">Clinic Portal</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/clinic-portal" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/clinic-portal/manage" className="text-muted-foreground hover:text-primary transition-colors">Manage Profile</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user.name}</span>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
