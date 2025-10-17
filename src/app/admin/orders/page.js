"use client"

import { useEffect, useState } from "react"

const STAT = ["PROCESSED", "SHIPPED", "COMPLETED", "CANCELED"]

export default function AdminOrdersPage() {
  const [list, setList] = useState([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("latest")

  const fetchAdminJSON = async (url, init) => {
    const res = await fetch(url, { credentials: "include", cache: "no-store", ...(init || {}) })
    if (res.status === 401 || res.status === 403) {
      const msg = (await res.json().catch(() => ({})))?.message || "Unauthorized"
      alert("❌ " + msg + ". Login sebagai ADMIN.")
      window.location.href = "/auth/login"
      throw new Error("unauthorized")
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  }

  const load = async () => {
    try {
      let url = `/api/admin/orders`
      const qs = []
      if (q) qs.push(`q=${encodeURIComponent(q)}`)
      if (status) qs.push(`status=${encodeURIComponent(status)}`)
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`)
      if (qs.length) url += `?${qs.join("&")}`
      const data = await fetchAdminJSON(url)
      setList(Array.isArray(data) ? data : [])
    } catch {}
  }
  useEffect(() => { load() }, [q, status, sort])

  const setOrderStatus = async (id, status) => {
    try {
      await fetchAdminJSON(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      load()
    } catch (e2) {
      alert("Gagal update status: " + e2.message)
    }
  }

  const setPaymentStatus = async (orderId, status) => {
    try {
      await fetchAdminJSON(`/api/admin/payments/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      load()
    } catch (e2) {
      alert("Gagal update payment: " + e2.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Admin • Orders</h1>
      </div>

      {/* Filter Bar */}
      <div className="border border-amber-200 bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-3 items-center">
        <input
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
          placeholder="🔍 Cari orderNo/email/recipient..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 bg-white"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">(Semua status)</option>
          {STAT.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 bg-white"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="latest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="highest">Total Tertinggi</option>
          <option value="lowest">Total Terendah</option>
        </select>
      </div>

      {list.length === 0 && (
        <p className="text-amber-800 text-center py-10 opacity-70">
          Tidak ada pesanan ditemukan.
        </p>
      )}

      <ul className="space-y-4">
        {list.map(o => (
          <li
            key={o.id}
            className="border border-amber-200 bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-lg text-amber-900">
                  Order #{o.orderNo} •{" "}
                  <span className="text-amber-600">{o.status}</span>
                </div>
                <div className="text-sm text-amber-800 opacity-80">
                  Tanggal: {new Date(o.createdAt).toLocaleDateString("id-ID")} • Total:{" "}
                  <span className="font-medium text-amber-900">
                    Rp {Number(o.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="text-sm text-amber-800 opacity-80">
                  User: {o.user?.email}
                </div>
                <div className="text-sm text-amber-800 opacity-80">
                  Ship to: {o.address?.recipient} — {o.address?.city}, {o.address?.province}
                </div>
              </div>

              <div className="grid gap-2 w-full md:w-auto">
                <select
                  className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                  defaultValue={o.status}
                  onChange={e => setOrderStatus(o.id, e.target.value)}
                >
                  {STAT.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                  defaultValue={o.payment?.status || "PENDING"}
                  onChange={e => setPaymentStatus(o.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

            {/* Bukti Pembayaran */}
            {o.payment?.method && o.payment.method !== "COD" && o.payment?.proofUrl && (
              <div className="mt-4">
                <div className="font-medium text-amber-900">
                  Bukti Pembayaran ({o.payment.method}):
                </div>
                <a
                  href={o.payment.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2"
                >
                  <img
                    src={o.payment.proofUrl}
                    alt="Bukti pembayaran"
                    className="h-28 object-contain border border-amber-200 rounded-lg"
                  />
                </a>
              </div>
            )}

            {/* Items */}
            <div className="mt-4">
              <div className="font-medium text-amber-900">Items:</div>
              <ul className="list-disc pl-5 text-sm text-amber-800 opacity-90">
                {o.items.map(it => (
                  <li key={it.id}>
                    {it.product?.name} × {it.qty} • Rp{" "}
                    {(Number(it.price) * it.qty).toLocaleString("id-ID")}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
