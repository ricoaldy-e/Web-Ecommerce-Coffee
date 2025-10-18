// src/app/cart/page.js
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, CheckSquare, Square } from "lucide-react"

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])

  const loadCart = () => {
    fetch("/api/cart", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCart()
  }, [])

  // Hitung total hanya dari item yang dipilih
  const total = selectedItems.reduce((sum, id) => {
    const item = items.find(i => i.productId === id)
    return item ? sum + Number(item.product.price) * item.qty : sum
  }, 0)

  const allSelected = selectedItems.length === items.length && items.length > 0

  const toggleSelectAll = () => {
    if (allSelected) setSelectedItems([])
    else setSelectedItems(items.map(it => it.productId))
  }

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Pilih produk yang ingin Anda checkout terlebih dahulu.")
      return
    }

    const checkoutData = items.filter(it => selectedItems.includes(it.productId))
    sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutData))
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
      if (res.ok) {
        setItems(data.items || [])
        setSelectedItems(prev => prev.filter(id => id !== productId))
      } else {
        alert("❌ Gagal menghapus item: " + (data.message || res.status))
      }
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Keranjang Belanja
          </h1>
          <p className="text-amber-100">Pilih produk yang ingin Anda checkout</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-amber-700 mt-4">Memuat keranjang...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Keranjang Kosong</h3>
            <p className="text-amber-600 mb-6">Tambahkan beberapa produk kopi favorit Anda!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden">
                {/* Header Pilih Semua */}
                <div className="flex items-center justify-between p-6 border-b border-amber-200">
                  <h2 className="text-xl font-bold text-amber-900 flex items-center gap-3">
                    {allSelected ? (
                      <CheckSquare
                        className="w-5 h-5 cursor-pointer text-amber-700"
                        onClick={toggleSelectAll}
                      />
                    ) : (
                      <Square
                        className="w-5 h-5 cursor-pointer text-amber-700"
                        onClick={toggleSelectAll}
                      />
                    )}
                    Pilih Semua ({items.length} produk)
                  </h2>
                </div>

                <div className="divide-y divide-amber-100">
                  {items.map(it => (
                    <div
                      key={it.id}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {selectedItems.includes(it.productId) ? (
                          <CheckSquare
                            className="w-5 h-5 text-amber-700 cursor-pointer"
                            onClick={() => toggleSelectItem(it.productId)}
                          />
                        ) : (
                          <Square
                            className="w-5 h-5 text-amber-700 cursor-pointer"
                            onClick={() => toggleSelectItem(it.productId)}
                          />
                        )}

                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-amber-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {it.product.imageUrl ? (
                              <Image
                                src={it.product.imageUrl}
                                alt={it.product.name}
                                width={64}
                                height={64}
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-amber-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="font-semibold text-amber-900 text-base">{it.product.name}</div>
                            <div className="text-sm text-amber-700 mt-1">
                              Rp {Number(it.product.price).toLocaleString("id-ID")}
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                              <button
                                className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={it.qty <= 1}
                                onClick={() => updateQty(it, it.qty - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="w-12 text-center font-semibold text-amber-900 border border-amber-300 rounded-lg py-1 bg-white">
                                {it.qty}
                              </div>
                              <button
                                className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={it.qty >= it.product.stock}
                                onClick={() => updateQty(it, it.qty + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="text-right">
                          <div className="font-bold text-lg text-amber-700">
                            Rp {(Number(it.product.price) * it.qty).toLocaleString("id-ID")}
                          </div>
                          <div className="text-sm text-amber-600">
                            {it.qty} × Rp {Number(it.product.price).toLocaleString("id-ID")}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(it.productId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-amber-200 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Ringkasan Pesanan</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-amber-800">
                    <span>Dipilih ({selectedItems.length} items)</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Pengiriman</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t border-amber-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-amber-900">
                      <span>Total</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2 ${
                    selectedItems.length > 0
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-amber-600 text-center mt-4">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
