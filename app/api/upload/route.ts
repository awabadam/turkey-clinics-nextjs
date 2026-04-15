import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json(
      { error: "File too large. Maximum 5MB." },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process with Sharp
    const processed = await sharp(buffer)
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.webp`

    // Upload to Supabase Storage
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: uploadError } = await supabaseAdmin.storage
      .from("clinic-images")
      .upload(filename, processed, {
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) {
      return Response.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("clinic-images")
      .getPublicUrl(filename)

    return Response.json({ url: publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return Response.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
