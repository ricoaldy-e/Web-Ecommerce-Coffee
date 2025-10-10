"use client"
import { useEffect, useState } from "react"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
  }, [])

  const courierLabel = (m) => {
    if (m === "JNE") return "JNE Reguler"
    if (m === "JNT") return "J&T Express"
    if (m === "SICEPAT") return "SiCepat Reguler"
    return m
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Pesanan Saya</h1>
      {orders.length === 0 && <p>Belum ada pesanan.</p>}
      <ul className="flex flex-col gap-4">
        {orders.map(order => (
          <li key={order.id} className="border p-3 rounded">
            <div><b>No. Pesanan:</b> {order.orderNo}</div>
            <div><b>Status:</b> {order.status}</div>

            {order.address && (
              <div className="mt-2 text-sm">
                <b>Alamat:</b>{" "}
                {order.address.label} • {order.address.recipient} ({order.address.phone})<br />
                {order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}
              </div>
            )}

            {order.note && (
              <div className="mt-1 text-sm">
                <b>Catatan:</b> {order.note}
              </div>
            )}

            <div className="mt-1 text-sm">
              <b>Kurir:</b> {courierLabel(order.shippingMethod)} — Ongkir: Rp {Number(order.shippingCost).toLocaleString()}
            </div>

            <ul className="mt-2">
              {order.items.map(it => (
                <li key={it.id}>
                  {it.product.name} × {it.qty} = Rp {(Number(it.price) * it.qty).toLocaleString()}
                </li>
              ))}
            </ul>

            <div className="mt-2 font-semibold">Total: Rp {Number(order.total).toLocaleString()}</div>

            <a
              className="inline-block mt-2 text-blue-600 underline"
              href={`/orders/${order.id}/invoice`}
            >
              Lihat Invoice
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}