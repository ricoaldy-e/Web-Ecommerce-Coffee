// src/app/api/admin/categories/[id]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// PATCH /api/admin/categories/:id → rename / ubah slug
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
    ...(body.slug != null
      ? { slug: body.slug ? String(body.slug) : slugify(body.name || "") }
      : {}),
  }

  try {
    const cat = await prisma.category.update({ where: { id }, data })
    return NextResponse.json(cat)
  } catch {
    return NextResponse.json({ message: "Update failed" }, { status: 400 })
  }
}

// DELETE /api/admin/categories/:id → soft delete (blokir jika masih dipakai produk aktif)
export async function DELETE(req, { params }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: "Invalid id" }, { status: 400 })

  const used = await prisma.product.count({
    where: { categoryId: id, deletedAt: null },
  })
  if (used > 0) {
    return NextResponse.json(
      { message: "Kategori masih dipakai produk aktif" },
      { status: 409 }
    )
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Delete failed" }, { status: 400 })
  }
}