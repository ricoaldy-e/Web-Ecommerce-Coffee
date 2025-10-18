// src/app/checkout/confirm/page.js
"use client"

import { useEffect, useMemo, useState } from "react"
import { paymentInfo } from "@/lib/storeConfig"
import { loadRegions, getCitiesForProvince } from "@/lib/regions"
import { CreditCard, Truck, MapPin, FileText, Copy, CheckCircle, Package, User, MessageSquare, ArrowLeft, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

const COURIER_RATES = {
  JNE:    { label: "JNE Reguler",     base: 12000, perItem: 3000 },
  JNT:    { label: "J&T Express",     base: 13000, perItem: 2500 },
  SICEPAT:{ label: "SiCepat Reguler", base: 11000, perItem: 3500 },
}

const BANK_OPTIONS = [
  { value: "BCA", label: "Bank BCA" },
  { value: "BRI", label: "Bank BRI" },
  { value: "MANDIRI", label: "Bank Mandiri" },
]

const EWALLET_OPTIONS = [
  { value: "GOPAY", label: "GoPay" },
  { value: "OVO", label: "OVO" },
  { value: "DANA", label: "DANA" },
  { value: "SHOPEEPAY", label: "ShopeePay" },
]

export default function CheckoutConfirmPage() {
  const router = useRouter()
  const [isBuyNow, setIsBuyNow] = useState(false)
  const [bnItem, setBnItem] = useState(null)

  const [items, setItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState("")
  const [method, setMethod] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedEwallet, setSelectedEwallet] = useState("")
  const [courier, setCourier] = useState("")
  const [note, setNote] = useState("")
  const [addingAddr, setAddingAddr] = useState(false)
  const [copiedField, setCopiedField] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Regions
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

  // Filter bank accounts and e-wallets based on user selection
  const filteredBankAccounts = useMemo(() => {
    if (!selectedBank) return []
    return (paymentInfo.bankAccounts || []).filter(account => 
      account.bank.toLowerCase().includes(selectedBank.toLowerCase())
    )
  }, [selectedBank])

  const filteredEWallets = useMemo(() => {
    if (!selectedEwallet) return []
    return (paymentInfo.ewallets || []).filter(ewallet => 
      ewallet.name.toLowerCase().includes(selectedEwallet.toLowerCase())
    )
  }, [selectedEwallet])

  // Check login
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

  // Load data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const bn = params.get("buynow") === "1"
    setIsBuyNow(bn)

    // Load addresses
    fetch("/api/addresses", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(list => {
        const arr = Array.isArray(list) ? list : []
        setAddresses(arr)
        const def = arr.find(a => a.isDefault)
        if (def) setAddressId(String(def.id))
      })
      .catch(() => setAddresses([]))

    // Load cart or buynow item
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
        product: { 
          name: bnItem.name, 
          price: bnItem.price,
          image: bnItem.image 
        },
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
    if (!courier) return 0
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

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(""), 2000)
    } catch {
      alert("Gagal menyalin")
    }
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
    if (isSubmitting) return
    
    setIsSubmitting(true)

    let addrToUse = addressId
    if (!addrToUse && addingAddr) {
      const created = await createAddressQuick()
      if (!created) {
        setIsSubmitting(false)
        return
      }
      addrToUse = String(created.id)
    }

    // Validations
    if (!addrToUse) {
      alert("Pilih atau buat alamat terlebih dahulu.")
      setIsSubmitting(false)
      return
    }
    if (displayItems.length === 0) {
      alert("Keranjang / item kosong.")
      setIsSubmitting(false)
      return
    }
    if (!courier) {
      alert("Pilih kurir pengiriman terlebih dahulu.")
      setIsSubmitting(false)
      return
    }
    if (!method) {
      alert("Pilih metode pembayaran terlebih dahulu.")
      setIsSubmitting(false)
      return
    }
    if (method === "BANK_TRANSFER" && !selectedBank) {
      alert("Pilih bank tujuan transfer terlebih dahulu.")
      setIsSubmitting(false)
      return
    }
    if (method === "EWALLET" && !selectedEwallet) {
      alert("Pilih e-wallet tujuan pembayaran terlebih dahulu.")
      setIsSubmitting(false)
      return
    }
    if (["BANK_TRANSFER","EWALLET"].includes(method) && !proofFile) {
      alert("Bukti pembayaran wajib diunggah untuk metode ini.")
      setIsSubmitting(false)
      return
    }

    try {
      // 1) Create Order
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
            totalAmount: grandTotal,
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
            totalAmount: grandTotal,
          })
        })
        orderData = await orderRes.json().catch(() => ({}))
        if (!orderRes.ok) {
          alert("Gagal membuat order: " + (orderData.message || orderRes.status))
          return
        }
      }

      // 2) Upload proof (if non-COD)
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

      // 3) Save Payment
      const payRes = await fetch("/api/payments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          method,
          bank: method === "BANK_TRANSFER" ? selectedBank : null,
          ewallet: method === "EWALLET" ? selectedEwallet : null,
          proofUrl: proofUrl || null,
          amount: grandTotal,
        })
      })
      if (!payRes.ok) {
        const err = await payRes.json().catch(() => ({}))
        alert("Gagal menyimpan pembayaran: " + (err.message || payRes.status))
        return
      }

      alert("Order berhasil dibuat! Anda akan diarahkan ke halaman invoice.")
      router.push(`/orders/${orderData.id}/invoice`)
      
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const courierLabel = courier ? (COURIER_RATES[courier] || COURIER_RATES.JNE).label : "Pilih kurir"

  const goBack = () => {
    if (isBuyNow) {
      router.push("/")
    } else {
      router.push("/cart")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header dengan tombol kembali */}
        <div className="mb-6">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors mb-4 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6" />
            Kembali
          </button>
          
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-amber-600 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Checkout</h1>
                <p className="text-amber-100 text-lg opacity-90">Lengkapi informasi untuk menyelesaikan pesanan Anda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ringkasan Pesanan */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold text-amber-900">Ringkasan Pesanan</h2>
              </div>
              
              {displayItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-amber-300 mx-auto mb-3" />
                  <p className="text-amber-600 text-lg">Keranjang kosong.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayItems.map((it, idx) => (
                    <div key={it.id ?? idx} className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="w-16 h-16 bg-amber-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-amber-900 text-lg mb-1 truncate">{it.product.name}</div>
                        <div className="text-amber-600 text-base">Jumlah: {it.qty}</div>
                        <div className="text-amber-700 font-semibold text-lg">
                          Rp {(Number(it.product.price) * it.qty).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-amber-700 font-medium text-lg">Subtotal Barang:</span>
                  <span className="font-semibold text-amber-900 text-xl">Rp {itemsTotal.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </section>

            {/* Alamat Pengiriman */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold text-amber-900">Alamat Pengiriman</h2>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {addresses.map(a => (
                    <label key={a.id} className={`flex items-start gap-4 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                      String(a.id) === addressId 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-amber-200 hover:border-amber-300'
                    }`}>
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={String(a.id) === addressId}
                        onChange={e => setAddressId(e.target.value)}
                        className="mt-1 text-amber-600 focus:ring-amber-500 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-amber-900 text-lg">{a.label}</span>
                          {a.isDefault && (
                            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-amber-700 text-lg mb-1">
                          <User className="w-4 h-4 inline mr-2" />
                          {a.recipient} • {a.phone}
                        </div>
                        <div className="text-amber-600 text-lg">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          {a.street}, {a.city}, {a.province} {a.postalCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-6">
                  <MapPin className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                  <p className="text-amber-600 text-lg">Belum ada alamat tersimpan</p>
                </div>
              )}

              <button
                className={`w-full px-4 py-4 rounded-xl font-medium transition-all border-2 text-lg ${
                  addingAddr 
                    ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' 
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                onClick={() => setAddingAddr(s => !s)}
              >
                {addingAddr ? "Batalkan Tambah Alamat" : "Tambah Alamat Baru"}
              </button>

              {addingAddr && (
                <div className="mt-6 p-6 border-2 border-amber-300 rounded-xl bg-amber-50 space-y-4">
                  <h3 className="font-semibold text-amber-900 text-xl mb-4">Informasi Alamat Baru</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">Nama Penerima</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        placeholder="Nama lengkap penerima"
                        name="recipient" 
                        value={addrForm.recipient} 
                        onChange={onAddrChange} 
                        autoComplete="name" 
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">No. Telepon</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        placeholder="08xxxxxxxxxx"
                        name="phone" 
                        value={addrForm.phone} 
                        onChange={onAddrChange} 
                        autoComplete="tel" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">Provinsi</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        placeholder="Pilih provinsi"
                        name="province" 
                        value={addrForm.province} 
                        onChange={onProvinceInput} 
                        list="province-list" 
                        autoComplete="address-level1" 
                      />
                      <datalist id="province-list">
                        {(regions.provinces || []).map(p => <option key={p.name} value={p.name} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">Kota/Kabupaten</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg disabled:opacity-50"
                        placeholder="Pilih kota"
                        name="city" 
                        value={addrForm.city} 
                        onChange={onAddrChange} 
                        list="city-list"
                        disabled={!addrForm.province} 
                        autoComplete="address-level2" 
                      />
                      <datalist id="city-list">
                        {(provinceCities || []).map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-amber-700 mb-2">Alamat Lengkap</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg min-h-[100px] resize-none"
                      placeholder="Jalan, nomor rumah, RT/RW, dll."
                      name="street" 
                      value={addrForm.street} 
                      onChange={onAddrChange} 
                      autoComplete="street-address" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">Kode Pos</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        placeholder="xxxxx"
                        name="postalCode" 
                        value={addrForm.postalCode} 
                        onChange={onAddrChange} 
                        autoComplete="postal-code" 
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-amber-700 mb-2">Label Alamat</label>
                      <input 
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        placeholder="Rumah / Kantor / Kos"
                        name="label" 
                        value={addrForm.label} 
                        onChange={onAddrChange} 
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-300">
                    <input 
                      type="checkbox" 
                      name="isDefault" 
                      checked={addrForm.isDefault} 
                      onChange={onAddrChange} 
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-5 h-5"
                    />
                    <span className="text-amber-700 text-lg font-medium">Jadikan alamat default</span>
                  </label>

                  <button 
                    className="w-full px-4 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={createAddressQuick}
                    disabled={!addrForm.recipient || !addrForm.phone || !addrForm.street || !addrForm.province || !addrForm.city || !addrForm.postalCode || !addrForm.label}
                  >
                    Simpan Alamat
                  </button>
                </div>
              )}
            </section>

            {/* Catatan untuk Penjual */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold text-amber-900">Catatan untuk Penjual</h2>
              </div>
              <textarea 
                className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[120px] text-lg resize-none"
                placeholder="Contoh: Tolong dikirim sebelum jam 3 sore, packaging rapat, dll."
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </section>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-6">
            {/* Kurir Pengiriman */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Truck className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold text-amber-900">Kurir Pengiriman</h2>
              </div>
              
              <select 
                className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg mb-4"
                value={courier} 
                onChange={e => setCourier(e.target.value)}
              >
                <option value="">Pilih Kurir Pengiriman</option>
                {Object.entries(COURIER_RATES).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-white text-amber-900">{cfg.label}</option>
                ))}
              </select>
              
              {courier && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-300">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-amber-700">Ongkir {courierLabel}:</span>
                    <span className="font-semibold text-amber-900">Rp {shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Metode Pembayaran */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold text-amber-900">Metode Pembayaran</h2>
              </div>
              
              <select 
                className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg mb-6"
                value={method} 
                onChange={e => {
                  setMethod(e.target.value)
                  setSelectedBank("")
                  setSelectedEwallet("")
                }}
              >
                <option value="">Pilih Metode Pembayaran</option>
                <option value="COD" className="bg-white text-amber-900">COD (Bayar di Tempat)</option>
                <option value="BANK_TRANSFER" className="bg-white text-amber-900">Transfer Bank</option>
                <option value="EWALLET" className="bg-white text-amber-900">E-Wallet</option>
              </select>

              {method === "BANK_TRANSFER" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-amber-700 mb-3">Pilih Bank Tujuan</label>
                    <select 
                      className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                      value={selectedBank} 
                      onChange={e => setSelectedBank(e.target.value)}
                    >
                      <option value="">Pilih Bank</option>
                      {BANK_OPTIONS.map(bank => (
                        <option key={bank.value} value={bank.value} className="bg-white text-amber-900">
                          {bank.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBank && (
                    <>
                      <p className="font-semibold text-amber-900 text-lg mb-3">Nomor Rekening Penjual</p>
                      <div className="space-y-3">
                        {filteredBankAccounts.length > 0 ? (
                          filteredBankAccounts.map((b, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-amber-300 rounded-xl bg-amber-50">
                              <div className="flex-1">
                                <div className="font-semibold text-amber-900 text-lg">{b.bank}</div>
                                <div className="text-amber-600 text-lg mt-1">a.n. {b.accountName}</div>
                                <div className="font-mono text-amber-800 text-lg mt-2">{b.accountNumber}</div>
                                {b.note && <div className="text-amber-500 text-lg mt-1">{b.note}</div>}
                              </div>
                              <button
                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition ml-3"
                                onClick={() => copyToClipboard(b.accountNumber, `bank-${i}`)}
                                type="button"
                                title="Salin nomor rekening"
                              >
                                {copiedField === `bank-${i}` ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-amber-600 text-lg">
                            Tidak ada rekening untuk bank yang dipilih
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-900 text-lg mb-2">Instruksi Transfer:</p>
                        <ul className="text-blue-700 text-lg space-y-2">
                          {(paymentInfo.instructions?.transfer || []).map((t, idx) => <li key={idx}>• {t}</li>)}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {method === "EWALLET" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-amber-700 mb-3">Pilih E-Wallet</label>
                    <select 
                      className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                      value={selectedEwallet} 
                      onChange={e => setSelectedEwallet(e.target.value)}
                    >
                      <option value="">Pilih E-Wallet</option>
                      {EWALLET_OPTIONS.map(ewallet => (
                        <option key={ewallet.value} value={ewallet.value} className="bg-white text-amber-900">
                          {ewallet.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEwallet && (
                    <>
                      <p className="font-semibold text-amber-900 text-lg mb-3">E-Wallet Penjual</p>
                      <div className="space-y-3">
                        {filteredEWallets.length > 0 ? (
                          filteredEWallets.map((w, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-amber-300 rounded-xl bg-amber-50">
                              <div className="flex-1">
                                <div className="font-semibold text-amber-900 text-lg">{w.name}</div>
                                <div className="text-amber-600 text-lg mt-1">a.n. {w.accountName}</div>
                                <div className="font-mono text-amber-800 text-lg mt-2">{w.number}</div>
                              </div>
                              <button
                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition ml-3"
                                onClick={() => copyToClipboard(w.number, `ewallet-${i}`)}
                                type="button"
                                title="Salin nomor e-wallet"
                              >
                                {copiedField === `ewallet-${i}` ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-amber-600 text-lg">
                            Tidak ada e-wallet untuk pilihan yang dipilih
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-900 text-lg mb-2">Instruksi Pembayaran:</p>
                        <ul className="text-blue-700 text-lg space-y-2">
                          {(paymentInfo.instructions?.ewallet || []).map((t, idx) => <li key={idx}>• {t}</li>)}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {method !== "COD" && method !== "" && (
                <div className="mt-6">
                  <label className="block font-semibold text-amber-900 mb-3 text-lg">
                    Upload Bukti Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={onProofChange}
                    className="w-full px-3 py-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-amber-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                  />
                  {proofPreview && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <img
                        src={proofPreview}
                        alt="Bukti pembayaran"
                        className="max-h-32 border border-amber-300 rounded-lg mx-auto"
                      />
                      <p className="text-center text-green-600 text-lg font-medium mt-3">Bukti pembayaran siap dikirim</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Ringkasan Total */}
            <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <h2 className="text-xl font-semibold mb-6 text-amber-900">Ringkasan Total</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-amber-700 text-lg">
                  <span>Subtotal Barang</span>
                  <span>Rp {itemsTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-amber-700 text-lg">
                  <span>Ongkir ({courierLabel})</span>
                  <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-amber-200 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-900 text-xl">Total Pembayaran</span>
                    <span className="font-bold text-amber-900 text-2xl">Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl font-bold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg text-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={submitCheckout}
              disabled={!method || !courier || !addressId || isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Buat Pesanan & Simpan Pembayaran"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}