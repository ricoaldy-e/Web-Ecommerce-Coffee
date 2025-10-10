// src/app/products/[slug]/page.js
"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function ProductDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(p => {
        if (!p?.id) throw new Error("not found")
        setProduct(p)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  const clampQty = (stock, value) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return 1
    return Math.max(1, Math.min(stock ?? 1, n))
  }
  const inc = () => setQty(q => clampQty(product?.stock ?? 1, q + 1))
  const dec = () => setQty(q => clampQty(product?.stock ?? 1, q - 1))

  const price = useMemo(() => Number(product?.price || 0), [product])
  const soldOut = (product?.stock ?? 0) <= 0
  const statusText = product?.isActive === false ? "Nonaktif" : (soldOut ? "Stok Habis" : "Tersedia")

  async function addToCart() {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty }),
      })
      if (res.status === 401) {
        alert("❌ Silakan login dulu untuk menambahkan keranjang.")
        const next = `/products/${encodeURIComponent(slug)}`
        router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("❌ Gagal menambahkan: " + (err.message || res.status))
        return
      }
      alert("✅ Ditambahkan ke keranjang")
      window.dispatchEvent(new Event("auth:changed"))
    } catch {
      alert("❌ Gagal menambahkan")
    }
  }

  async function buyNow() {
    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: product.id,
        qty,
        name: product.name,
        price: price,
      }))
    } catch {}

    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        alert("❌ Silakan login dulu untuk melanjutkan.")
        const next = "/checkout/confirm?buynow=1"
        window.location.href = `/auth/login?next=${encodeURIComponent(next)}`
        return
      }
    } catch {
      const next = "/checkout/confirm?buynow=1"
      window.location.href = `/auth/login?next=${encodeURIComponent(next)}`
      return
    }
    window.location.href = "/checkout/confirm?buynow=1"
  }

  if (loading) return <main className="p-6">Memuat produk...</main>
  if (!product) return <main className="p-6">Produk tidak ditemukan.</main>

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Header + tombol kembali */}
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <button
          onClick={() => router.back()}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full max-h-[520px] object-contain border rounded bg-white"
            />
          ) : (
            <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-500 border rounded">
              Tidak ada gambar
            </div>
          )}
        </div>

        <div>
          <div className="mt-1 text-sm text-gray-600">Kategori: {product.category?.name || "-"}</div>

          <div className="mt-3">
            <div className="text-2xl font-bold">Rp {price.toLocaleString("id-ID")}</div>
          </div>

          <div className="mt-2 text-sm">
            Status: <b className={soldOut ? "text-red-600" : "text-green-700"}>{statusText}</b> •
            <span className="ml-2">Stok: {product.stock}</span>
          </div>

          {product.description && (
            <div className="mt-4 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={dec} disabled={qty <= 1 || soldOut}>−</button>
              <div className="min-w-[56px] px-2 py-1 text-center border rounded bg-white text-black select-none">{qty}</div>
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={inc} disabled={qty >= (product.stock ?? 1) || soldOut}>+</button>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <button className="px-3 py-2 rounded text-white disabled:opacity-50" style={{ backgroundColor: "#111827" }} disabled={soldOut} onClick={addToCart}>
                Tambah ke Keranjang
              </button>
              <button className="px-3 py-2 rounded text-white disabled:opacity-50" style={{ backgroundColor: "#047857" }} disabled={soldOut} onClick={buyNow}>
                Beli Sekarang
              </button>
            </div>

            {soldOut && <p className="mt-2 text-sm text-red-600">Stok habis.</p>}
          </div>

          {/* Informasi produk yang relevan */}
          <div className="mt-8 border-t pt-4 text-sm">
            <div className="font-semibold mb-2">Informasi Produk</div>
            <ul className="grid gap-1">
              <li><span className="text-gray-600">ID Produk:</span> {product.id}</li>
              <li><span className="text-gray-600">Slug:</span> {product.slug}</li>
              <li><span className="text-gray-600">Kategori:</span> {product.category?.name || "-"}</li>
              <li><span className="text-gray-600">Status:</span> {product.isActive === false ? "Nonaktif" : "Aktif"}</li>
              <li><span className="text-gray-600">Dibuat:</span> {product.createdAt ? new Date(product.createdAt).toLocaleString("id-ID") : "-"}</li>
              <li><span className="text-gray-600">Diperbarui:</span> {product.updatedAt ? new Date(product.updatedAt).toLocaleString("id-ID") : "-"}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}