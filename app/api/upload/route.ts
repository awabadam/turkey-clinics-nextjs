import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { put } from "@vercel/blob"
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
    const filename = `clinic-images/${timestamp}-${randomString}.webp`

    // Upload to Vercel Blob
    const blob = await put(filename, processed, {
      access: "public",
      contentType: "image/webp",
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return Response.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
