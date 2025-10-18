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

  // Ambil semua order pada rentang
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) } },
    include: { items: true },
  })

  // Ringkasan
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const aov = totalOrders ? totalRevenue / totalOrders : 0

  // Per hari
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

  // ======== Hasil Penjualan Produk (SEMUA produk) ========
  // Agregasi qty per productId dari order items di rentang
  const agg = await prisma.orderItem.groupBy({
    where: { order: { is: { createdAt: { gte: start, lt: new Date(end.getTime() + 24 * 60 * 60 * 1000) } } } },
    by: ["productId"],
    _sum: { qty: true },
  })
  const qtyByProductId = new Map(agg.map(a => [a.productId, a._sum.qty || 0]))

  // Ambil semua produk (aktif saja, atau kalau mau semua hapus filter isActive)
  const products = await prisma.product.findMany({
    where: {}, // { isActive: true } // kalau mau hanya yang aktif, uncomment ini
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const productSales = products
    .map(p => ({
      productId: p.id,
      name: p.name,
      qty: Number(qtyByProductId.get(p.id) || 0),
    }))
    .sort((a, b) => b.qty - a.qty)

  // Statistik pembayaran
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
    // topProducts: (tetap disediakan jika front-end lama masih pakai, tapi tidak dipakai di UI baru)
    topProducts: productSales.slice(0, 5),
    // UI baru pakai ini:
    productSales,
    payments: { byMethod, byStatus },
  })
}