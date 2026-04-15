import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { clinicRegistrationSchema } from "@/schemas/clinic-registration"
import { slugify } from "@/lib/utils"
import { createClient } from "@supabase/supabase-js"
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
      return Response.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate slug
    let slug = slugify(data.clinicName)
    const existingClinic = await prisma.clinic.findUnique({ where: { slug } })
    if (existingClinic) {
      slug = `${slug}-${Date.now()}`
    }

    // Create Supabase Auth user using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error("Error creating Supabase auth user:", authError)
      return Response.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Transaction to create User and Clinic in Prisma
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: authData.user.id,
          email: data.email,
          name: data.ownerName,
          role: "CLINIC_OWNER",
        },
      })

      const clinic = await tx.clinic.create({
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

      return { user, clinic }
    })

    return Response.json({ message: "Clinic registration submitted successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error registering clinic:", error)
    return Response.json({ error: "Failed to register clinic" }, { status: 500 })
  }
}
