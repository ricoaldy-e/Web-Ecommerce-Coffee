// src/app/api/admin/products/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  const category = (searchParams.get("category") || "").trim()
  const includeDeleted = searchParams.get("includeDeleted") === "1"
  const isActiveParam = searchParams.get("isActive")
  const isActive =
    isActiveParam === "true" ? true
    : isActiveParam === "false" ? false
    : undefined

  const where = {
    ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
    ...(category ? { category: { is: { slug: category } } } : {}),
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(products)
}

// POST /api/admin/products  (Create Product - ADMIN)
export async function POST(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const data = await req.json().catch(() => ({}))
    const { name, slug, price, stock, categoryId, description, imageUrl, isActive } = data || {}

    if (!name || !slug || categoryId == null || price == null) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    if (Number(price) < 0) {
      return NextResponse.json({ message: "Price must be >= 0" }, { status: 400 })
    }
    if (Number(stock) < 0) {
      return NextResponse.json({ message: "Stock must be >= 0" }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        name: String(name),
        slug: String(slug),
        description: description ?? null,
        price: Number(price),
        stock: Number(stock ?? 0),
        imageUrl: imageUrl ?? null,
        categoryId: Number(categoryId),
        isActive: typeof isActive === "boolean" ? isActive : true,
      }
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error("❌ Error creating product:", err)
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }
}