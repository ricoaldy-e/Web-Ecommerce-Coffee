// src/app/orders/[id]/invoice/page.js
"use client"

import React, { useEffect, useMemo, useState } from "react"
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
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [ordersResponse, addressesResponse] = await Promise.all([
          fetch("/api/orders", {
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" }
          }),
          fetch("/api/addresses", {
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" }
          })
        ])

        if (!ordersResponse.ok) throw new Error(`Failed to fetch orders: ${ordersResponse.status}`)
        if (!addressesResponse.ok) throw new Error(`Failed to fetch addresses: ${addressesResponse.status}`)

        const ordersData = await ordersResponse.json()
        const addressesData = await addressesResponse.json()

        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setAddresses(Array.isArray(addressesData) ? addressesData : [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        setOrders([])
        setAddresses([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const order = useMemo(() => orders.find(o => String(o.id) === String(id)), [orders, id])

  const address =
    order?.address ||
    addresses.find(addr => addr.id === order?.addressId) ||
    null

  const handlePrint = () => window.print()

  if (loading) return <main className="p-6 text-center text-amber-800">Memuat invoice...</main>
  if (error) return <main className="p-6 text-center text-red-700">Error: {error}</main>
  if (!order) return <main className="p-6 text-center text-red-700">❌ Invoice tidak ditemukan.</main>

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          #invoice-print .small { font-size: 13px; }
          #invoice-print .muted { color: #8b7355; }
          #invoice-print h1, #invoice-print h2 { color: #5c4033; }

          /* --- Bukti pembayaran: tampil ringkas dan rapi --- */
          #invoice-print .proof {
            border: 1px solid #c7a77a;
            border-radius: 10px;
            padding: 8px;
            background: #fff;
            max-width: 85mm;            /* ukuran wajar di invoice */
            margin: 8px auto 0;         /* center */
            break-inside: avoid;
            page-break-inside: avoid;
            text-align: center;
          }
          #invoice-print .proof img {
            display: block;
            width: 100%;
            height: auto;
            object-fit: contain;         /* tidak terpotong */
            max-height: 320px;           /* batas wajar di layar */
          }
          #invoice-print .proof .caption {
            margin-top: 6px;
            font-size: 12px;
            color: #6b5b4a;
          }

          @media print {
            @page { size: A4 portrait; margin: 0; }
            html, body {
              background: #fff !important;
              color: #000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * { visibility: hidden !important; }
            #invoice-print, #invoice-print * { visibility: visible !important; }
            #invoice-print {
              position: absolute !important;
              left: 0; right: 0; top: 0;
              margin: 0 auto;
              width: 210mm;
              min-height: 297mm;
              padding: 14mm 12mm;
              background: #fff !important;
              box-shadow: none !important;
            }
            #invoice-print .no-print { display: none !important; }
            #invoice-print table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            #invoice-print th, #invoice-print td { border: 1px solid #d6bfa5; padding: 6px 8px; }
            #invoice-print thead tr { background: #f2e1c1 !important; -webkit-print-color-adjust: exact; }

            /* --- Khusus print: bukti tetap kecil, rapi, tidak terpotong --- */
            #invoice-print .proof {
              max-width: 80mm;          /* sedikit lebih kecil di PDF */
              padding: 6px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            #invoice-print .proof img {
              max-height: 70mm !important; /* batas tinggi, tetap proporsional */
              width: 100% !important;
              height: auto !important;
              object-fit: contain !important;
            }
          }
        `,
        }}
      />

      <main
        id="invoice-print"
        className="bg-[#f9f3ee] text-[#3b2f2f] p-8 max-w-3xl mx-auto shadow-lg rounded-2xl border border-[#d7b899]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 border-b border-[#c7a77a] pb-4">
          <div>
            <h1 className="text-3xl font-bold">Invoice #{order.orderNo}</h1>
            <p className="small muted">Tanggal: {new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
            <p className="small mt-1">COFFESST · 0812-0000-0000 · hello@COFFESST</p>
          </div>
          <div className="no-print space-x-2">
            <Link href="/orders" className="px-3 py-1 border border-[#c7a77a] rounded text-sm hover:bg-[#e9d7b6] transition">
              ← Kembali
            </Link>
            <button onClick={handlePrint} className="px-3 py-1 bg-[#8b5e3c] text-white rounded text-sm hover:bg-[#70452a] transition">
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* ALAMAT */}
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
            <p className="text-red-700">Alamat tidak ditemukan.</p>
          )}
        </section>

        {/* CATATAN */}
        {order.note && (
          <section className="mb-6">
            <h2 className="font-semibold mb-2">Catatan</h2>
            <p className="small bg-[#f1e0c6] p-3 rounded">{order.note}</p>
          </section>
        )}

        {/* DAFTAR BARANG */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Daftar Barang</h2>
          <table className="w-full text-sm border border-[#d7b899] rounded overflow-hidden">
            <thead className="bg-[#e8d6b3] text-[#4a3720]">
              <tr>
                <th className="text-left p-2">Produk</th>
                <th className="text-center p-2 w-[60px]">Qty</th>
                <th className="text-right p-2 w-[120px]">Harga</th>
                <th className="text-right p-2 w-[140px]">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map(it => (
                <tr key={it.id} className="border-t border-[#d7a77a]">
                  <td className="p-2">{it.product?.name || "Produk tidak ditemukan"}</td>
                  <td className="text-center p-2">{it.qty}</td>
                  <td className="text-right p-2">Rp {Number(it.price || 0).toLocaleString("id-ID")}</td>
                  <td className="text-right p-2">Rp {(Number(it.price || 0) * (it.qty || 0)).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* TOTAL */}
        <section className="mb-6">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="text-right font-semibold" colSpan={3}>
                  Ongkir ({COURIER_LABEL[order.shippingMethod] || order.shippingMethod})
                </td>
                <td className="text-right">Rp {Number(order.shippingCost || 0).toLocaleString("id-ID")}</td>
              </tr>
              <tr className="border-t border-[#d7b899]">
                <td className="text-right font-bold text-lg pt-2" colSpan={3}>Total</td>
                <td className="text-right font-bold text-lg pt-2">Rp {Number(order.total || 0).toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* PEMBAYARAN */}
        <section>
          <h2 className="font-semibold mb-2">Pembayaran</h2>
          <p className="small">Metode: {order.payment?.method || "Belum dipilih"}</p>
          <p className="small">Status: {order.payment?.status || "PENDING"}</p>

          {order.payment?.proofUrl && (
            <div className="mt-3">
              <p className="small font-medium">Bukti Pembayaran:</p>
              <div className="proof">
                <img
                  src={order.payment.proofUrl}
                  alt="Bukti pembayaran"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}