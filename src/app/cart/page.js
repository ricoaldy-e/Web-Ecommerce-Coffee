// src/app/cart/page.js
"use client"

import { useEffect, useState } from "react"

export default function CartPage() {
  const [items, setItems] = useState([])

  const loadCart = () => {
    fetch("/api/cart", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    loadCart()
  }, [])

  const total = items.reduce(
    (sum, it) => sum + Number(it.product.price) * it.qty,
    0
  )

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Keranjang kosong.")
      return
    }
    window.location.href = "/checkout/confirm"
  }

  const handleDeleteItem = async (productId) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok) setItems(data.items || [])
      else alert("❌ Gagal menghapus item: " + (data.message || res.status))
    } catch {
      alert("❌ Gagal menghapus item")
    }
  }

  const clamp = (n) => Math.max(1, Math.floor(n))

  const updateQty = async (it, nextQty) => {
    const q = clamp(nextQty)
    if (q === it.qty) return
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: it.productId, qty: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert("❌ Gagal update qty: " + (data.message || res.status))
        return
      }
      setItems(data.items || [])
    } catch {
      alert("❌ Gagal update qty")
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>

      {items.length === 0 && <p>Keranjang masih kosong.</p>}
      {items.map(it => (
        <div key={it.id} className="flex items-center justify-between border-b py-2">
          <div>
            <div className="font-medium">{it.product.name}</div>
            <div className="text-sm opacity-70">Harga: Rp {Number(it.product.price).toLocaleString()}</div>

            {/* Stepper qty */}
            <div className="mt-2 flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                aria-label="Kurangi qty"
                disabled={it.qty <= 1}
                onClick={() => updateQty(it, it.qty - 1)}
              >
                −
              </button>
              <div className="w-14 text-center border rounded py-1 select-none">
                {it.qty}
              </div>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                aria-label="Tambah qty"
                disabled={it.qty >= it.product.stock}
                onClick={() => updateQty(it, it.qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>Rp {(Number(it.product.price) * it.qty).toLocaleString()}</div>
            <button
              onClick={() => handleDeleteItem(it.productId)}
              className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
              title="Hapus item"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      <div className="mt-4 font-semibold">
        Subtotal: Rp {total.toLocaleString()}
      </div>

      {items.length > 0 && (
        <button
          onClick={handleCheckout}
          className="mt-3 px-3 py-2 bg-green-600 text-white rounded"
        >
          Lanjut ke Konfirmasi
        </button>
      )}
    </main>
  )
}