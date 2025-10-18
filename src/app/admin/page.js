// src/app/admin/page.js
"use client"

import { useEffect, useMemo, useState } from "react"

function Card({ title, children }) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl shadow-md hover:shadow-lg transition p-4 sm:p-5">
      <div className="text-xs uppercase tracking-wide text-amber-600 mb-1">{title}</div>
      <div className="text-2xl font-semibold text-amber-900">{children}</div>
    </div>
  )
}

// 🔸 fungsi bantu biar sumbu Y rapi (0, 5, 10, 15 ...)
function niceStep(max, steps = 4) {
  if (max <= 0) return 1
  const rough = max / steps
  const pow10 = 10 ** Math.floor(Math.log10(rough))
  const opts = [1, 2, 2.5, 5, 10].map(c => c * pow10)
  return opts.find(c => c >= rough) ?? opts.at(-1)
}

// 🔸 BarChart: responsive, axis Y, label X tidak menumpuk, hanya tampil angka jika > 0
function BarChart({ data, valueKey = "value", labelKey = "label", height = 160 }) {
  const max = Math.max(1, ...data.map(d => Number(d[valueKey] || 0)))
  const steps = 4
  const stepVal = niceStep(max, steps)
  const niceMax = stepVal * steps

  const gap = 8
  const barW = data.length > 40 ? 14 : data.length > 25 ? 20 : 28
  const leftPadding = 40
  const width = data.length * (barW + gap) + gap + leftPadding

  const yLabels = Array.from({ length: steps + 1 }, (_, i) => stepVal * i)
  const showEvery = data.length > 40 ? 5 : data.length > 25 ? 3 : 1

  return (
    <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-transparent">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-full text-amber-700">
        {/* Garis grid + label Y */}
        {yLabels.map((val, i) => {
          const y = height - 24 - (i / steps) * (height - 40)
          return (
            <g key={i}>
              <line x1={leftPadding} y1={y} x2={width} y2={y} stroke="currentColor" opacity="0.15" />
              <text x={leftPadding - 5} y={y + 4} fontSize="9" textAnchor="end" className="fill-amber-800 opacity-80">
                {val.toLocaleString("id-ID")}
              </text>
            </g>
          )
        })}

        {/* Garis dasar */}
        <line x1={leftPadding} y1={height - 24} x2={width} y2={height - 24} stroke="currentColor" opacity="0.3" />

        {/* Batang + nilai di atas bar (hanya jika > 0) */}
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const h = Math.round((v / niceMax) * (height - 40))
          const x = leftPadding + gap + i * (barW + gap)
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
              {/* tampilkan angka hanya jika nilainya > 0 */}
              {v > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  fontSize="9"
                  textAnchor="middle"
                  className="fill-amber-800"
                >
                  {v.toLocaleString("id-ID")}
                </text>
              )}

              {/* label tanggal di bawah */}
              {barW >= 16 && i % showEvery === 0 && (
                <text
                  x={x + barW / 2}
                  y={height - 8}
                  fontSize="9"
                  textAnchor="middle"
                  className="fill-amber-900 opacity-70"
                >
                  {String(d[labelKey]).slice(5)}
                </text>
              )}
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
      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold flex-1 min-w-[180px]">Admin • Dashboard</h1>
        <div className="flex w-full sm:w-auto items-center gap-2 sm:ml-auto">
          <label htmlFor="range" className="text-sm opacity-80 whitespace-nowrap">Rentang:</label>
          <select
            id="range"
            className="w-full sm:w-auto bg-white/20 text-white rounded px-2 py-1 text-sm hover:bg-white/30 transition appearance-none focus:bg-white focus:text-amber-900"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option className="text-amber-900 bg-white" value={7}>7 hari</option>
            <option className="text-amber-900 bg-white" value={14}>14 hari</option>
            <option className="text-amber-900 bg-white" value={30}>30 hari</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{err}</p>
            <button
              onClick={() => setDays(d => d)}
              className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >Coba lagi</button>
          </div>
        </div>
      )}

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

          {/* Hasil Penjualan Produk */}
          <div className="border border-amber-200 rounded-xl bg-white shadow-md p-3">
            <div className="font-semibold text-amber-900 mb-2 border-b-2 border-amber-600 pb-1">
              Hasil Penjualan Produk
            </div>

            <div className="max-h-[420px] overflow-auto rounded-lg border border-amber-100">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-amber-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left border-b border-amber-200 p-2 text-amber-900">Produk</th>
                    <th className="text-right border-b border-amber-200 p-2 text-amber-900" style={{ width: 140 }}>
                      Qty Terjual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.productSales.map((p) => (
                    <tr key={p.productId} className="border-b last:border-b-0 border-amber-100 hover:bg-amber-50 transition">
                      <td className="p-2 text-amber-900">{p.name}</td>
                      <td className="p-2 text-right text-amber-900">
                        {Number(p.qty).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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