"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const COURIER_LABEL = {
  JNE: "JNE Reguler",
  JNT: "J&T Express",
  SICEPAT: "SiCepat Reguler",
}

export default function InvoicePage() {
  const { id } = useParams()
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/orders", { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => []),
      fetch("/api/addresses", { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => []),
    ])
      .then(([ordersData, addrData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setAddresses(Array.isArray(addrData) ? addrData : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const order = useMemo(
    () => orders.find(o => String(o.id) === String(id)),
    [orders, id]
  )

  const address = order?.address || null

  if (loading) return <main className="p-6">Memuat invoice...</main>
  if (!order) return <main className="p-6">❌ Invoice tidak ditemukan.</main>

  return (
    <>
      <style jsx global>{`
        #invoice-print .small { font-size: 12px; }
        #invoice-print .muted { color: #6b7280; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print {
            position: absolute !important;
            left: 0 !important; right: 0 !important; top: 0 !important;
            margin: 0 auto !important;
            width: 210mm !important; min-height: 297mm !important;
            box-sizing: border-box !important;
            padding: 14mm 12mm 14mm 12mm !important;
            background: #ffffff !important; color: #000000 !important;
            border-radius: 0 !important; box-shadow: none !important;
          }
          #invoice-print .no-print { display: none !important; }
          #invoice-print table {
            width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important;
          }
          #invoice-print th, #invoice-print td {
            border: 1px solid #d1d5db !important; padding: 6px 8px !important;
          }
          #invoice-print thead tr { background: #f3f4f6 !important; }
          #invoice-print .section-header, #invoice-print .totals { break-inside: avoid !important; }
          #invoice-print a[href]:after { content: "" !important; }
        }
      `}</style>

      <main
        id="invoice-print"
        className="bg-white text-black p-8 max-w-3xl mx-auto shadow rounded"
      >
        <div className="section-header flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Invoice #{order.orderNo}</h1>
            <p className="small muted">Tanggal: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="small mt-1">Coffee UMKM · 0812-0000-0000 · hello@coffee-umkm.test</p>
          </div>

          {/* ← tombol kembali diarahkan ke halaman pesanan */}
          <div className="no-print space-x-2">
            <Link href="/orders" className="px-3 py-1 border rounded text-sm">
              ← Kembali
            </Link>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="font-semibold mb-2">Alamat Pengiriman</h2>
          {address ? (
            <div className="small">
              <p><b>{address.recipient}</b> ({address.phone})</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.province} {address.postalCode}</p>
              <p className="muted mt-1">Label: {address.label}{address.isDefault ? " (Default)" : ""}</p>
            </div>
          ) : (
            <p className="text-red-600">Alamat tidak ditemukan.</p>
          )}
        </section>

        {order.note && (
          <section className="mb-6">
            <h2 className="font-semibold mb-2">Catatan</h2>
            <p className="small">{order.note}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="font-semibold mb-2">Daftar Barang</h2>
          <table>
            <thead>
              <tr>
                <th className="text-left">Produk</th>
                <th style={{ width: 60 }}>Qty</th>
                <th style={{ width: 120 }}>Harga</th>
                <th style={{ width: 140 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(it => (
                <tr key={it.id}>
                  <td>{it.product.name}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-right">Rp {Number(it.price).toLocaleString()}</td>
                  <td className="text-right">Rp {(Number(it.price) * it.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="totals mb-6">
          <table>
            <tbody>
              <tr>
                <td className="text-right font-semibold" colSpan={3}>
                  Ongkir ({COURIER_LABEL[order.shippingMethod] || order.shippingMethod})
                </td>
                <td className="text-right">Rp {Number(order.shippingCost).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="text-right font-bold" colSpan={3}>Total</td>
                <td className="text-right font-bold">Rp {Number(order.total).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Pembayaran</h2>
          <p className="small">Metode: {order.payment?.method || "Belum dipilih"}</p>
          <p className="small">Status: {order.payment?.status || "PENDING"}</p>
          {order.payment?.proofUrl && (
            <div className="mt-2">
              <p className="small font-medium">Bukti Pembayaran:</p>
              <img
                src={order.payment.proofUrl}
                alt="Bukti pembayaran"
                className="max-h-40 border rounded mt-1"
              />
            </div>
          )}
        </section>
      </main>
    </>
  )
}
