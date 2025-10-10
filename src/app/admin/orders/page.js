// src/app/admin/orders/page.js
"use client"

import { useEffect, useState } from "react"

const STAT = ["PROCESSED","SHIPPED","COMPLETED","CANCELED"]

export default function AdminOrdersPage() {
  const [list, setList] = useState([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("latest") // latest|oldest|highest|lowest

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
    <main>
      <h1 className="text-2xl font-bold mb-4">Admin • Orders</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <input className="border px-2 py-1" placeholder="Cari orderNo/email/recipient..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="border px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">(Semua status)</option>
          {STAT.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border px-2 py-1" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="latest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="highest">Total Tertinggi</option>
          <option value="lowest">Total Terendah</option>
        </select>
      </div>

      {list.length === 0 && <p>Tidak ada pesanan.</p>}

      <ul className="space-y-3">
        {list.map(o => (
          <li key={o.id} className="border p-3 rounded">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="font-semibold">Order #{o.orderNo} • {o.status}</div>
                <div className="text-sm">Tanggal: {new Date(o.createdAt).toLocaleDateString("id-ID")} • Total: Rp {Number(o.total).toLocaleString("id-ID")}</div>
                <div className="text-sm">User: {o.user?.email}</div>
                <div className="text-sm">Ship to: {o.address?.recipient} — {o.address?.city}, {o.address?.province}</div>
              </div>
              <div className="grid gap-2">
                <select className="border px-2 py-1" defaultValue={o.status} onChange={e => setOrderStatus(o.id, e.target.value)}>
                  {STAT.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  className="border px-2 py-1"
                  defaultValue={o.payment?.status || "PENDING"}
                  onChange={e => setPaymentStatus(o.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

            {/* Bukti pembayaran (hanya jika non-COD & ada bukti) */}
            {o.payment?.method && o.payment.method !== "COD" && o.payment?.proofUrl && (
              <div className="mt-3">
                <div className="font-medium">Bukti Pembayaran ({o.payment.method}):</div>
                <a href={o.payment.proofUrl} target="_blank" rel="noreferrer" className="inline-block">
                  <img
                    src={o.payment.proofUrl}
                    alt="Bukti pembayaran"
                    className="h-24 md:h-28 object-contain border rounded mt-1"
                  />
                </a>
              </div>
            )}

            {/* Items */}
            <div className="mt-3">
              <div className="font-medium">Items:</div>
              <ul className="list-disc pl-5 text-sm">
                {o.items.map(it => (
                  <li key={it.id}>
                    {it.product?.name} × {it.qty} • Rp {(Number(it.price) * it.qty).toLocaleString("id-ID")}
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