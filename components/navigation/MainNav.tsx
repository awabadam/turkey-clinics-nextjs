"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from '@/components/ui/button'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function MainNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isHome = pathname === '/'
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide MainNav on admin routes as they have their own shell
  if (isAdminRoute) return null

  // If not on home page, we always want the "active" state visibility
  const isActive = scrolled || !isHome

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none py-6"
    >
      <motion.div
        layout
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-6 px-6 py-3 rounded-full transition-all duration-500 shadow-xl",
          isActive
            ? "bg-background/80 backdrop-blur-xl border border-border/50 min-w-[320px]"
            : "bg-black/20 backdrop-blur-sm border border-white/10 min-w-[300px]"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "text-xl font-serif font-bold tracking-tight transition-colors flex-shrink-0",
            isActive ? "text-foreground" : "text-white"
          )}
        >
          TCG.
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <UserMenu />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-4 h-9 font-medium tracking-wide transition-colors",
                  isActive
                    ? "hover:bg-muted"
                    : "text-white hover:bg-white/20 hover:text-white"
                )}
              >
                <Link href="/login">Log in</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className={cn(
                  "rounded-full px-5 h-9 font-medium tracking-wide transition-all shadow-sm",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white text-black hover:bg-white/90"
                )}
              >
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.nav>
  )
}
