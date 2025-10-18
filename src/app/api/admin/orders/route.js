// src/app/api/admin/orders/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = (searchParams.get("status") || "").trim()
  const q = (searchParams.get("q") || "").trim()
  const sort = (searchParams.get("sort") || "latest").toLowerCase()

  // urutan default: terbaru
  let orderBy = [{ createdAt: "desc" }]
  if (sort === "oldest") orderBy = [{ createdAt: "asc" }]
  else if (sort === "highest") orderBy = [{ total: "desc" }, { createdAt: "desc" }]
  else if (sort === "lowest") orderBy = [{ total: "asc" }, { createdAt: "desc" }]

  // jika q angka → cocokkan ke id (global) dan orderNo (per user)
  const numQ = Number(q)
  const isNum = Number.isFinite(numQ)

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            ...(isNum ? [{ id: numQ }] : []),         // 🔹 nomor global
            ...(isNum ? [{ orderNo: numQ }] : []),    // 🔹 nomor per-user
            { user: { is: { email: { contains: q } } } },
            { address: { is: { recipient: { contains: q } } } },
          ],
        }
      : {}),
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, email: true } },
      address: true,
      items: { include: { product: true } },
      payment: true,
    },
    orderBy,
  })

  return NextResponse.json(orders)
}