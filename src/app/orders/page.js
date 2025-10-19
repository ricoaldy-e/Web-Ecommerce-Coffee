"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"

const COURIER_LABEL = {
  JNE: "JNE Reguler",
  JNT: "J&T Express",
  SICEPAT: "SiCepat Reguler",
}

function StatusBadge({ status }) {
  const map = {
    PROCESSED: "bg-amber-100 text-amber-800 border-amber-200",
    SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELED: "bg-red-100 text-red-800 border-red-200",
  }
  const cls = map[status] || "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

function SkeletonCard() {
  return (
    <li className="border border-amber-200 bg-white rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="h-5 w-40 bg-amber-100 rounded mb-3" />
      <div className="h-4 w-56 bg-amber-100 rounded mb-2" />
      <div className="h-4 w-72 bg-amber-100 rounded mb-2" />
      <div className="h-4 w-64 bg-amber-100 rounded mb-4" />
      <div className="h-8 w-28 bg-amber-200/70 rounded" />
    </li>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setErr("")
        const res = await fetch("/api/orders", { credentials: "include", cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        setErr(e.message || "Gagal memuat pesanan")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hasOrders = useMemo(() => orders.length > 0, [orders])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl shadow-lg px-5 py-4">
          <h1 className="text-2xl font-bold">Pesanan Saya</h1>
          <p className="text-amber-100/90 text-sm">Lihat riwayat pembelian dan unduh invoice kamu.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Error */}
        {err && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Gagal memuat: {err}</p>
              <button
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => location.reload()}
              >
                Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </ul>
        )}

        {/* Empty state */}
        {!loading && !hasOrders && !err && (
          <div className="text-center border border-amber-200 bg-white rounded-2xl p-10 shadow-sm">
            <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-3xl">☕</span>
            </div>
            <h2 className="text-amber-900 font-semibold text-lg mb-1">Belum ada pesanan</h2>
            <p className="text-amber-800 mb-4">Yuk mulai belanja kopi favoritmu!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 shadow"
            >
              Jelajahi Produk
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && hasOrders && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []
              const first = items[0]
              const more = Math.max(0, items.length - 1)
              const shipping = COURIER_LABEL[order.shippingMethod] || order.shippingMethod
              const address = order.address

              return (
                <li
                  key={order.id}
                  className="group border border-amber-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-amber-700">
                        No. Pesanan <span className="font-semibold text-amber-900">#{order.orderNo}</span>
                      </div>
                      <div className="text-xs text-amber-700/90">
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Items */}
                  <div className="mt-3 text-sm text-amber-900">
                    {items.length === 0 ? (
                      <div className="italic text-amber-700">Tidak ada item.</div>
                    ) : (
                      <>
                        <div className="font-medium">
                          {first?.product?.name || "Produk"}
                          {more > 0 && <span className="text-amber-700"> +{more} produk lain</span>}
                        </div>
                        <ul className="mt-1 text-amber-800 space-y-0.5">
                          {items.slice(0, 3).map((it) => (
                            <li key={it.id} className="flex justify-between">
                              <span className="truncate pr-2">
                                {it.product?.name || "Produk tidak ditemukan"} × {it.qty}
                              </span>
                              <span>Rp {(Number(it.price) * Number(it.qty)).toLocaleString("id-ID")}</span>
                            </li>
                          ))}
                          {items.length > 3 && (
                            <li className="text-xs text-amber-700">dan {items.length - 3} item lainnya…</li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>

                  {/* Address & shipping */}
                  {address && (
                    <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 p-2.5">
                      <div className="text-xs text-amber-700">
                        <span className="font-semibold text-amber-900">{address.recipient}</span>{" "}
                        ({address.phone})
                      </div>
                      <div className="text-xs text-amber-700 truncate">
                        {address.street}, {address.city}, {address.province} {address.postalCode}
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Kurir: <span className="font-medium text-amber-900">{shipping}</span> • Ongkir:{" "}
                        <span className="font-medium text-amber-900">
                          Rp {Number(order.shippingCost).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-amber-700">Total:</span>{" "}
                      <span className="text-amber-900 font-semibold">
                        Rp {Number(order.total).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 shadow"
                    >
                      Lihat Invoice
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}