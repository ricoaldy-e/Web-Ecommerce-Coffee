// src/app/products/page.js
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState("")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [qtyById, setQtyById] = useState({})

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        setLoading(true)
        let url = `/api/products?q=${encodeURIComponent(query)}`
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error("Gagal ambil produk")
        const data = await res.json()
        setProducts(data)
        setQtyById(prev => {
          const next = { ...prev }
          for (const p of data) if (!next[p.id]) next[p.id] = 1
          return next
        })
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [query, selectedCategory])

  const clampQty = (stock, value) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return 1
    return Math.max(1, Math.min(stock ?? 1, n))
  }
  const setQty = (id, stock, value) => {
    setQtyById(prev => ({ ...prev, [id]: clampQty(stock, value) }))
  }

  async function requireLogin(nextUrl) {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        alert("❌ Login terlebih dahulu.")
        window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`
        return false
      }
      return true
    } catch {
      window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`
      return false
    }
  }

  const addToCart = async (productId, qty) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      })
      if (res.status === 401) {
        alert("❌ Login terlebih dahulu untuk menambahkan produk")
        window.location.href = "/auth/login"
        return false
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("❌ " + (err.message || res.status))
        return false
      }
      window.dispatchEvent(new Event("auth:changed"))
      return true
    } catch {
      alert("❌ Gagal menambahkan produk")
      return false
    }
  }

  const handleBuyNow = async (p) => {
    if (p.stock <= 0) return
    const qty = clampQty(p.stock, qtyById[p.id] ?? 1)

    // Simpan item buy now (harga asli)
    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: p.id,
        qty,
        name: p.name,
        price: Number(p.price)
      }))
    } catch {}

    const nextUrl = "/checkout/confirm?buynow=1"
    const ok = await requireLogin(nextUrl)
    if (!ok) return
    window.location.href = nextUrl
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Produk</h1>

      <input
        type="text"
        placeholder="Cari produk..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-3 py-2 mb-4 w-full"
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border px-3 py-2 mb-6 w-full"
      >
        <option value="">Semua Kategori</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.slug}>{cat.name}</option>
        ))}
      </select>

      {loading && <p>⏳ Memuat produk...</p>}
      {!loading && products.length === 0 && <p>Tidak ada produk.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => {
          const qty = clampQty(p.stock, qtyById[p.id] ?? 1)
          const soldOut = p.stock <= 0
          const price = Number(p.price || 0)

          return (
            <li key={p.id} className={`border p-4 rounded flex flex-col ${soldOut ? "opacity-70" : ""}`}>
              {p.imageUrl ? (
                <Link href={`/products/${p.slug}`} className="mb-3">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-contain border rounded bg-white" />
                </Link>
              ) : (
                <Link href={`/products/${p.slug}`} className="mb-3">
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center border rounded text-gray-500">
                    Tidak ada gambar
                  </div>
                </Link>
              )}

              <Link href={`/products/${p.slug}`} className="font-semibold hover:underline">
                {p.name}
              </Link>

              <div className="mt-1 text-xl font-bold">Rp {price.toLocaleString("id-ID")}</div>
              <div className="text-sm opacity-70 mt-1">Stok: {p.stock}</div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangi qty"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={qty <= 1 || soldOut}
                  onClick={() => setQty(p.id, p.stock, qty - 1)}
                >−</button>

                <div className="min-w-[56px] px-2 py-1 text-center border rounded bg-white text-black select-none">
                  {qty}
                </div>

                <button
                  type="button"
                  aria-label="Tambah qty"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={qty >= p.stock || soldOut}
                  onClick={() => setQty(p.id, p.stock, qty + 1)}
                >+</button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  disabled={soldOut}
                  onClick={async () => {
                    if (soldOut) return
                    const ok = await addToCart(p.id, qty)
                    if (ok) alert("✅ Ditambahkan ke keranjang")
                  }}
                  className={`px-3 py-2 rounded text-white ${!soldOut ? "bg-black hover:opacity-90" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  Tambah ke Keranjang
                </button>

                <button
                  disabled={soldOut}
                  onClick={() => handleBuyNow(p)}
                  className={`px-3 py-2 rounded text-white ${!soldOut ? "bg-green-600 hover:opacity-90" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  Beli Sekarang
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}