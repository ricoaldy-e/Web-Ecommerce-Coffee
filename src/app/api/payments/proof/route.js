import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/currentUser"
import { prisma } from "@/lib/prisma"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const DRIVER = process.env.STORAGE_DRIVER || "local"
const UPLOADS_DIR = process.env.UPLOADS_DIR || "public/uploads"
const PUBLIC_BASE = process.env.UPLOADS_PUBLIC_BASE || "/uploads"

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB ?? 5)
const MAX_SIZE = Math.max(1, MAX_UPLOAD_MB) * 1024 * 1024

const ALLOWED_UPLOAD_TYPES = String(
  process.env.ALLOWED_UPLOAD_TYPES ||
    "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
)
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

function extFromMime(mime) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/gif":  "gif",
    "image/heic": "heic",
    "image/heif": "heif",
  }
  return map[(mime || "").toLowerCase()] || "dat"
}
function randomName(ext) {
  return `proof_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`
}
function publicUrlToFsPath(url) {
  const u = String(url || "")
  if (!u.startsWith(PUBLIC_BASE + "/")) return null
  const rel = u.slice(PUBLIC_BASE.length + 1)
  const safeRel = rel.replace(/\.\.[/\\]/g, "")
  return path.join(process.cwd(), UPLOADS_DIR, safeRel)
}

async function assertUser() {
  const me = await getCurrentUser()
  if (!me) return [null, NextResponse.json({ message: "Unauthorized" }, { status: 401 })]
  if (me.role !== "USER") return [null, NextResponse.json({ message: "Only USER can upload proof" }, { status: 403 })]
  return [me, null]
}

export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  if (DRIVER !== "local") {
    return NextResponse.json(
      { message: "Unsupported driver for this route (use STORAGE_DRIVER=local in dev)" },
      { status: 501 }
    )
  }

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ message: "Invalid form" }, { status: 400 })

  const orderId = Number(form.get("orderId"))
  const file = form.get("file")

  if (!orderId || Number.isNaN(orderId)) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 })
  }
  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "file required" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true }
  })
  if (!order || order.userId !== me.id) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 })
  }

  const mime = String(file.type || "").toLowerCase()
  if (!ALLOWED_UPLOAD_TYPES.includes(mime)) {
    return NextResponse.json({ message: "Tipe file tidak diizinkan" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { message: `File terlalu besar (maks ${MAX_UPLOAD_MB}MB)` },
      { status: 400 }
    )
  }

  const absUploadDir = path.join(process.cwd(), UPLOADS_DIR)
  await fs.mkdir(absUploadDir, { recursive: true })

  const ext = extFromMime(mime)
  const filename = randomName(ext)
  const filepath = path.join(absUploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buffer, { mode: 0o644 })

  const url = `${PUBLIC_BASE}/${filename}`
  return NextResponse.json({ url }, { status: 201 })
}

export async function DELETE(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  if (DRIVER !== "local") {
    return NextResponse.json(
      { message: "Unsupported driver for this route (use STORAGE_DRIVER=local in dev)" },
      { status: 501 }
    )
  }

  const { searchParams } = new URL(req.url)
  const orderId = Number(searchParams.get("orderId"))
  if (!orderId || Number.isNaN(orderId)) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true }
  })
  if (!order || order.userId !== me.id) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 })
  }

  const pay = await prisma.payment.findUnique({
    where: { orderId },
    select: { proofUrl: true }
  })
  if (!pay?.proofUrl) {
    return NextResponse.json({ message: "No proof to delete" }, { status: 404 })
  }

  const fsPath = publicUrlToFsPath(pay.proofUrl)
  if (fsPath) {
    try { await fs.unlink(fsPath) } catch {}
  }

  await prisma.payment.update({
    where: { orderId },
    data: { proofUrl: null }
  }).catch(() => null)

  return NextResponse.json({ message: "Deleted" })
}