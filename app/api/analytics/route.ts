import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/analytics - Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const clinicId = request.nextUrl.searchParams.get("clinicId")
    const period = request.nextUrl.searchParams.get("period") || "30"

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const whereClinic = clinicId ? { clinicId } : {}

    // Get overall statistics
    const [
      totalClinics,
      totalBookings,
      totalReviews,
      totalFavorites,
      totalViews,
      recentBookings,
      recentReviews,
      clinicStats,
      popularServices,
      topClinics,
    ] = await Promise.all([
      // Total clinics
      prisma.clinic.count(),

      // Total bookings
      prisma.booking.count(),

      // Total reviews
      prisma.review.count(),

      // Total favorites
      prisma.favorite.count(),

      // Total views
      prisma.clinicView.count(),

      // Recent bookings (last N days)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startDate,
          },
          ...whereClinic,
        },
      }),

      // Recent reviews (last N days)
      prisma.review.count({
        where: {
          createdAt: {
            gte: startDate,
          },
          ...(clinicId ? { clinicId } : {}),
        },
      }),

      // Clinic-specific stats if clinicId provided
      clinicId
        ? prisma.clinic.findUnique({
            where: { id: clinicId },
            include: {
              _count: {
                select: {
                  bookings: true,
                  reviews: true,
                  favorites: true,
                  procedures: true,
                },
              },
              reviews: {
                select: {
                  rating: true,
                },
              },
            },
          })
        : null,

      // Popular services
      prisma.clinic.findMany({
        select: {
          services: true,
        },
      }),

      // Top clinics by reviews
      prisma.clinic.findMany({
        include: {
          _count: {
            select: {
              reviews: true,
              bookings: true,
              favorites: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          reviews: {
            _count: "desc",
          },
        },
        take: 10,
      }),
    ])

    // Calculate popular services
    const serviceCounts: Record<string, number> = {}
    popularServices.forEach((clinic) => {
      clinic.services.forEach((service) => {
        serviceCounts[service] = (serviceCounts[service] || 0) + 1
      })
    })

    const popularServicesList = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }))

    // Calculate average ratings for top clinics
    const topClinicsWithRatings = topClinics.map((clinic) => {
      const avgRating =
        clinic.reviews.length > 0
          ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) /
            clinic.reviews.length
          : 0
      return {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        averageRating: avgRating,
        reviewCount: clinic._count.reviews,
        bookingCount: clinic._count.bookings,
        favoriteCount: clinic._count.favorites,
      }
    })

    // Get booking and review trends
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...whereClinic,
      },
      select: {
        createdAt: true,
      },
    })

    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...(clinicId ? { clinicId } : {}),
      },
      select: {
        createdAt: true,
      },
    })

    // Group by date
    const bookingTrends = bookings.map((b) => ({
      date: b.createdAt.toISOString().split("T")[0],
      count: 1,
    }))

    const reviewTrends = reviews.map((r) => ({
      date: r.createdAt.toISOString().split("T")[0],
      count: 1,
    }))

    return Response.json({
      overview: {
        totalClinics,
        totalBookings,
        totalReviews,
        totalFavorites,
        totalViews,
        recentBookings,
        recentReviews,
      },
      period: days,
      popularServices: popularServicesList,
      topClinics: topClinicsWithRatings,
      trends: {
        bookings: bookingTrends,
        reviews: reviewTrends,
      },
      clinicStats: clinicStats || null,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
