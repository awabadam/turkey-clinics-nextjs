"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Star, Heart } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

interface Favorite {
  id: string
  clinic: {
    id: string
    name: string
    slug: string
    address: string
    city: string
    images: string[]
    reviews: Array<{ rating: number }>
    _count: {
      reviews: number
    }
  }
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const { data: favorites, isLoading, isError } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get<Favorite[]>("/favorites")
      return response
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={<Heart className="h-12 w-12 text-muted-foreground" />}
            title="Login required"
            description="Please log in to view your favorites."
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={<Heart className="h-12 w-12 text-destructive" />}
            title="Error loading favorites"
            description="Failed to load your favorites. Please try again."
          />
        </div>
      </div>
    )
  }

  const favoritesList = favorites || []

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground mt-2">
              Clinics you&apos;ve saved for later
            </p>
          </div>
        </div>

        {favoritesList.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-12 w-12 text-muted-foreground" />}
            title="No favorites yet"
            description="Start exploring clinics and save your favorites to compare them later."
            action={{
              label: "Browse Clinics",
              href: "/",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritesList.map((favorite) => {
              const clinic = favorite.clinic
              const averageRating =
                clinic.reviews.length > 0
                  ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    clinic.reviews.length
                  : 0

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/clinics/${clinic.slug}`}>
                    {clinic.images.length > 0 ? (
                      <div className="h-48 bg-muted overflow-hidden">
                        <img
                          src={clinic.images[0]}
                          alt={clinic.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{clinic.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {clinic.address}, {clinic.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{clinic.city}</Badge>
                        {averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({clinic._count.reviews})
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
