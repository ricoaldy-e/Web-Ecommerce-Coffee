import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()

    const days = Math.max(1, Number(searchParams.get('days') || 30))
    const topN = Math.max(1, Number(searchParams.get('top') || 8))
    const since = new Date()
    since.setDate(since.getDate() - days)

    const where = {
      isActive: true,
      deletedAt: null,
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
      ...(category ? { category: { is: { slug: category } } } : {}),
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })

    if (products.length === 0) {
      return NextResponse.json([])
    }

    const soldAgg = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { qty: true },
      where: {
        productId: { in: products.map((p) => p.id) },
        order: { createdAt: { gte: since } },
      },
    })

    const soldMap = new Map()
    for (const row of soldAgg) {
      soldMap.set(row.productId, Number(row._sum.qty || 0))
    }

    const ranked = products
      .map((p) => ({
        id: p.id,
        sold: soldMap.get(p.id) || 0,
        stock: p.stock,
      }))
      .sort((a, b) => b.sold - a.sold)

    // ✅ Hanya produk dengan sold > 0 DAN stock > 0 yang bisa Best Seller
    const positive = ranked.filter((r) => r.sold > 0 && r.stock > 0)

    const bestIds = new Set(positive.slice(0, topN).map((r) => r.id))

    const payload = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      description: p.description,
      category: p.category,
      sold: soldMap.get(p.id) || 0,
      isBestSeller: bestIds.has(p.id),
      createdAt: p.createdAt,
    }))

    return NextResponse.json(payload)
  } catch (err) {
    console.error('❌ GET /api/products error:', err)
    return NextResponse.json(
      { message: 'Server error while fetching products' },
      { status: 500 }
    )
  }
}