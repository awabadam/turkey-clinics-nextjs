import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

// GET /api/clinics - List clinics with filters, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get("city")
    const search = searchParams.get("search")
    const services = searchParams.get("services")
    const languages = searchParams.get("languages")
    const minRating = searchParams.get("minRating")
    const sortBy = searchParams.get("sortBy") || "newest"
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "12"

    const where: any = {}

    if (city && city !== "all") {
      where.city = city
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (services) {
      const servicesArray = services.split(",").filter(Boolean)
      if (servicesArray.length > 0) {
        where.services = { hasSome: servicesArray }
      }
    }

    if (languages) {
      const languagesArray = languages.split(",").filter(Boolean)
      if (languagesArray.length > 0) {
        where.languages = { hasSome: languagesArray }
      }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const clinicsWithReviews = await prisma.clinic.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true },
        },
        procedures: {
          select: { averagePrice: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    })

    // Calculate average ratings and filter by minRating
    let filteredClinics = clinicsWithReviews.map((clinic) => {
      const avgRating =
        clinic.reviews.length > 0
          ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) / clinic.reviews.length
          : 0
      return {
        ...clinic,
        averageRating: avgRating,
      }
    })

    if (minRating && minRating !== "all") {
      const minRatingNum = parseFloat(minRating)
      filteredClinics = filteredClinics.filter(
        (clinic) => clinic.averageRating >= minRatingNum
      )
    }

    // Sort clinics
    let sortedClinics = [...filteredClinics]
    switch (sortBy) {
      case "rating":
        sortedClinics.sort((a, b) => b.averageRating - a.averageRating)
        break
      case "reviews":
        sortedClinics.sort((a, b) => b._count.reviews - a._count.reviews)
        break
      case "name":
        sortedClinics.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
      default:
        sortedClinics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
    }

    const total = sortedClinics.length
    const paginatedClinics = sortedClinics.slice(skip, skip + limitNum)
    const totalPages = Math.ceil(total / limitNum)

    return Response.json({
      clinics: paginatedClinics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching clinics:", error)
    return Response.json({ error: "Failed to fetch clinics" }, { status: 500 })
  }
}

// POST /api/clinics - Create clinic (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const clinicSchema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      address: z.string().min(1),
      city: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      services: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      certifications: z.array(z.string()).default([]),
      accreditations: z.array(z.string()).default([]),
      doctorCount: z.number().optional(),
      establishedYear: z.number().optional(),
      images: z.array(z.string()).default([]),
      beforeAfterImages: z.array(z.string()).default([]),
      trustBadges: z.array(z.string()).default([]),
      successStories: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    })

    const body = await request.json()
    const data = clinicSchema.parse(body)
    const clinic = await prisma.clinic.create({ data })
    return Response.json(clinic, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating clinic:", error)
    return Response.json({ error: "Failed to create clinic" }, { status: 500 })
  }
}
