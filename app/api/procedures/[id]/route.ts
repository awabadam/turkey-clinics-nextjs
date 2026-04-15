import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// PUT /api/procedures/:id - Update a procedure (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, averagePrice } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (averagePrice !== undefined) {
      updateData.averagePrice = averagePrice ? parseFloat(averagePrice) : null
    }

    const procedure = await prisma.procedure.update({
      where: { id },
      data: updateData,
    })

    return Response.json(procedure)
  } catch (error) {
    console.error("Error updating procedure:", error)
    return Response.json({ error: "Failed to update procedure" }, { status: 500 })
  }
}

// DELETE /api/procedures/:id - Delete a procedure (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await prisma.procedure.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting procedure:", error)
    return Response.json({ error: "Failed to delete procedure" }, { status: 500 })
  }
}
