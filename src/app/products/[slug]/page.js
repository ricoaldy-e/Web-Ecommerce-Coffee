"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, CreditCard } from "lucide-react"

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

  if (loading)
    return (
      <main className="p-10 text-center text-amber-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        Memuat produk...
      </main>
    )

  if (!product)
    return (
      <main className="p-10 text-center text-amber-700">
        Produk tidak ditemukan.
      </main>
    )

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 text-amber-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header + tombol kembali */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Gambar Produk */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-md overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <div className="relative w-full h-[420px]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center text-amber-400">
                Tidak ada gambar
              </div>
            )}
          </div>

          {/* Detail Produk */}
          <div>
            <p className="text-sm text-amber-700 mb-2">
              Kategori: {product.category?.name || "-"}
            </p>
            <p className="text-3xl font-bold text-amber-900">
              Rp {price.toLocaleString("id-ID")}
            </p>

            <p className="mt-2 text-sm">
              Status:{" "}
              <b className={soldOut ? "text-red-600" : "text-green-700"}>
                {statusText}
              </b>{" "}
              • <span className="ml-2">Stok: {product.stock}</span>
            </p>

            {product.description && (
              <div className="mt-4 text-amber-800 whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50"
                  onClick={dec}
                  disabled={qty <= 1 || soldOut}
                >
                  −
                </button>
                <div className="w-14 text-center border border-amber-300 rounded-lg bg-white text-amber-900 py-1 font-semibold">
                  {qty}
                </div>
                <button
                  className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50"
                  onClick={inc}
                  disabled={qty >= (product.stock ?? 1) || soldOut}
                >
                  +
                </button>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <button
                  onClick={addToCart}
                  disabled={soldOut}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={buyNow}
                  disabled={soldOut}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-semibold transition disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  Beli Sekarang
                </button>
              </div>

              {soldOut && (
                <p className="mt-2 text-sm text-red-600">Stok habis.</p>
              )}
            </div>

            {/* Informasi Produk */}
            <div className="mt-8 border-t border-amber-200 pt-4 text-sm">
              <div className="font-semibold mb-2">Informasi Produk</div>
              <ul className="grid gap-1 text-amber-800">
                <li>
                  <span className="text-amber-700">ID Produk:</span> {product.id}
                </li>
                <li>
                  <span className="text-amber-700">Slug:</span> {product.slug}
                </li>
                <li>
                  <span className="text-amber-700">Kategori:</span>{" "}
                  {product.category?.name || "-"}
                </li>
                <li>
                  <span className="text-amber-700">Status:</span>{" "}
                  {product.isActive === false ? "Nonaktif" : "Aktif"}
                </li>
                <li>
                  <span className="text-amber-700">Dibuat:</span>{" "}
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleString("id-ID")
                    : "-"}
                </li>
                <li>
                  <span className="text-amber-700">Diperbarui:</span>{" "}
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleString("id-ID")
                    : "-"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
