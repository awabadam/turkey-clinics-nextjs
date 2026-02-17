import { Link } from '@tanstack/react-router'
import { UserMenu } from "@/components/navigation/UserMenu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Link
                to="/"
                search={{ city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined }}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                View Site
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-6 w-px bg-border/50" />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
