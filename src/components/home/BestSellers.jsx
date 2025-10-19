// src/components/home/BestSellers.jsx
"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ShoppingCart, CreditCard, Award, Package, Plus, Minus } from "lucide-react"

// Data produk best seller dari page.js
const bestSellerProducts = [
  {
    id: 1,
    name: "Kopi Gayo Arabika Premium",
    image: "/products/gayo.png",
    price: 125000,
    sold: 256,
    stock: 42,
    category: "Arabika",
    desc: "Kopi Gayo khas Aceh dengan cita rasa kompleks, aroma floral, dan aftertaste yang panjang.",
    spec: "Asal: Aceh Tengah, 1400-1600 mdpl, Proses: Full Wash",
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Kopi Toraja Arabika",
    image: "/products/toraja.png",
    price: 118000,
    sold: 303,
    stock: 28,
    category: "Arabika",
    desc: "Cita rasa earthy, rempah-rempah, dan aftertaste cokelat lembut dari pegunungan Toraja.",
    spec: "Asal: Sulawesi Selatan, 1000-1500 mdpl, Proses: Semi Wash",
    isBestSeller: true,
  },
  {
    id: 6,
    name: "Kenya AA Premium",
    image: "/products/kenya.png",
    price: 155000,
    sold: 156,
    stock: 22,
    category: "Spesial",
    desc: "Kopi Kenya grade AA dengan acidity bright, berry notes, dan wine-like finish.",
    spec: "Asal: Kenya, 1500-2100 mdpl, Proses: Washed",
    isBestSeller: true,
  },
  {
    id: 8,
    name: "Colombia Supremo",
    image: "/products/colombia.png",
    price: 135000,
    sold: 234,
    stock: 38,
    category: "Arabika",
    desc: "Kopi Colombia grade tertinggi dengan cita rasa nutty, caramel, dan acidity balanced.",
    spec: "Asal: Colombia, 1200-1800 mdpl, Proses: Washed",
    isBestSeller: true,
  },
  {
    id: 14,
    name: "Jamaica Blue Mountain",
    image: "/products/jamaica.png",
    price: 325000,
    sold: 67,
    stock: 8,
    category: "Spesial",
    desc: "Kopi legendaris Jamaica dengan mild flavor, no bitterness, dan aroma nutty.",
    spec: "Asal: Jamaica, 300-1500 mdpl, Proses: Washed",
    isBestSeller: true,
  },
  {
    id: 15,
    name: "Italian Espresso Blend",
    image: "/products/italian.png",
    price: 125000,
    sold: 345,
    stock: 47,
    category: "Blend",
    desc: "Blend ala Italia dengan crema tebal, body kuat, cocok untuk espresso.",
    spec: "Komposisi: 70% Arabika, 30% Robusta",
    isBestSeller: true,
  },
  {
    id: 18,
    name: "Kopi Susu Gula Aren",
    image: "/products/aren.png",
    price: 65000,
    sold: 612,
    stock: 72,
    category: "Susu",
    desc: "Kopi instan dengan gula aren asli, creamy, dan rasa karamel alami.",
    spec: "Netto: 200g, Rasa: Original",
    isBestSeller: true,
  },
  {
    id: 20,
    name: "Hazelnut Coffee",
    image: "/products/hazelnut.png",
    price: 72000,
    sold: 389,
    stock: 48,
    category: "Susu",
    desc: "Perpaduan kopi dan hazelnut dengan aroma kacang yang menggoda.",
    spec: "Netto: 200g, Rasa: Hazelnut",
    isBestSeller: true,
  }
]

