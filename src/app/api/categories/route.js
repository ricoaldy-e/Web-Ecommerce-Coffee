import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ categories: rows })
  } catch (err) {
    console.error("❌ Error fetching categories:", err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}