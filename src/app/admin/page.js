// src/app/admin/page.js
"use client"

import { useEffect, useMemo, useState } from "react"

function Card({ title, children }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">{title}</div>
      <div className="text-2xl font-semibold">{children}</div>
    </div>
  )
}

// Bar chart sederhana (tanpa lib)
function BarChart({ data, valueKey = "value", labelKey = "label", height = 140 }) {
  const max = Math.max(1, ...data.map(d => Number(d[valueKey] || 0)))
  const barW = 28
  const gap = 10
  const width = data.length * (barW + gap) + gap

  return (
    <div className="border dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Axis baseline */}
        <line x1="0" y1={height - 24} x2={width} y2={height - 24} stroke="currentColor" opacity="0.2" />
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const h = Math.round((v / max) * (height - 34))
          const x = gap + i * (barW + gap)
          const y = height - 24 - h
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx="4" className="fill-current" opacity="0.9" />
              <text x={x + barW / 2} y={height - 8} fontSize="10" textAnchor="middle" className="opacity-70">
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
    <main className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Admin • Dashboard</h1>
        <div className="ml-auto">
          <label className="mr-2 text-sm text-neutral-600 dark:text-neutral-300">Rentang:</label>
          <select
            className="border dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded px-2 py-1 text-sm"
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

      {err && <p className="text-red-600 dark:text-red-400">{err}</p>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card title="Total Pesanan">
              {data.totals.totalOrders.toLocaleString("id-ID")}
            </Card>
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
              <div className="font-semibold mb-2">Pesanan per Hari</div>
              <BarChart data={ordersPerDay} />
            </div>
            <div>
              <div className="font-semibold mb-2">Pendapatan per Hari</div>
              {/* Gunakan value yang sama (sudah diolah) */}
              <BarChart data={revenuePerDay} />
            </div>
          </div>

          {/* Top Produk */}
          <div className="border dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-3">
            <div className="font-semibold mb-2">Top Produk (Qty)</div>
            {data.topProducts.length === 0 ? (
              <p className="opacity-70">Belum ada data.</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-950/50">
                    <th className="text-left border-b dark:border-neutral-800 p-2">Produk</th>
                    <th className="text-right border-b dark:border-neutral-800 p-2" style={{ width: 120 }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p.productId} className="border-b last:border-b-0 dark:border-neutral-800">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-right">{p.qty.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Distribusi Pembayaran */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-3">
              <div className="font-semibold mb-2">Pembayaran per Metode</div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>COD: {data.payments.byMethod.COD}</li>
                <li>Transfer Bank: {data.payments.byMethod.BANK_TRANSFER}</li>
                <li>E-Wallet: {data.payments.byMethod.EWALLET}</li>
              </ul>
            </div>
            <div className="border dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-3">
              <div className="font-semibold mb-2">Status Pembayaran</div>
              <ul className="list-disc pl-5 space-y-0.5">
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