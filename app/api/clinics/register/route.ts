import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { clinicRegistrationSchema } from "@/schemas/clinic-registration"
import { slugify } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { z } from "zod"

// POST /api/clinics/register - Self-service clinic registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = clinicRegistrationSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate slug
    let slug = slugify(data.clinicName)
    const existingClinic = await prisma.clinic.findUnique({
      where: { slug },
    })
    if (existingClinic) {
      slug = `${slug}-${Date.now()}`
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Transaction to create User and Clinic
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.ownerName,
          role: "CLINIC_OWNER",
        },
      })

      await tx.clinic.create({
        data: {
          name: data.clinicName,
          slug,
          address: data.address,
          city: data.city,
          phone: data.phone,
          website: data.website || null,
          description: data.description || null,
          status: "PENDING_APPROVAL",
          ownerId: user.id,
        },
      })
    })

    return Response.json(
      { message: "Clinic registration submitted successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error registering clinic:", error)
    return Response.json(
      { error: "Failed to register clinic" },
      { status: 500 }
    )
  }
}
