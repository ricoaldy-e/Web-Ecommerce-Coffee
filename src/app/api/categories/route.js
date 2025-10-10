import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (err) {
    console.error("❌ Error fetching categories:", err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}