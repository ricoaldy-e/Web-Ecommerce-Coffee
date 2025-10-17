// src/app/admin/page.js
"use client"

import { useEffect, useMemo, useState } from "react"

function Card({ title, children }) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl shadow-md hover:shadow-lg transition p-4">
      <div className="text-xs uppercase tracking-wide text-amber-600 mb-1">{title}</div>
      <div className="text-2xl font-semibold text-amber-900">{children}</div>
    </div>
  )
}

function BarChart({ data, valueKey = "value", labelKey = "label", height = 140 }) {
  const max = Math.max(1, ...data.map(d => Number(d[valueKey] || 0)))
  const barW = 28
  const gap = 10
  const width = data.length * (barW + gap) + gap

  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-amber-700">
        <line x1="0" y1={height - 24} x2={width} y2={height - 24} stroke="currentColor" opacity="0.3" />
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const h = Math.round((v / max) * (height - 34))
          const x = gap + i * (barW + gap)
          const y = height - 24 - h
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                className="fill-amber-600 hover:fill-amber-700 transition"
                opacity="0.9"
              />
              <text x={x + barW / 2} y={height - 8} fontSize="10" textAnchor="middle" className="fill-amber-900 opacity-70">
                {String(d[labelKey]).slice(5)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function AdminDashboard() {
  const [days, setDays] = useState(14)
  const [data, setData] = useState(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    const load = async () => {
      setErr("")
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, { credentials: "include", cache: "no-store" })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
        setData(await res.json())
      } catch (e) {
        setErr(e.message || "Gagal memuat analytics")
      }
    }
    load()
  }, [days])

  const ordersPerDay = useMemo(() => (data?.perDay || []).map(d => ({ label: d.date, value: d.orders })), [data])
  const revenuePerDay = useMemo(() => (data?.perDay || []).map(d => ({ label: d.date, value: d.revenue })), [data])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Admin • Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm opacity-80">Rentang:</label>
          <select
            className="bg-white/20 text-white rounded px-2 py-1 text-sm hover:bg-white/30 transition"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 hari</option>
            <option value={14}>14 hari</option>
            <option value={30}>30 hari</option>
            <option value={60}>60 hari</option>
          </select>
        </div>
      </div>

      {err && <p className="text-red-600 font-semibold">{err}</p>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card title="Total Pesanan">{data.totals.totalOrders.toLocaleString("id-ID")}</Card>
            <Card title="Total Pendapatan">
              Rp {Math.round(data.totals.totalRevenue).toLocaleString("id-ID")}
            </Card>
            <Card title="Rata-rata Nilai Pesanan (AOV)">
              Rp {Math.round(data.totals.avgOrderValue).toLocaleString("id-ID")}
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
                Pesanan per Hari
              </div>
              <BarChart data={ordersPerDay} />
            </div>
            <div>
              <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
                Pendapatan per Hari
              </div>
              <BarChart data={revenuePerDay} />
            </div>
          </div>

          {/* Top Produk */}
          <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3">
            <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
              Top Produk (Qty)
            </div>
            {data.topProducts.length === 0 ? (
              <p className="opacity-70 text-amber-800">Belum ada data.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="text-left border-b border-amber-200 p-2 text-amber-900">Produk</th>
                    <th className="text-right border-b border-amber-200 p-2 text-amber-900" style={{ width: 120 }}>
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p.productId} className="border-b last:border-b-0 border-amber-100 hover:bg-amber-50 transition">
                      <td className="p-2 text-amber-900">{p.name}</td>
                      <td className="p-2 text-right text-amber-900">
                        {p.qty.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Distribusi Pembayaran */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3">
              <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
                Pembayaran per Metode
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                <li>COD: {data.payments.byMethod.COD}</li>
                <li>Transfer Bank: {data.payments.byMethod.BANK_TRANSFER}</li>
                <li>E-Wallet: {data.payments.byMethod.EWALLET}</li>
              </ul>
            </div>
            <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3">
              <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
                Status Pembayaran
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                <li>PENDING: {data.payments.byStatus.PENDING}</li>
                <li>SUCCESS: {data.payments.byStatus.SUCCESS}</li>
                <li>FAILED: {data.payments.byStatus.FAILED}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
