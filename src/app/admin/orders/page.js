// src/app/admin/orders/page.js
"use client"

import { useEffect, useState, useRef, useCallback } from "react"

// Refactored: Toast component for non-blocking notifications
function Toasts({ toasts, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            "max-w-[22rem] rounded-lg shadow-lg px-3 py-2 text-sm border",
            t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
            </span>
            <div className="flex-1">{t.message}</div>
            <button
              className="ml-2 text-xs opacity-70 hover:opacity-100"
              onClick={() => onClose(t.id)}
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const ORDER_STATUSES = ["PROCESSED", "SHIPPED", "COMPLETED", "CANCELED"]
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED"]

// Added: Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-800"
    case "SHIPPED":
      return "bg-blue-100 text-blue-800"
    case "PROCESSED":
    case "PENDING":
      return "bg-amber-100 text-amber-800"
    case "CANCELED":
    case "FAILED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AdminOrdersPage() {
  const [list, setList] = useState([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("latest")

  // Added: Loading states
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null) // For per-item loading

  // Added: Toast notification state
  const [toasts, setToasts] = useState([])
  const toastSeq = useRef(1)
  const pushToast = useCallback((message, type = "info", ttl = 3500) => {
    const id = toastSeq.current++
    setToasts(s => [...s, { id, message, type }])
    if (ttl > 0) setTimeout(() => setToasts(s => s.filter(t => t.id !== id)), ttl)
  }, [])
  const closeToast = (id) => setToasts(s => s.filter(t => t.id !== id))

  const fetchAdminJSON = useCallback(async (url, init) => {
    const res = await fetch(url, { credentials: "include", cache: "no-store", ...(init || {}) })
    if (res.status === 401 || res.status === 403) {
      const msg = (await res.json().catch(() => ({})))?.message || "Unauthorized"
      pushToast(`❌ ${msg}. Login sebagai ADMIN.`, "error", 3000)
      setTimeout(() => { window.location.href = "/auth/login" }, 800)
      throw new Error("unauthorized")
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  }, [pushToast])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/admin/orders`
      const qs = []
      if (q) qs.push(`q=${encodeURIComponent(q)}`)
      if (status) qs.push(`status=${encodeURIComponent(status)}`)
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`)
      if (qs.length) url += `?${qs.join("&")}`
      const data = await fetchAdminJSON(url)
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      pushToast(`Gagal memuat pesanan: ${e.message}`, "error")
    } finally {
      setLoading(false)
    }
  }, [q, status, sort, fetchAdminJSON, pushToast])
  
  // Changed: Implement debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
        load();
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [q, status, sort, load])

  const setOrderStatus = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await fetchAdminJSON(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      // Update list locally for faster UI feedback
      setList(list => list.map(o => o.id === id ? { ...o, status: newStatus } : o))
      pushToast(`Status pesanan #${id} diubah ke ${newStatus}.`, "success")
    } catch (e2) {
      pushToast(`Gagal update status: ${e2.message}`, "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const setPaymentStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await fetchAdminJSON(`/api/admin/payments/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      // Update list locally
      setList(list => list.map(o => o.id === orderId ? { ...o, payment: { ...o.payment, status: newStatus } } : o))
      pushToast(`Status pembayaran #${orderId} diubah ke ${newStatus}.`, "success")
    } catch (e2) {
      pushToast(`Gagal update payment: ${e2.message}`, "error")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-6 space-y-6">
      <Toasts toasts={toasts} onClose={closeToast} />

      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold">Admin • Orders</h1>
      </div>

      {/* Filter Bar */}
      <div className="border border-amber-200 bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row flex-wrap gap-3 items-center">
          
          {/* Grup Input Pencarian dan Tombol Cari */}
          <div className="flex items-center w-full md:flex-1">
              <input
                  className="border border-amber-200 rounded-l-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 focus:z-10"
                  placeholder="Cari ID, Order No, Email, Penerima..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  // Bonus: Memungkinkan pencarian dengan menekan Enter
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          e.preventDefault();
                          load();
                      }
                  }}
              />
              {/* Tombol Cari yang Baru Ditambahkan */}
              <button
                  type="button"
                  onClick={load}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-r-lg border border-amber-700 -ml-px text-sm font-semibold"
                  aria-label="Cari pesanan"
              >
                  Cari
              </button>
          </div>

          <select
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 bg-white w-full md:w-auto"
              value={status}
              onChange={e => setStatus(e.target.value)}
          >
              <option value="">(Semua status pesanan)</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 bg-white w-full md:w-auto"
              value={sort}
              onChange={e => setSort(e.target.value)}
          >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Total Tertinggi</option>
              <option value="lowest">Total Terendah</option>
          </select>
      </div>
      
      {loading ? (
        <p className="text-amber-800 text-center py-10">Memuat pesanan...</p>
      ) : list.length === 0 ? (
        <p className="text-amber-800 text-center py-10 opacity-70">
          Tidak ada pesanan yang cocok dengan kriteria filter Anda.
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map(o => (
            <li
              key={o.id}
              className="border border-amber-200 bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-amber-900 break-words">
                    ID Pesanan: <span className="font-bold">#{o.id}</span>
                  </h2>
                  <div className="text-sm text-amber-800 opacity-90 space-y-0.5 break-words">
                    <p>Order No User: <span className="text-amber-900 font-medium">#{o.orderNo}</span></p>
                    <p>Tanggal: {new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: 'long', timeStyle: 'short' })}</p>
                    <p>Total: <span className="font-bold text-amber-900 text-base">Rp {Number(o.total).toLocaleString("id-ID")}</span></p>
                    <p>User: {o.user?.email}</p>
                    <p>Alamat: {o.address?.recipient} — {o.address?.city}, {o.address?.province}</p>
                  </div>
                </div>

                <div className="grid gap-2 w-full md:w-auto md:min-w-[180px] relative">
                  {updatingId === o.id && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
                      <svg className="animate-spin h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                  )}
                  <select
                    className={`border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${getStatusColor(o.status)}`}
                    value={o.status}
                    onChange={e => setOrderStatus(o.id, e.target.value)}
                    disabled={updatingId === o.id}
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select
                    className={`border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${getStatusColor(o.payment?.status || "PENDING")}`}
                    value={o.payment?.status || "PENDING"}
                    onChange={e => setPaymentStatus(o.id, e.target.value)}
                    disabled={updatingId === o.id}
                  >
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {o.payment?.method && o.payment.method !== "COD" && o.payment?.proofUrl && (
                <div className="mt-4 border-t border-amber-100 pt-4">
                  <div className="font-medium text-amber-900">
                    Bukti Pembayaran ({o.payment.method}):
                  </div>
                  <a href={o.payment.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                    <img
                      src={o.payment.proofUrl}
                      alt="Bukti pembayaran"
                      className="max-h-32 w-auto object-contain border border-amber-200 rounded-lg"
                    />
                  </a>
                </div>
              )}

              <div className="mt-4 border-t border-amber-100 pt-4">
                <div className="font-medium text-amber-900">Items:</div>
                <ul className="list-disc pl-5 text-sm text-amber-800 opacity-90 space-y-1 mt-2">
                  {o.items.map(it => (
                    <li key={it.id}>
                      <span className="font-medium text-amber-900">{it.product?.name || "(Produk Dihapus)"}</span> × {it.qty}
                      <span className="block text-xs">
                        Harga Satuan: Rp {Number(it.price).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}