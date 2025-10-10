// src/app/api/admin/payments/[orderId]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const ALLOWED = new Set(["PENDING", "SUCCESS", "FAILED"])

// PATCH /api/admin/payments/:orderId → ubah status pembayaran
export async function PATCH(req, { params }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const orderId = Number(params.orderId)
  if (!orderId) return NextResponse.json({ message: "Invalid orderId" }, { status: 400 })

  const { status } = await req.json().catch(() => ({}))
  if (!ALLOWED.has(String(status))) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 })

  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: { status },
    // Kalau payment belum ada, buat minimal method "COD" + status admin
    create: { orderId, method: "COD", status },
  })

  return NextResponse.json(payment)
}