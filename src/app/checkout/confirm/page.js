"use client"

import { useEffect, useMemo, useState } from "react"
import { paymentInfo } from "@/lib/storeConfig"
import { loadRegions, getCitiesForProvince } from "@/lib/regions"

const COURIER_RATES = {
  JNE:    { label: "JNE Reguler",     base: 12000, perItem: 3000 },
  JNT:    { label: "J&T Express",     base: 13000, perItem: 2500 },
  SICEPAT:{ label: "SiCepat Reguler", base: 11000, perItem: 3500 },
}

export default function CheckoutConfirmPage() {
  const [isBuyNow, setIsBuyNow] = useState(false)
  const [bnItem, setBnItem] = useState(null) // { productId, qty, name, price }

  const [items, setItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState("")
  const [method, setMethod] = useState("COD")
  const [courier, setCourier] = useState("JNE")
  const [note, setNote] = useState("")
  const [addingAddr, setAddingAddr] = useState(false)

  // ==== Regions (provinsi/kota) ====
  const [regions, setRegions] = useState({ provinces: [] })
  const [provinceCities, setProvinceCities] = useState([])

  const [addrForm, setAddrForm] = useState({
    recipient: "", phone: "",
    street: "",
    province: "", city: "",
    postalCode: "",
    isDefault: false,
    label: "",
  })

  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState("")

  // Guard wajib login (FE)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.user) {
          const next = window.location.pathname + window.location.search
          window.location.href = `/auth/login?next=${encodeURIComponent(next)}`
          return
        }
      } catch {
        const next = window.location.pathname + window.location.search
        window.location.href = `/auth/login?next=${encodeURIComponent(next)}`
        return
      }
    })()
  }, [])

  // load addresses & cart/buynow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const bn = params.get("buynow") === "1"
    setIsBuyNow(bn)

    fetch("/api/addresses", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(list => {
        const arr = Array.isArray(list) ? list : []
        setAddresses(arr)
        const def = arr.find(a => a.isDefault)
        if (def) setAddressId(String(def.id))
      })
      .catch(() => setAddresses([]))

    if (bn) {
      try {
        const raw = sessionStorage.getItem("buyNowItem")
        if (raw) {
          const obj = JSON.parse(raw)
          if (obj?.productId && obj?.qty) setBnItem(obj)
        }
      } catch {}
    } else {
      fetch("/api/cart", { credentials: "include", cache: "no-store" })
        .then(res => res.json())
        .then(data => setItems(data.items || []))
        .catch(() => setItems([]))
    }
  }, [])

  useEffect(() => {
    loadRegions().then(setRegions)
  }, [])

  const displayItems = useMemo(() => {
    if (isBuyNow && bnItem) {
      return [{
        id: "BUY_NOW",
        product: { name: bnItem.name, price: bnItem.price },
        qty: bnItem.qty
      }]
    }
    return items
  }, [isBuyNow, bnItem, items])

  const itemsTotal = useMemo(
    () => displayItems.reduce((sum, it) => sum + Number(it.product.price) * it.qty, 0),
    [displayItems]
  )
  const itemsCount = useMemo(
    () => displayItems.reduce((n, it) => n + it.qty, 0),
    [displayItems]
  )
  const shippingCost = useMemo(() => {
    const cfg = COURIER_RATES[courier] || COURIER_RATES.JNE
    const n = Math.max(1, itemsCount)
    return cfg.base + cfg.perItem * (n - 1)
  }, [courier, itemsCount])

  const grandTotal = itemsTotal + shippingCost

  const onAddrChange = (e) => {
    const { name, value, type, checked } = e.target
    const v = type === "checkbox" ? checked : value
    setAddrForm(prev => ({ ...prev, [name]: v }))
  }

  const onProvinceInput = (e) => {
    const value = e.target.value;
    setAddrForm(prev => ({ ...prev, province: value, city: "" }));
    setProvinceCities(getCitiesForProvince(regions, value));
  };

  const onProofChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setProofFile(null)
      setProofPreview("")
      return
    }
    const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || 5)
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Maksimal ${MAX_MB}MB`)
      e.target.value = ""
      setProofFile(null)
      setProofPreview("")
      return
    }
    if (!file.type || !file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan")
      e.target.value = ""
      setProofFile(null)
      setProofPreview("")
      return
    }
    setProofFile(file)
    const url = URL.createObjectURL(file)
    setProofPreview(url)
  }

  const createAddressQuick = async () => {
    const required = ["recipient","phone","street","province","city","postalCode","label"]
    for (const k of required) {
      if (!addrForm[k]) {
        alert("Lengkapi data alamat: " + k)
        return null
      }
    }
    const res = await fetch("/api/addresses", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addrForm)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert("Gagal membuat alamat: " + (err.message || res.status))
      return null
    }
    const created = await res.json()
    const list = await fetch("/api/addresses", { credentials: "include", cache: "no-store" })
      .then(r => r.json()).catch(() => [])
    setAddresses(Array.isArray(list) ? list : [])
    setAddressId(String(created.id))
    setAddingAddr(false)
    return created
  }

  const submitCheckout = async () => {
    let addrToUse = addressId
    if (!addrToUse && addingAddr) {
      const created = await createAddressQuick()
      if (!created) return
      addrToUse = String(created.id)
    }

    if (!addrToUse) {
      alert("Pilih atau buat alamat terlebih dahulu.")
      return
    }
    if (displayItems.length === 0) {
      alert("Keranjang / item kosong.")
      return
    }

    if (["BANK_TRANSFER","EWALLET"].includes(method) && !proofFile) {
      alert("Bukti pembayaran wajib diunggah untuk metode ini.")
      return
    }

    // 1) Buat Order
    let orderData = null
    if (isBuyNow) {
      if (!bnItem?.productId || !bnItem?.qty) {
        alert("Item Buy Now tidak valid.")
        return
      }
      const orderRes = await fetch("/api/orders/buy-now", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(bnItem.productId),
          qty: Number(bnItem.qty),
          addressId: Number(addrToUse),
          note,
          shippingMethod: courier,
        })
      })
      orderData = await orderRes.json().catch(() => ({}))
      if (!orderRes.ok) {
        alert("Gagal membuat order: " + (orderData.message || orderRes.status))
        return
      }
      try { sessionStorage.removeItem("buyNowItem") } catch {}
    } else {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: Number(addrToUse),
          note,
          shippingMethod: courier,
        })
      })
      orderData = await orderRes.json().catch(() => ({}))
      if (!orderRes.ok) {
        alert("Gagal membuat order: " + (orderData.message || orderRes.status))
        return
      }
    }

    // 2) Upload bukti (jika non-COD)
    let proofUrl = null
    if (["BANK_TRANSFER","EWALLET"].includes(method) && proofFile) {
      const fd = new FormData()
      fd.append("orderId", String(orderData.id))
      fd.append("file", proofFile)
      const upRes = await fetch("/api/payments/proof", {
        method: "POST",
        credentials: "include",
        body: fd
      })
      const up = await upRes.json().catch(() => ({}))
      if (!upRes.ok) {
        alert("Gagal mengunggah bukti: " + (up.message || upRes.status))
        return
      }
      proofUrl = up.url || null
    }

    // 3) Simpan Payment
    const payRes = await fetch("/api/payments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderData.id,
        method,
        proofUrl: proofUrl || null,
      })
    })
    if (!payRes.ok) {
      const err = await payRes.json().catch(() => ({}))
      alert("Gagal menyimpan pembayaran: " + (err.message || payRes.status))
      return
    }

    alert("✅ Order berhasil dibuat!")
    window.location.href = `/orders/${orderData.id}/invoice`
  }

  const courierLabel = (COURIER_RATES[courier] || COURIER_RATES.JNE).label

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Konfirmasi Pembayaran</h1>

      {/* Ringkasan Pesanan */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ringkasan Pesanan</h2>
        {displayItems.length === 0 ? (
          <p>Keranjang kosong.</p>
        ) : (
          <ul className="divide-y">
            {displayItems.map((it, idx) => (
              <li key={it.id ?? idx} className="py-2 flex justify-between">
                <div>{it.product.name} × {it.qty}</div>
                <div>Rp {(Number(it.product.price) * it.qty).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">Subtotal Barang: <b>Rp {itemsTotal.toLocaleString()}</b></div>
      </section>

      {/* Alamat Pengiriman */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Alamat Pengiriman</h2>

        {addresses.length > 0 && (
          <div className="space-y-2 mb-3">
            {addresses.map(a => (
              <label key={a.id} className="flex items-start gap-2">
                <input
                  type="radio"
                  name="address"
                  value={a.id}
                  checked={String(a.id) === addressId}
                  onChange={e => setAddressId(e.target.value)}
                />
                <span>
                  <b>{a.label}</b> {a.isDefault && <span className="text-xs text-green-700">(Default)</span>}<br/>
                  {a.recipient} ({a.phone}) — {a.street}, {a.city}, {a.province} {a.postalCode}
                </span>
              </label>
            ))}
          </div>
        )}

        <button
          className="px-3 py-1 border rounded mb-3"
          onClick={() => setAddingAddr(s => !s)}
        >
          {addingAddr ? "Batal tambah alamat" : "Tambah alamat baru"}
        </button>

        {addingAddr && (
          <div className="grid gap-2 border p-3 rounded">
            {/* 👉 Konsisten: Nama → Telepon → Provinsi → Kota → Jalan → Kode Pos → Label → Default */}
            <input className="border px-2 py-1 rounded" placeholder="Nama Penerima"
                   name="recipient" value={addrForm.recipient} onChange={onAddrChange} autoComplete="name" />
            <input className="border px-2 py-1 rounded" placeholder="No. Telepon"
                   name="phone" value={addrForm.phone} onChange={onAddrChange} autoComplete="tel" />
            <input className="border px-2 py-1 rounded" placeholder="Provinsi"
                   name="province" value={addrForm.province} onChange={onProvinceInput} list="province-list" autoComplete="address-level1" />
            <datalist id="province-list">
              {(regions.provinces || []).map(p => <option key={p.name} value={p.name} />)}
            </datalist>
            <input className="border px-2 py-1 rounded" placeholder="Kota/Kabupaten"
                   name="city" value={addrForm.city} onChange={onAddrChange} list="city-list"
                   disabled={!addrForm.province} autoComplete="address-level2" />
            <datalist id="city-list">
              {(provinceCities || []).map(c => <option key={c} value={c} />)}
            </datalist>
            <input className="border px-2 py-1 rounded" placeholder="Jalan/Detail"
                   name="street" value={addrForm.street} onChange={onAddrChange} autoComplete="street-address" />
            <div className="grid grid-cols-2 gap-2">
              <input className="border px-2 py-1 rounded" placeholder="Kode Pos"
                     name="postalCode" value={addrForm.postalCode} onChange={onAddrChange} autoComplete="postal-code" />
              <input className="border px-2 py-1 rounded" placeholder="Label (Contoh: Rumah/Kantor)"
                     name="label" value={addrForm.label} onChange={onAddrChange} />
            </div>
            <label className="inline-flex items-center gap-2 mt-1">
              <input type="checkbox" name="isDefault" checked={addrForm.isDefault} onChange={onAddrChange} />
              Jadikan default
            </label>
            <button className="px-3 py-1 border rounded" onClick={createAddressQuick}>
              Simpan Alamat
            </button>
          </div>
        )}
      </section>

      {/* Kurir */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Kurir Pengiriman</h2>
        <select className="border px-2 py-1 rounded" value={courier} onChange={e => setCourier(e.target.value)}>
          {Object.entries(COURIER_RATES).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <div className="mt-2">
          Ongkir: <b>Rp {shippingCost.toLocaleString()}</b> ({courierLabel})
        </div>
      </section>

      {/* Catatan */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Catatan untuk Penjual (opsional)</h2>
        <textarea className="border w-full px-2 py-1 rounded min-h-[80px]"
                  value={note} onChange={e => setNote(e.target.value)} />
      </section>

      {/* Metode Pembayaran + Info */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Metode Pembayaran</h2>
        <select className="border px-2 py-1 rounded" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="COD">COD (Bayar di tempat)</option>
          <option value="BANK_TRANSFER">Transfer Bank</option>
          <option value="EWALLET">E-Wallet</option>
        </select>

        {method === "BANK_TRANSFER" && (
          <div className="mt-3 border rounded p-3">
            <p className="font-medium mb-2">Nomor Rekening Penjual</p>
            <ul className="space-y-2">
              {(paymentInfo.bankAccounts || []).map((b, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div>
                    <div><b>{b.bank}</b> — a.n. {b.accountName}</div>
                    <div className="text-sm">No: {b.accountNumber}{b.note ? ` • ${b.note}` : ""}</div>
                  </div>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => navigator.clipboard.writeText(b.accountNumber)
                      .then(() => alert("Disalin ke clipboard"))
                      .catch(() => alert("Gagal menyalin"))}
                    type="button"
                    title="Salin nomor rekening"
                  >
                    Salin
                  </button>
                </li>
              ))}
            </ul>
            <ul className="list-disc pl-5 mt-3 text-sm">
              {(paymentInfo.instructions?.transfer || []).map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </div>
        )}

        {method === "EWALLET" && (
          <div className="mt-3 border rounded p-3">
            <p className="font-medium mb-2">E-Wallet Penjual</p>
            <ul className="space-y-2">
              {(paymentInfo.ewallets || []).map((w, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div>
                    <div><b>{w.name}</b> — a.n. {w.accountName}</div>
                    <div className="text-sm">No: {w.number}</div>
                  </div>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => navigator.clipboard.writeText(w.number)
                      .then(() => alert("Disalin ke clipboard"))
                      .catch(() => alert("Gagal menyalin"))}
                    type="button"
                    title="Salin nomor e-wallet"
                  >
                    Salin
                  </button>
                </li>
              ))}
            </ul>
            <ul className="list-disc pl-5 mt-3 text-sm">
              {(paymentInfo.instructions?.ewallet || []).map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </div>
        )}

        {method !== "COD" && (
          <div className="mt-3">
            <label className="block mb-1">Upload Bukti Pembayaran <b>(wajib)</b></label>
            <input type="file" accept="image/*" onChange={onProofChange} />
            {proofPreview && (
              <div className="mt-2">
                <img
                  src={proofPreview}
                  alt="Bukti pembayaran"
                  className="max-h-40 border rounded"
                />
                <p className="text-xs text-green-700 mt-1">Bukti siap dikirim.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ringkasan total */}
      <section className="mb-6">
        <div className="p-3 rounded border">
          <div>Subtotal Barang: Rp {itemsTotal.toLocaleString()}</div>
          <div>Ongkir ({courierLabel}): Rp {shippingCost.toLocaleString()}</div>
          <div className="font-bold mt-1">Grand Total: Rp {grandTotal.toLocaleString()}</div>
        </div>
      </section>

      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={submitCheckout}
      >
        Buat Pesanan & Simpan Pembayaran
      </button>
    </main>
  )
}