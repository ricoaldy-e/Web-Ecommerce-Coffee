// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const ALLOWED = new Set(["PROCESSED", "SHIPPED", "COMPLETED", "CANCELED"])

// PATCH /api/admin/orders/:id → ubah status order
export async function PATCH(req, { params }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: "Invalid id" }, { status: 400 })

  const { status } = await req.json().catch(() => ({}))
  if (!ALLOWED.has(String(status))) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 })
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ message: "Update failed" }, { status: 400 })
  }
}