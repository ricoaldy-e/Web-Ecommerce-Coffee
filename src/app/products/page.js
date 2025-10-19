// src/app/products/page.jsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Filter, Package, ShoppingCart, CreditCard, Award, Plus, Minus } from "lucide-react"

export default function ProductsPage() {
  // UI states
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState([{ id: 0, name: "Semua Kategori", slug: "" }])
  const [catLoading, setCatLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [userSetPrice, setUserSetPrice] = useState(false) // <-- flag: user sudah ubah harga
  const [filterStockOnly, setFilterStockOnly] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalType, setModalType] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // ---------- Auth check ----------
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

  async function requireLogin(nextUrl) {
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

  // ---------- Load categories from BE ----------
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" })
        const json = await res.json()
        const list = Array.isArray(json) ? json : json?.categories
        if (!ignore && Array.isArray(list)) {
          setCategories([{ id: 0, name: "Semua Kategori", slug: "" }, ...list])
        }
      } catch (e) {
        console.error("Failed to load categories", e)
      } finally {
        setCatLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  // ---------- Load products from BE whenever filters change ----------
  useEffect(() => {
    let ignore = false
    setLoading(true)
    const controller = new AbortController()

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (selectedCategory) params.set("category", selectedCategory)

    ;(async () => {
      try {
        const res = await fetch(`/api/products?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const rows = await res.json()
        if (!ignore && Array.isArray(rows)) {
          setProducts(rows)

          // === Adaptif: set batas harga otomatis berdasar data terbaru,
          //     TAPI hanya jika user belum mengubah manual (userSetPrice === false)
          if (!userSetPrice && rows.length > 0) {
            const maxPrice = rows.reduce((m, p) => {
              const v = typeof p.price === "string" ? parseFloat(p.price) : Number(p.price || 0)
              return Math.max(m, Number.isFinite(v) ? v : 0)
            }, 0)
            // Naikkan ke kelipatan 50k agar enak dipakai; minimum 500k agar tidak terlalu sempit
            const step = 50000
            const niceMax = Math.max(500000, Math.ceil(maxPrice / step) * step)
            setPriceRange(([min]) => [Math.min(min, 0), niceMax])
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") console.error("Failed to load products", e)
        if (!ignore) setProducts([])
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [query, selectedCategory, userSetPrice])

  // ---------- Client-side derived list (price filter, stock filter, tab, sorting) ----------
  const visibleProducts = useMemo(() => {
    let list = products.filter(p => {
      const priceNum = typeof p.price === "string" ? parseFloat(p.price) : Number(p.price)
      const inPrice = Number.isFinite(priceNum) && priceNum >= priceRange[0] && priceNum <= priceRange[1]
      const inStock = !filterStockOnly || (p.stock ?? 0) > 0
      const tabOK = activeTab === "all" ? true : (activeTab === "best-seller" ? !!p.isBestSeller : true)
      return inPrice && inStock && tabOK
    })

    if (sortOption === "priceLowHigh") {
      list = [...list].sort((a, b) => (parseFloat(a.price) - parseFloat(b.price)))
    } else if (sortOption === "priceHighLow") {
      list = [...list].sort((a, b) => (parseFloat(b.price) - parseFloat(a.price)))
    } else if (sortOption === "soldHighLow") {
      list = [...list].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)))
    }
    return list
  }, [products, sortOption, priceRange, filterStockOnly, activeTab])

  // ---------- Cart / Buy ----------
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

  const handleBuyNow = async (p, qty = 1) => {
    if ((p.stock ?? 0) <= 0) return
    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: p.id, qty, name: p.name, price: p.price
      }))
    } catch {}
    const nextUrl = "/checkout/confirm?buynow=1"
    const ok = await requireLogin(nextUrl)
    if (!ok) return
    window.location.href = nextUrl
  }

  const handleAddToCart = (product) => { setSelectedProduct(product); setModalType("cart"); setQuantity(1) }
  const handleBuyClick   = (product) => { setSelectedProduct(product); setModalType("buy");  setQuantity(1) }
  const closeModal       = () => { setSelectedProduct(null); setModalType(""); setQuantity(1) }

  const resetFilters = () => {
    setSortOption("default")
    setPriceRange([0, 500000])
    setUserSetPrice(false) // reset flag jika user pernah ubah manual
    setFilterStockOnly(false)
    setActiveTab("all")
  }

  const increaseQuantity = () => { if (selectedProduct && quantity < (selectedProduct.stock ?? 0)) setQuantity(q => q + 1) }
  const decreaseQuantity = () => { if (quantity > 1) setQuantity(q => q - 1) }

  const handleModalAction = async () => {
    if (!selectedProduct) return
    if (modalType === "cart") {
      const ok = await addToCart(selectedProduct.id, quantity)
      if (ok) closeModal()
    } else if (modalType === "buy") {
      await handleBuyNow(selectedProduct, quantity)
      closeModal()
    }
  }

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Katalog Produk Kopi</h1>
          <p className="text-amber-100">Temukan varian kopi terbaik untuk setiap momen harimu</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari produk kopi..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl bg-white text-amber-800 placeholder-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category select */}
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={catLoading}
                className="w-full px-4 py-3 border border-amber-300 rounded-xl bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
              >
                {categories.map(cat => (
                  <option key={cat.id ?? cat.slug ?? "all"} value={cat.slug} className="text-amber-800">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilterPanel(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition shadow-md"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "all"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                : "bg-white text-amber-800 border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
            }`}
          >
            <Package className="w-5 h-5" />
            Semua Produk
          </button>

          <button
            onClick={() => setActiveTab("best-seller")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "best-seller"
                ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                : "bg-white text-green-700 border-2 border-green-300 hover:bg-green-50 hover:border-green-400"
            }`}
          >
            <Award className="w-5 h-5" />
            Best Seller
          </button>
        </div>

        {/* Login notice */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-800 font-semibold text-lg">Login untuk membeli produk</h3>
                <p className="text-blue-600 text-sm">Silakan login untuk menambahkan produk ke keranjang dan melakukan pembelian</p>
              </div>
              <button
                onClick={() => window.location.href = "/auth/login"}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Login Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Results info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-amber-700">
            Menampilkan {visibleProducts.length} produk
            {query && ` untuk "${query}"`}
            {selectedCategory && ` dalam kategori ${categories.find(c => c.slug === selectedCategory)?.name}`}
            {activeTab === "best-seller" && " • Best Seller"}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-amber-700 mt-4">Memuat produk...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && visibleProducts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-amber-600">
              {query ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.` : 'Coba ubah filter pencarian Anda.'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && visibleProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map(p => {
              const soldOut = (p.stock ?? 0) <= 0
              const img = p.image || p.imageUrl || "/images/placeholder.png"

              return (
                <div key={p.id} className={`bg-white rounded-2xl p-4 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 ${soldOut ? "opacity-60" : "hover:scale-105"}`}>
                  <div className="relative w-full mb-3">
                    <div className="aspect-[4/3] w-full bg-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center hidden">
                        <Package className="w-12 h-12 text-amber-600" />
                      </div>
                    </div>

                    {p.isBestSeller && (
                      <div className="absolute top-2 left-2 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        <Award className="w-3 h-3 inline mr-1" />
                        Best
                      </div>
                    )}

                    {soldOut && (
                      <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        HABIS
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col text-center">
                    <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight line-clamp-2">{p.name}</h3>
                    <p className="text-amber-700 font-bold text-lg mb-2">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                    <div className="flex justify-center items-center gap-4 mb-3 text-xs text-gray-600">
                      <span>Terjual {p.sold ?? 0}</span>
                      <span>•</span>
                      <span>Stok {p.stock ?? 0}</span>
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isLoggedIn) {
                            alert("❌ Login terlebih dahulu untuk menambahkan ke keranjang")
                            window.location.href = "/auth/login"
                            return
                          }
                          setSelectedProduct(p); setModalType("cart"); setQuantity(1)
                        }}
                        disabled={soldOut}
                        className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Keranjang
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isLoggedIn) {
                            alert("❌ Login terlebih dahulu untuk membeli produk")
                            window.location.href = "/auth/login"
                            return
                          }
                          setSelectedProduct(p); setModalType("buy"); setQuantity(1)
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
              )
            })}
          </div>
        )}
      </main>

      {/* Modal Add to Cart / Beli */}
      {selectedProduct && (modalType === "cart" || modalType === "buy") && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1">✕</button>

            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedProduct.image || selectedProduct.imageUrl || "/images/placeholder.png"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center hidden">
                    <Package className="w-12 h-12 text-amber-600" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-amber-900 text-center">{selectedProduct.name}</h2>

                <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Terjual {selectedProduct.sold ?? 0}</span>
                  <span>•</span>
                  <span>Stok {selectedProduct.stock ?? 0}</span>
                </div>

                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2 text-center">Deskripsi Produk:</h3>
                  <p className="text-gray-700 text-sm leading-relaxed text-center">
                    {selectedProduct.description || selectedProduct.desc || "-"}
                  </p>
                </div>

                <div className="mt-4 p-4 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-800">Jumlah:</span>
                    <div className="flex items-center gap-3">
                      <button onClick={decreaseQuantity} disabled={quantity <= 1} className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-bold text-amber-800 min-w-8 text-center">{quantity}</span>
                      <button onClick={increaseQuantity} disabled={quantity >= (selectedProduct.stock ?? 0)} className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200 transition">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold text-amber-800">Total:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-amber-700">
                        Rp {(Number(selectedProduct.price) * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleModalAction}
                    disabled={(selectedProduct.stock ?? 0) <= 0}
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

      {/* Side Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-full md:w-96 bg-gradient-to-b from-amber-50 to-orange-50 p-6 shadow-2xl border-l-4 border-amber-300 overflow-auto rounded-l-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" />
                Filter Produk
              </h3>
              <button onClick={() => setShowFilterPanel(false)} className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition">✕</button>
            </div>

            <div className="space-y-6 text-amber-900">
              <div>
                <label className="block text-sm font-semibold mb-2">Urutkan</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="priceLowHigh">Harga: Terendah → Tertinggi</option>
                  <option value="priceHighLow">Harga: Tertinggi → Terendah</option>
                  <option value="soldHighLow">Terlaris</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rentang Harga (Rp)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="w-1/2 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                    value={priceRange[0]}
                    onChange={(e) => {
                      setUserSetPrice(true)
                      setPriceRange([parseInt(e.target.value || "0"), priceRange[1]])
                    }}
                  />
                  <input
                    type="number"
                    className="w-1/2 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                    value={priceRange[1]}
                    onChange={(e) => {
                      setUserSetPrice(true)
                      setPriceRange([priceRange[0], parseInt(e.target.value || "0")])
                    }}
                  />
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Min: Rp {priceRange[0].toLocaleString("id-ID")} — Max: Rp {priceRange[1].toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="stockOnly" checked={filterStockOnly} onChange={(e) => setFilterStockOnly(e.target.checked)} className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"/>
                <label htmlFor="stockOnly" className="text-sm font-semibold">Tampilkan produk tersedia saja</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowFilterPanel(false)} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition">Terapkan</button>
                <button
                  onClick={() => {
                    setSortOption("default")
                    setPriceRange([0, 500000])
                    setUserSetPrice(false) // reset agar adaptif lagi setelah fetch berikutnya
                    setFilterStockOnly(false)
                    setActiveTab("all")
                  }}
                  className="flex-1 py-3 border-2 border-amber-300 rounded-xl font-semibold text-amber-800 bg-white hover:bg-amber-50 transition shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilterPanel(false)} />
        </div>
      )}
    </div>
  )
}