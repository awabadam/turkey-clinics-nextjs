import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from '@tanstack/react-router'
import { Calendar, Settings, User, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Please log in to view your account.</p>
              <Button asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{user.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "User"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/account/profile">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/account/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  View My Bookings
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/admin/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
