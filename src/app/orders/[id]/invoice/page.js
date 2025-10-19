"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

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
            headers: {
              'Content-Type': 'application/json',
            }
          }),
          fetch("/api/addresses", { 
            credentials: "include", 
            cache: "no-store",
            headers: {
              'Content-Type': 'application/json',
            }
          })
        ])

        if (!ordersResponse.ok) {
          throw new Error(`Failed to fetch orders: ${ordersResponse.status}`)
        }

        if (!addressesResponse.ok) {
          throw new Error(`Failed to fetch addresses: ${addressesResponse.status}`)
        }

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

  const order = useMemo(() => {
    return orders.find(o => String(o.id) === String(id))
  }, [orders, id])

  const address = order?.address || addresses.find(addr => addr.id === order?.addressId) || null

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return React.createElement("main", 
      { className: "p-6 text-center text-amber-800" }, 
      "Memuat invoice..."
    )
  }

  if (error) {
    return React.createElement("main", 
      { className: "p-6 text-center text-red-700" }, 
      `Error: ${error}`
    )
  }

  if (!order) {
    return React.createElement("main", 
      { className: "p-6 text-center text-red-700" }, 
      "❌ Invoice tidak ditemukan."
    )
  }

  return React.createElement(React.Fragment, null,
    React.createElement("style", {
      dangerouslySetInnerHTML: {
        __html: `
          #invoice-print .small { font-size: 13px; }
          #invoice-print .muted { color: #8b7355; }
          #invoice-print h1, #invoice-print h2 { color: #5c4033; }

          @media print {
            @page { 
              size: A4 portrait; 
              margin: 0; 
            }
            html, body {
              background: #fff !important;
              color: #000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * { 
              visibility: hidden !important; 
            }
            #invoice-print, #invoice-print * { 
              visibility: visible !important; 
            }
            #invoice-print {
              position: absolute !important;
              left: 0; 
              right: 0; 
              top: 0;
              margin: 0 auto;
              width: 210mm; 
              min-height: 297mm;
              padding: 14mm 12mm;
              background: #fff !important;
              box-shadow: none !important;
            }
            #invoice-print .no-print { 
              display: none !important; 
            }
            #invoice-print table {
              width: 100%; 
              border-collapse: collapse; 
              table-layout: fixed;
            }
            #invoice-print th, #invoice-print td {
              border: 1px solid #d6bfa5; 
              padding: 6px 8px;
            }
            #invoice-print thead tr { 
              background: #f2e1c1 !important; 
              -webkit-print-color-adjust: exact;
            }
          }
        `
      }
    }),

    React.createElement("main", {
      id: "invoice-print",
      className: "bg-[#f9f3ee] text-[#3b2f2f] p-8 max-w-3xl mx-auto shadow-lg rounded-2xl border border-[#d7b899]"
    },
      // HEADER
      React.createElement("div", { 
        className: "flex justify-between items-start mb-6 border-b border-[#c7a77a] pb-4" 
      },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-3xl font-bold" }, `Invoice #${order.orderNo}`),
          React.createElement("p", { className: "small muted" }, 
            `Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`
          ),
          React.createElement("p", { className: "small mt-1" }, 
            "COFFESST · 0812-0000-0000 · hello@COFFESST"
          )
        ),
        React.createElement("div", { className: "no-print space-x-2" },
          React.createElement(Link, {
            href: "/orders",
            className: "px-3 py-1 border border-[#c7a77a] rounded text-sm hover:bg-[#e9d7b6] transition"
          }, "← Kembali"),
          React.createElement("button", {
            onClick: handlePrint,
            className: "px-3 py-1 bg-[#8b5e3c] text-white rounded text-sm hover:bg-[#70452a] transition"
          }, "Cetak / Simpan PDF")
        )
      ),

      // ALAMAT
      React.createElement("section", { className: "mb-6" },
        React.createElement("h2", { className: "font-semibold mb-2" }, "Alamat Pengiriman"),
        address ? React.createElement("div", { className: "small" },
          React.createElement("p", null, 
            React.createElement("b", null, address.recipient), 
            ` (${address.phone})`
          ),
          React.createElement("p", null, address.street),
          React.createElement("p", null, 
            `${address.city}, ${address.province} ${address.postalCode}`
          ),
          React.createElement("p", { className: "muted mt-1" }, 
            `Label: ${address.label}${address.isDefault ? " (Default)" : ""}`
          )
        ) : React.createElement("p", { className: "text-red-700" }, "Alamat tidak ditemukan.")
      ),

      // CATATAN
      order.note && React.createElement("section", { className: "mb-6" },
        React.createElement("h2", { className: "font-semibold mb-2" }, "Catatan"),
        React.createElement("p", { className: "small bg-[#f1e0c6] p-3 rounded" }, order.note)
      ),

      // DAFTAR BARANG
      React.createElement("section", { className: "mb-6" },
        React.createElement("h2", { className: "font-semibold mb-2" }, "Daftar Barang"),
        React.createElement("table", { 
          className: "w-full text-sm border border-[#d7b899] rounded overflow-hidden" 
        },
          React.createElement("thead", { className: "bg-[#e8d6b3] text-[#4a3720]" },
            React.createElement("tr", null,
              React.createElement("th", { className: "text-left p-2" }, "Produk"),
              React.createElement("th", { className: "text-center p-2 w-[60px]" }, "Qty"),
              React.createElement("th", { className: "text-right p-2 w-[120px]" }, "Harga"),
              React.createElement("th", { className: "text-right p-2 w-[140px]" }, "Subtotal")
            )
          ),
          React.createElement("tbody", null,
            (order.items || []).map((it) =>
              React.createElement("tr", { 
                key: it.id, 
                className: "border-t border-[#d7a77a]" 
              },
                React.createElement("td", { className: "p-2" }, 
                  it.product?.name || "Produk tidak ditemukan"
                ),
                React.createElement("td", { className: "text-center p-2" }, it.qty),
                React.createElement("td", { className: "text-right p-2" }, 
                  `Rp ${Number(it.price || 0).toLocaleString('id-ID')}`
                ),
                React.createElement("td", { className: "text-right p-2" }, 
                  `Rp ${(Number(it.price || 0) * (it.qty || 0)).toLocaleString('id-ID')}`
                )
              )
            )
          )
        )
      ),

      // TOTAL
      React.createElement("section", { className: "mb-6" },
        React.createElement("table", { className: "w-full text-sm" },
          React.createElement("tbody", null,
            React.createElement("tr", null,
              React.createElement("td", { 
                className: "text-right font-semibold", 
                colSpan: 3 
              }, `Ongkir (${COURIER_LABEL[order.shippingMethod] || order.shippingMethod})`),
              React.createElement("td", { className: "text-right" }, 
                `Rp ${Number(order.shippingCost || 0).toLocaleString('id-ID')}`
              )
            ),
            React.createElement("tr", { className: "border-t border-[#d7b899]" },
              React.createElement("td", { 
                className: "text-right font-bold text-lg pt-2", 
                colSpan: 3 
              }, "Total"),
              React.createElement("td", { 
                className: "text-right font-bold text-lg pt-2" 
              }, `Rp ${Number(order.total || 0).toLocaleString('id-ID')}`)
            )
          )
        )
      ),

      // PEMBAYARAN
      React.createElement("section", null,
        React.createElement("h2", { className: "font-semibold mb-2" }, "Pembayaran"),
        React.createElement("p", { className: "small" }, 
          `Metode: ${order.payment?.method || "Belum dipilih"}`
        ),
        React.createElement("p", { className: "small" }, 
          `Status: ${order.payment?.status || "PENDING"}`
        ),
        order.payment?.proofUrl && React.createElement("div", { className: "mt-3" },
          React.createElement("p", { className: "small font-medium" }, "Bukti Pembayaran:"),
          React.createElement("div", { 
            className: "relative max-h-40 border border-[#c7a77a] rounded mt-1 overflow-hidden" 
          },
            React.createElement(Image, {
              src: order.payment.proofUrl,
              alt: "Bukti pembayaran",
              width: 400,
              height: 160,
              className: "object-contain",
              priority: false
            })
          )
        )
      )
    )
  )
}