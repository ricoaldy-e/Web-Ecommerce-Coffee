// src/app/api/admin/analytics/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function fmtDate(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, "0")
  const dd = String(x.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export async function GET(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  let days = Number(searchParams.get("days") || 14)
  if (!Number.isFinite(days)) days = 14
  days = Math.min(60, Math.max(7, Math.floor(days)))

  const end = startOfDay(new Date())
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))

  // ambil semua order pada rentang
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) } },
    include: { items: true },
  })

  // ringkasan
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const aov = totalOrders ? totalRevenue / totalOrders : 0

  // per hari
  const perDayMap = new Map()
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    perDayMap.set(fmtDate(d), { date: fmtDate(d), orders: 0, revenue: 0 })
  }
  for (const o of orders) {
    const key = fmtDate(o.createdAt)
    const row = perDayMap.get(key)
    if (row) {
      row.orders += 1
      row.revenue += Number(o.total)
    }
  }
  const perDay = Array.from(perDayMap.values())

  // top produk (qty) di rentang
  const items = await prisma.orderItem.findMany({
    where: { order: { is: { createdAt: { gte: start, lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) } } } },
    include: { product: true },
  })
  const qtyMap = new Map()
  for (const it of items) {
    const key = it.productId
    const cur = qtyMap.get(key) || { productId: key, name: it.product?.name || `#${key}`, qty: 0 }
    cur.qty += it.qty
    qtyMap.set(key, cur)
  }
  const topProducts = Array.from(qtyMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5)

  // statistik pembayaran
  const pays = await prisma.payment.findMany({
    where: { createdAt: { gte: start, lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) } },
    select: { method: true, status: true },
  })
  const byMethod = { COD: 0, BANK_TRANSFER: 0, EWALLET: 0 }
  const byStatus = { PENDING: 0, SUCCESS: 0, FAILED: 0 }
  for (const p of pays) {
    if (p.method in byMethod) byMethod[p.method]++
    if (p.status in byStatus) byStatus[p.status]++
  }

  return NextResponse.json({
    range: { days, startISO: start.toISOString(), endISO: end.toISOString() },
    totals: { totalOrders, totalRevenue, avgOrderValue: aov },
    perDay,
    topProducts,
    payments: { byMethod, byStatus },
  })
}