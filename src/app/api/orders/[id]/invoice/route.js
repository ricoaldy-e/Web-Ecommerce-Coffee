import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import PDFDocument from "pdfkit"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req, { params }) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const id = Number(params.id)
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: { include: { product: true } },
      payment: true,
      user: { select: { id: true, email: true, role: true } },
    },
  })
  if (!order) {
    return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 })
  }

  // Hanya pemilik order atau ADMIN
  if (!(me.role === "ADMIN" || order.userId === me.id)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const doc = new PDFDocument()
  const chunks = []
  doc.on("data", chunks.push.bind(chunks))
  doc.on("end", () => {})

  doc.fontSize(18).text(`Invoice #${order.orderNo}`, { align: "center" })
  doc.moveDown()
  doc.text(`Tanggal: ${order.createdAt.toLocaleDateString()}`)
  doc.text(`Nama: ${order.address.recipient}`)
  doc.text(`Alamat: ${order.address.street}, ${order.address.city}`)
  doc.moveDown()

  order.items.forEach(it => {
    doc.text(`${it.product.name} × ${it.qty} = Rp ${(Number(it.price) * it.qty).toLocaleString()}`)
  })
  doc.moveDown()
  doc.text(`Total: Rp ${Number(order.total).toLocaleString()}`, { align: "right" })

  doc.end()

  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${order.orderNo}.pdf`,
    },
  })
}