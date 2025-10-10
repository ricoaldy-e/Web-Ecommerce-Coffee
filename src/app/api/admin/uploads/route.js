// src/app/api/admin/uploads/route.js
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/currentUser"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// === Env config (LOCAL DEV) ===
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
  .map((s) => s.trim().toLowerCase())
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
  return `product_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`
}

// POST /api/admin/uploads
// FormData: file
// → Simpan file ke /public/uploads/products dan kembalikan { url }
export async function POST(req) {
  const me = await getCurrentUser()
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  if (DRIVER !== "local") {
    return NextResponse.json(
      { message: "Unsupported driver (use STORAGE_DRIVER=local in dev)" },
      { status: 501 }
    )
  }

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ message: "Invalid form" }, { status: 400 })

  const file = form.get("file")
  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "file required" }, { status: 400 })
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

  const productsDir = path.join(process.cwd(), UPLOADS_DIR, "products")
  await fs.mkdir(productsDir, { recursive: true })

  const ext = extFromMime(mime)
  const filename = randomName(ext)
  const filepath = path.join(productsDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buffer, { mode: 0o644 })

  const url = `${PUBLIC_BASE}/products/${filename}`

  return NextResponse.json({ url }, { status: 201 })
}
