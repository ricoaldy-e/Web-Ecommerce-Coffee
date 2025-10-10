// src/app/api/products/[slug]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req, { params }) {
  const slug = params.slug
  if (!slug) return NextResponse.json({ message: "Invalid slug" }, { status: 400 })

  const p = await prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: { category: true },
  })
  if (!p) return NextResponse.json({ message: "Not found" }, { status: 404 })

  return NextResponse.json(p)
}