// src/app/api/admin/products/[id]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// PATCH /api/admin/products/:id  → update sebagian field
export async function PATCH(req, { params }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: "Invalid id" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const data = {
    ...(body.name != null ? { name: String(body.name) } : {}),
    ...(body.slug != null ? { slug: String(body.slug) } : {}),
    ...(body.price != null ? { price: Number(body.price) } : {}),
    ...(body.stock != null ? { stock: Number(body.stock) } : {}),
    ...(body.description !== undefined ? { description: body.description || null } : {}),
    ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
    ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    ...(body.categoryId != null ? { categoryId: Number(body.categoryId) } : {}),
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ message: "Update failed" }, { status: 400 })
  }
}

// DELETE /api/admin/products/:id → soft delete
export async function DELETE(req, { params }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: "Invalid id" }, { status: 400 })

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true },
    })
    return NextResponse.json({ ok: true, id: updated.id })
  } catch {
    return NextResponse.json({ message: "Delete failed" }, { status: 400 })
  }
}