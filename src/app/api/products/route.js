import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'

// ========================================
// GET /api/products?q=search&category=slug
// (mengembalikan array agar kompatibel dengan FE sekarang)
// ========================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const qRaw = searchParams.get("q") || ""
    const categoryRaw = searchParams.get("category") || ""

    const q = qRaw.trim()
    const category = categoryRaw.trim()

    const where = {
      isActive: true,
      deletedAt: null,
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ]
      } : {}),
      ...(category ? {
        // ⬅️ FIX: relasi to-one harus pakai `is: { ... }`
        category: { is: { slug: category } }
      } : {}),
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (err) {
    console.error("❌ GET /api/products error:", err)
    return NextResponse.json(
      { message: "Server error while fetching products" },
      { status: 500 }
    )
  }
}

// ========================================
// POST /api/products  (ADMIN only) — tetap sama
// ========================================
export async function POST(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await req.json()

    if (!data.name || !data.slug || !data.price || !data.categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (data.stock < 0) {
      return NextResponse.json({ message: 'Stock must be >= 0' }, { status: 400 })
    }
    if (data.price < 0) {
      return NextResponse.json({ message: 'Price must be >= 0' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        stock: data.stock ?? 0,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
      }
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error("❌ Error creating product:", err)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}