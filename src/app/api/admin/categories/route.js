// src/app/api/admin/categories/route.js
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

export async function GET(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const includeDeleted = searchParams.get("includeDeleted") === "1"

  const categories = await prisma.category.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: [{ deletedAt: "asc" }, { name: "asc" }],
  })
  return NextResponse.json(categories)
}

export async function POST(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { name, slug } = await req.json().catch(() => ({}))
  if (!name) return NextResponse.json({ message: "name required" }, { status: 400 })

  const created = await prisma.category.create({
    data: { name, slug: slug?.trim() || slugify(name) },
  })
  return NextResponse.json(created, { status: 201 })
}