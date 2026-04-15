import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createReviewSchema } from "@/schemas/review"
import { z } from "zod"

// GET /api/reviews - Get reviews (public, optional clinicId filter)
export async function GET(request: NextRequest) {
  try {
    const clinicId = request.nextUrl.searchParams.get("clinicId")

    const reviews = await prisma.review.findMany({
      where: clinicId ? { clinicId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST /api/reviews - Create a new review (auth required)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createReviewSchema.parse(body)

    const clinic = await prisma.clinic.findUnique({
      where: { id: data.clinicId },
    })

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 })
    }

    const review = await prisma.review.create({
      data: {
        clinicId: data.clinicId,
        userId: user.id,
        rating: data.rating,
        comment: data.comment,
        reviewCategories: (data.reviewCategories as any) || undefined,
        reviewImages: data.reviewImages || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return Response.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Validation Error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating review:", error)
    return Response.json({ error: "Failed to create review" }, { status: 500 })
  }
}
