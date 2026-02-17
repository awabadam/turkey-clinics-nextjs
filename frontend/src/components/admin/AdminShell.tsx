import React from "react"
import { AdminHeader } from "./AdminHeader"
import { AdminSidebar } from "./AdminSidebar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
