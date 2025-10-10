// src/lib/storage.js
import path from "path"
import fs from "fs/promises"

const DRIVER = (process.env.STORAGE_DRIVER || "local").toLowerCase()

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "image/heic": "heic",
  "image/heif": "heif",
}

function getExtFromMime(mime) {
  return EXT_BY_MIME[mime] || "dat"
}

function yyyymm(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return { y, m }
}

function rand(n = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let s = ""
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/**
 * Simpan bukti pembayaran (gambar) dan kembalikan URL publiknya.
 * @param {{ userId:number, orderId:number, buffer:Buffer, mime:string }} args
 * @returns {Promise<string>} url
 */
export async function saveProofImage({ userId, orderId, buffer, mime }) {
  const { y, m } = yyyymm()
  const ext = getExtFromMime(mime)
  const filename = `${Date.now()}-${orderId}-${rand(6)}.${ext}`

  if (DRIVER === "vercel-blob") {
    // Pastikan @vercel/blob terpasang & BLOB_READ_WRITE_TOKEN ada di env
    const { put } = await import("@vercel/blob")
    const key = `proofs/${y}/${m}/${filename}`
    const { url } = await put(key, buffer, {
      access: "public",              // supaya bisa ditampilkan di invoice
      contentType: mime || "application/octet-stream",
      addRandomSuffix: false,        // kita sudah pakai nama unik sendiri
    })
    return url // contoh: https://<blob-url>/proofs/2025/09/xxx.jpg
  }

  // default: local filesystem di public/uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs", String(y), String(m))
  await fs.mkdir(uploadDir, { recursive: true })
  const filepath = path.join(uploadDir, filename)
  await fs.writeFile(filepath, buffer)
  // URL publik (Next melayani isi /public sebagai root)
  return `/uploads/proofs/${y}/${m}/${filename}`
}