// Komponen ProductCard untuk BestSellers
function ProductCard({ p, index, isVisible }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const soldOut = p.stock <= 0

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        const data = await res.json()
        setIsLoggedIn(!!data?.user)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const addToCart = async (productId, qty = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      })
      if (res.status === 401) {
        alert("❌ Login terlebih dahulu untuk menambahkan produk")
        window.location.href = "/auth/login"
        return false
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("❌ " + (err.message || res.status))
        return false
      }
      window.dispatchEvent(new Event("auth:changed"))
      alert(`✅ ${qty} produk berhasil ditambahkan ke keranjang!`)
      return true
    } catch {
      alert("❌ Gagal menambahkan produk")
      return false
    }
  }

  const handleBuyNow = async (product, qty = 1) => {
    if (product.stock <= 0) return

    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: product.id,
        qty: qty,
        name: product.name,
        price: product.price
      }))
    } catch {}

    const nextUrl = "/checkout/confirm?buynow=1"
    const requireLogin = async (nextUrl) => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.user) {
          alert("❌ Login terlebih dahulu.")
          window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`
          return false
        }
        return true
      } catch {
        window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`
        return false
      }
    }

    const ok = await requireLogin(nextUrl)
    if (!ok) return
    window.location.href = nextUrl
  }

  const handleAddToCart = (product) => {
    setSelectedProduct(product)
    setModalType("cart")
    setQuantity(1)
    setShowModal(true)
  }

  const handleBuyClick = (product) => {
    setSelectedProduct(product)
    setModalType("buy")
    setQuantity(1)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    setModalType("")
    setQuantity(1)
  }

  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleModalAction = async () => {
    if (modalType === "cart") {
      const ok = await addToCart(selectedProduct.id, quantity)
      if (ok) {
        closeModal()
      }
    } else if (modalType === "buy") {
      handleBuyNow(selectedProduct, quantity)
      closeModal()
    }
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl p-4 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 ${
          soldOut ? "opacity-60" : "hover:scale-105"
        } ${
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8"
        }`}
        style={{
          transitionDelay: isVisible ? `${index * 100}ms` : "0ms"
        }}
      >
        {/* Product Image */}
        <div className="relative w-full mb-3">
          <div className="aspect-[4/3] w-full bg-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src={p.image} 
              alt={p.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center hidden">
              <Package className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          
          {/* Best Seller Badge */}
          {p.isBestSeller && (
            <div className="absolute top-2 left-2 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
              <Award className="w-3 h-3 inline mr-1" />
              Best
            </div>
          )}
          
          {/* Sold Out Badge */}
          {soldOut && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              HABIS
            </div>
          )}
        </div>

        {/* Product Info - SEMUA TEXT DI CENTER */}
        <div className="flex-1 flex flex-col text-center">
          {/* Nama Produk */}
          <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight line-clamp-2">
            {p.name}
          </h3>

          {/* Harga */}
          <p className="text-amber-700 font-bold text-lg mb-2">
            Rp {p.price.toLocaleString("id-ID")}
          </p>

          {/* Info Penjualan dan Stok - SEJAJAR DI BAWAH HARGA */}
          <div className="flex justify-center items-center gap-4 mb-3 text-xs text-gray-600">
            <span>Terjual {p.sold}</span>
            <span>•</span>
            <span>Stok {p.stock}</span>
          </div>

          {/* Action Buttons - DINAIKKAN KE ATAS SETELAH INFO */}
          <div className="flex gap-2 w-full mt-2">
            {/* Tombol Keranjang - BUKA MODAL SAMA KAYA BELI */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!isLoggedIn) {
                  alert("❌ Login terlebih dahulu untuk menambahkan ke keranjang")
                  window.location.href = "/auth/login"
                  return
                }
                handleAddToCart(p)
              }}
              disabled={soldOut}
              className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Keranjang
            </button>
            
            {/* Tombol Beli - BUKA MODAL UNTUK QUANTITY */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!isLoggedIn) {
                  alert("❌ Login terlebih dahulu untuk membeli produk")
                  window.location.href = "/auth/login"
                  return
                }
                handleBuyClick(p)
              }}
              disabled={soldOut}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-700 to-amber-800 rounded-lg text-white text-sm font-semibold hover:from-amber-800 hover:to-amber-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Beli
            </button>
          </div>
        </div>
      </div>

      {/* Modal untuk Add to Cart dan Beli - BACKGROUND TRANSPARAN */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
          {/* Overlay transparan */}
          <div 
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            onClick={closeModal}
          />
          
          {/* Modal content */}
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300 z-10">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1 transition"
            >
              ✕
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center hidden">
                    <Package className="w-12 h-12 text-amber-600" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-amber-900 text-center">{selectedProduct.name}</h2>
                
                {/* Info Penjualan dan Stok */}
                <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Terjual {selectedProduct.sold}</span>
                  <span>•</span>
                  <span>Stok {selectedProduct.stock}</span>
                </div>

                {/* DESKRIPSI PRODUK YANG JELAS */}
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2 text-center">Deskripsi Produk:</h3>
                  <p className="text-gray-700 text-sm leading-relaxed text-center">
                    {selectedProduct.desc}
                  </p>
                  <p className="text-gray-600 text-xs mt-2 text-center">
                    <strong>Spesifikasi:</strong> {selectedProduct.spec}
                  </p>
                </div>

                {/* QUANTITY SELECTOR */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-800">Jumlah:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-bold text-amber-800 min-w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= selectedProduct.stock}
                        className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold text-amber-800">Total:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-amber-700">
                        Rp {(selectedProduct.price * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleModalAction}
                    disabled={selectedProduct.stock <= 0}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {modalType === "cart" ? (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Tambah ke Keranjang ({quantity})
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Beli Sekarang ({quantity})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function BestSellers({ title = "Best Sellers" }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReduce, setPrefersReduce] = useState(false)
  const sectionRef = useRef(null)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setPrefersReduce(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  // Load items dari data lokal
  useEffect(() => {
    let stop = false
    const load = async () => {
      try {
        // Gunakan data best seller dari array lokal
        if (!stop) setItems(bestSellerProducts.slice(0, 8))
      } catch {
        if (!stop) setItems([])
      } finally {
        if (!stop) setLoading(false)
      }
    }
    load()
    return () => { stop = true }
  }, [])

  // Reveal on scroll
  useEffect(() => {
    if (prefersReduce) {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [prefersReduce])

  return (
    <section
      id="best"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 relative"
    >
      {/* Background lembut */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/60 pointer-events-none rounded-2xl" />

      {/* Header */}
      <div
        className={`relative mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-900 drop-shadow-sm leading-snug">
            {title}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-amber-800/80">
            Pilihan kopi terlaris, disukai pelanggan setia kami ☕
          </p>

          {/* Garis bawah elegan */}
          <div className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-amber-400/50 to-transparent" />
        </div>

        <Link
          href="/products?tab=best-seller"
          className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900 border border-amber-300 hover:border-amber-400 rounded-full px-4 py-2 transition-all hover:shadow-sm whitespace-nowrap"
        >
          Lihat semua →
        </Link>
      </div>

      {/* Grid Produk */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 sm:h-72 bg-gradient-to-b from-amber-100/60 to-amber-50 animate-pulse rounded-2xl border border-amber-100 shadow-sm"
            >
              <div className="h-3/4 bg-amber-200/40 rounded-t-2xl" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-amber-300/40 rounded w-2/3" />
                <div className="h-3 bg-amber-200/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-amber-700 text-center py-10">Belum ada produk tersedia.</p>
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          {items.map((p, idx) => (
            <ProductCard key={p.id} p={p} index={idx} isVisible={isVisible} />
          ))}
        </div>
      )}
    </section>
  )
}