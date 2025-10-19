"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Package, ShoppingCart, CreditCard, Award, Plus, Minus } from "lucide-react"

const productsData = [
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
    name: "Kopi Toraja Arabima",
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
    id: 3,
    name: "Kopi Kintamani Bali",
    image: "/products/kintamani.png",
    price: 112000,
    sold: 198,
    stock: 45,
    category: "Arabika",
    desc: "Kopi Bali dengan rasa citrus segar, acidity seimbang, dan aroma buah-buahan.",
    spec: "Asal: Bali, 1200-1500 mdpl, Proses: Washed",
  },
  {
    id: 4,
    name: "Kopi Flores Bajawa Organic",
    image: "/products/flores.png",
    price: 108000,
    sold: 167,
    stock: 37,
    category: "Arabika",
    desc: "Kopi Flores organik dengan karakter manis, aroma rempah, dan body yang medium.",
    spec: "Asal: Bajawa, NTT, 1200-1700 mdpl, Proses: Full Wash",
  },
  {
    id: 5,
    name: "Ethiopia Yirgacheffe",
    image: "/products/ethiopia.png",
    price: 145000,
    sold: 189,
    stock: 25,
    category: "Arabika",
    desc: "Kopi Ethiopia dengan aroma floral, rasa citrus, dan aftertaste wine yang unik.",
    spec: "Asal: Ethiopia, 1800-2200 mdpl, Proses: Washed",
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
    id: 7,
    name: "Tanzania Peaberry",
    image: "/products/tanzania.png",
    price: 148000,
    sold: 98,
    stock: 19,
    category: "Spesial",
    desc: "Kopi Tanzania peaberry dengan bright acidity, fruity notes, dan clean finish.",
    spec: "Asal: Tanzania, 1400-1800 mdpl, Proses: Washed",
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
    id: 9,
    name: "Brazil Santos Natural",
    image: "/products/brazil.png",
    price: 95000,
    sold: 312,
    stock: 52,
    category: "Arabika",
    desc: "Kopi Brazil dengan body medium, rasa chocolate, dan low acidity yang smooth.",
    spec: "Asal: Brazil, 800-1300 mdpl, Proses: Natural",
  },
  {
    id: 10,
    name: "Guatemala Antigua",
    image: "/products/guatemala.png",
    price: 128000,
    sold: 178,
    stock: 29,
    category: "Arabika",
    desc: "Kopi Guatemala dengan cita rasa spicy, cocoa, dan aroma smoky yang khas.",
    spec: "Asal: Guatemala, 1500-1700 mdpl, Proses: Washed",
  },
  {
    id: 11,
    name: "Costa Rica Tarrazu",
    image: "/products/costarica.png",
    price: 142000,
    sold: 145,
    stock: 18,
    category: "Spesial",
    desc: "Kopi Costa Rica dengan acidity crisp, citrus notes, dan clean aftertaste.",
    spec: "Asal: Costa Rica, 1200-1700 mdpl, Proses: Honey",
  },
  {
    id: 12,
    name: "Peru Organic",
    image: "/products/peru.png",
    price: 118000,
    sold: 167,
    stock: 42,
    category: "Arabika",
    desc: "Kopi Peru organik dengan certified organic, nutty flavor, dan mild acidity.",
    spec: "Asal: Peru, Certified Organic, Proses: Washed",
  },
  {
    id: 13,
    name: "Hawaii Kona Premium",
    image: "/products/hawaii.png",
    price: 285000,
    sold: 89,
    stock: 12,
    category: "Spesial",
    desc: "Kopi Hawaii premium dengan rasa mild, slightly sweet, dan aroma floral.",
    spec: "Asal: Hawaii, 800-1500 mdpl, Proses: Washed",
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
    id: 16,
    name: "Breakfast Blend",
    image: "/products/breakfast.png",
    price: 98000,
    sold: 278,
    stock: 38,
    category: "Blend",
    desc: "Blend untuk pagi hari dengan medium body, balanced acidity, dan aroma nutty.",
    spec: "Komposisi: 80% Arabika, 20% Robusta",
  },
  {
    id: 17,
    name: "French Roast Dark",
    image: "/products/french.png",
    price: 108000,
    sold: 223,
    stock: 42,
    category: "Blend",
    desc: "Dark roast dengan smoky flavor, bold body, dan aftertaste caramel.",
    spec: "Komposisi: 60% Arabika, 40% Robusta",
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
    id: 19,
    name: "Vanilla Latte Instant",
    image: "/products/vanilla.png",
    price: 68000,
    sold: 445,
    stock: 57,
    category: "Susu",
    desc: "Kopi instan vanilla latte dengan essence vanilla alami dan creamy texture.",
    spec: "Netto: 180g, Rasa: Vanilla",
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
  },
  {
    id: 21,
    name: "Sumatra Mandheling",
    image: "/products/mandheling.png",
    price: 118000,
    sold: 278,
    stock: 41,
    category: "Arabika",
    desc: "Kopi Sumatra dengan body full, earthy flavor, dan aftertaste herbal yang kompleks.",
    spec: "Asal: Sumatera Utara, 1100-1300 mdpl, Proses: Wet Hull",
  },
  {
    id: 22,
    name: "Mexico Chiapas",
    image: "/products/mexico.png",
    price: 118000,
    sold: 134,
    stock: 26,
    category: "Arabika",
    desc: "Kopi Mexico dengan nutty flavor, chocolate notes, dan acidity mild.",
    spec: "Asal: Chiapas, Mexico, 1000-1400 mdpl, Proses: Washed",
  },
  {
    id: 23,
    name: "India Monsooned Malabar",
    image: "/products/india.png",
    price: 112000,
    sold: 189,
    stock: 38,
    category: "Arabika",
    desc: "Kopi India dengan proses monsoon, low acidity, dan spicy aroma yang unik.",
    spec: "Asal: India, Proses: Monsooned",
  },
  {
    id: 24,
    name: "Vietnam Robusta Premium",
    image: "/products/vietnam.png",
    price: 85000,
    sold: 234,
    stock: 45,
    category: "Robusta",
    desc: "Robusta Vietnam dengan bold flavor, high caffeine, cocok untuk vietnamese coffee.",
    spec: "Asal: Vietnam, 500-800 mdpl, Proses: Natural",
  },
  {
    id: 25,
    name: "Papua New Guinea",
    image: "/products/papua.png",
    price: 132000,
    sold: 156,
    stock: 31,
    category: "Spesial",
    desc: "Kopi Papua New Guinea dengan earthy flavor, low acidity, dan aroma fruity.",
    spec: "Asal: Papua New Guinea, 1400-1800 mdpl, Proses: Washed",
  },
  {
    id: 26,
    name: "Anaerobic Fermentation",
    image: "/products/anaerobic.png",
    price: 168000,
    sold: 78,
    stock: 16,
    category: "Spesial",
    desc: "Kopi dengan proses anaerobic fermentation untuk flavor yang unik dan complex.",
    spec: "Proses: Anaerobic Fermentation, Asal: Colombia",
  },
  {
    id: 27,
    name: "Natural Process Ethiopia",
    image: "/products/natural-ethiopia.png",
    price: 148000,
    sold: 112,
    stock: 27,
    category: "Spesial",
    desc: "Kopi Ethiopia proses natural dengan intense fruity flavor dan winey body.",
    spec: "Asal: Ethiopia, Proses: Natural",
  },
  {
    id: 28,
    name: "Honey Process Costa Rica",
    image: "/products/honey-costa.png",
    price: 138000,
    sold: 98,
    stock: 23,
    category: "Spesial",
    desc: "Kopi Costa Rica proses honey dengan sweetness alami dan balanced acidity.",
    spec: "Asal: Costa Rica, Proses: Honey",
  },
  {
    id: 29,
    name: "Caramel Macchiato",
    image: "/products/caramel.png",
    price: 75000,
    sold: 312,
    stock: 41,
    category: "Susu",
    desc: "Kopi instan dengan rasa caramel manis dan creamy milk foam.",
    spec: "Netto: 180g, Rasa: Caramel",
  },
  {
    id: 30,
    name: "Mocha Coffee",
    image: "/products/mocha.png",
    price: 78000,
    sold: 267,
    stock: 36,
    category: "Susu",
    desc: "Perpaduan sempurna kopi dan cokelat dengan rasa yang rich dan creamy.",
    spec: "Netto: 200g, Rasa: Mocha",
  },
  {
    id: 31,
    name: "Cappuccino Instant",
    image: "/products/cappuccino.png",
    price: 72000,
    sold: 334,
    stock: 52,
    category: "Susu",
    desc: "Kopi instan cappuccino dengan foam creamy dan rasa yang balanced.",
    spec: "Netto: 180g, Rasa: Cappuccino",
    isBestSeller: true,
  },
  {
    id: 32,
    name: "Irish Cream Coffee",
    image: "/products/irish.png",
    price: 82000,
    sold: 189,
    stock: 38,
    category: "Susu",
    desc: "Kopi dengan rasa Irish cream yang creamy dengan hint of whiskey flavor.",
    spec: "Netto: 200g, Rasa: Irish Cream",
  },
  {
    id: 33,
    name: "Swiss Water Decaf",
    image: "/products/decaf.png",
    price: 138000,
    sold: 156,
    stock: 28,
    category: "Spesial",
    desc: "Kopi tanpa kafein dengan proses Swiss Water, rasa tetap terjaga.",
    spec: "Asal: Colombia, Process: Swiss Water Decaf",
  },
  {
    id: 34,
    name: "Organic Mexico",
    image: "/products/organic-mexico.png",
    price: 122000,
    sold: 123,
    stock: 32,
    category: "Arabika",
    desc: "Kopi organik Mexico dengan certified organic, clean taste, dan floral notes.",
    spec: "Asal: Mexico, Certified Organic, Proses: Washed",
  },
  {
    id: 35,
    name: "Nicaragua Maragogipe",
    image: "/products/nicaragua.png",
    price: 152000,
    sold: 89,
    stock: 21,
    category: "Spesial",
    desc: "Kopi Nicaragua dengan varietas Maragogipe (elephant beans), mild dan aromatic.",
    spec: "Asal: Nicaragua, 1200-1500 mdpl, Proses: Washed",
  },
  {
    id: 36,
    name: "El Salvador Pacamara",
    image: "/products/elsalvador.png",
    price: 142000,
    sold: 76,
    stock: 24,
    category: "Spesial",
    desc: "Kopi El Salvador varietas Pacamara dengan complex flavor dan fruity notes.",
    spec: "Asal: El Salvador, 1200-1600 mdpl, Proses: Honey",
  },
  {
    id: 37,
    name: "Honduras SHG",
    image: "/products/honduras.png",
    price: 108000,
    sold: 134,
    stock: 37,
    category: "Arabika",
    desc: "Kopi Honduras Strictly High Grown dengan balanced acidity dan sweet finish.",
    spec: "Asal: Honduras, 1200-1500 mdpl, Proses: Washed",
  },
  {
    id: 38,
    name: "Panama Geisha",
    image: "/products/panama.png",
    price: 385000,
    sold: 45,
    stock: 6,
    category: "Spesial",
    desc: "Kopi Panama varietas Geisha yang legendaris dengan floral aroma dan complex taste.",
    spec: "Asal: Panama, 1600-1800 mdpl, Proses: Washed",
    isBestSeller: true,
  },
  {
    id: 39,
    name: "Dominican Republic",
    image: "/products/dominican.png",
    price: 98000,
    sold: 112,
    stock: 43,
    category: "Arabika",
    desc: "Kopi Dominican Republic dengan mild flavor, low acidity, dan smooth body.",
    spec: "Asal: Dominican Republic, 800-1200 mdpl, Proses: Washed",
  },
  {
    id: 40,
    name: "Bolivia Caranavi",
    image: "/products/bolivia.png",
    price: 132000,
    sold: 87,
    stock: 29,
    category: "Arabika",
    desc: "Kopi Bolivia dengan chocolate notes, citrus acidity, dan clean aftertaste.",
    spec: "Asal: Bolivia, 1400-1600 mdpl, Proses: Washed",
  },
  {
    id: 41,
    name: "Kopi Lampung Robusta Gold",
    image: "/products/lampung.png",
    price: 82000,
    sold: 289,
    stock: 39,
    category: "Robusta",
    desc: "Robusta Lampung premium dengan cita rasa bold, pahit berkarakter, dan aroma earthy.",
    spec: "Asal: Lampung, 400-800 mdpl, Proses: Natural",
  },
  {
    id: 42,
    name: "Kopi Malabar Natural",
    image: "/products/malabar.png",
    price: 128000,
    sold: 134,
    stock: 19,
    category: "Spesial",
    desc: "Kopi Jawa Barat dengan proses natural, rasa buah-buahan tropis, dan body winey.",
    spec: "Asal: Jawa Barat, 1400-1600 mdpl, Proses: Natural",
  },
  {
    id: 43,
    name: "Kopi Aceh Gayo Wine",
    image: "/products/gayo-wine.png",
    price: 142000,
    sold: 98,
    stock: 15,
    category: "Spesial",
    desc: "Limited edition dengan proses wine, rasa kompleks, dan aroma fermented fruit.",
    spec: "Asal: Aceh, 1600-1800 mdpl, Proses: Wine",
  },
  {
    id: 44,
    name: "Kopi Bali Kintamani Honey",
    image: "/products/bali-honey.png",
    price: 132000,
    sold: 156,
    stock: 22,
    category: "Spesial",
    desc: "Kopi Bali proses honey dengan sweetness alami dan acidity yang bright.",
    spec: "Asal: Bali, 1300-1600 mdpl, Proses: Honey",
  },
  {
    id: 45,
    name: "Kopi Luwak Premium",
    image: "/products/luwak.png",
    price: 185000,
    sold: 78,
    stock: 12,
    category: "Spesial",
    desc: "Kopi luwak asli dengan proses alami, rasa smooth, dan rendah acidity.",
    spec: "Asal: Blend Premium, Proses: Natural Luwak",
  },
  {
    id: 46,
    name: "Kopi Susu Vanilla",
    image: "/products/vanilla-susu.png",
    price: 68000,
    sold: 334,
    stock: 57,
    category: "Susu",
    desc: "Kopi susu dengan essence vanilla alami, creamy dan aroma yang menggoda.",
    spec: "Netto: 200g, Rasa: Vanilla",
  },
  {
    id: 47,
    name: "Kopi Aceh Gayo Organic",
    image: "/products/gayo-organic.png",
    price: 118000,
    sold: 189,
    stock: 31,
    category: "Arabika",
    desc: "Kopi Gayo certified organic, bebas pestisida, dengan cita rasa pure dan clean.",
    spec: "Asal: Aceh, 1400-1700 mdpl, Certified Organic",
  },
  {
    id: 48,
    name: "Blend Afternoon Delight",
    image: "/products/afternoon-blend.png",
    price: 95000,
    sold: 223,
    stock: 47,
    category: "Blend",
    desc: "Blend khusus sore hari dengan cita rasa smooth, rendah acidity, dan aroma nutty.",
    spec: "Komposisi: 80% Arabika, 20% Robusta",
    isBestSeller: true,
  },
  {
    id: 49,
    name: "Coconut Coffee",
    image: "/products/coconut.png",
    price: 68000,
    sold: 267,
    stock: 45,
    category: "Susu",
    desc: "Perpaduan kopi dan coconut milk dengan rasa tropis yang menyegarkan.",
    spec: "Netto: 180g, Rasa: Coconut",
  },
  {
    id: 50,
    name: "Premium Gold Blend",
    image: "/products/gold-blend.png",
    price: 132000,
    sold: 178,
    stock: 33,
    category: "Blend",
    desc: "Blend premium dengan komposisi kopi terbaik untuk experience maksimal.",
    spec: "Komposisi: 90% Arabika Specialty, 10% Robusta Premium",
    isBestSeller: true,
  }
]

const categories = [
  { id: 1, name: "Semua Kategori", slug: "" },
  { id: 2, name: "Arabika", slug: "arabika" },
  { id: 3, name: "Robusta", slug: "robusta" },
  { id: 4, name: "Spesial", slug: "spesial" },
  { id: 5, name: "Blend", slug: "blend" }
];
export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalType, setModalType] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [filterStockOnly, setFilterStockOnly] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Cek status login
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

  // Fungsi requireLogin
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

  // Fungsi addToCart dengan quantity
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

  // Fungsi handleBuyNow dengan quantity
  const handleBuyNow = async (p, qty = 1) => {
    if (p.stock <= 0) return

    try {
      sessionStorage.setItem("buyNowItem", JSON.stringify({
        productId: p.id,
        qty: qty,
        name: p.name,
        price: p.price
      }))
    } catch {}

    const nextUrl = "/checkout/confirm?buynow=1"
    const ok = await requireLogin(nextUrl)
    if (!ok) return
    window.location.href = nextUrl
  }

  // Filter products dengan tab aktif
  useEffect(() => {
    setLoading(true)
    
    let filtered = productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase()) ||
                           product.desc.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStock = !filterStockOnly || product.stock > 0
      
      // Filter berdasarkan tab aktif
      const matchesTab = 
        activeTab === "all" ? true :
        activeTab === "best-seller" ? product.isBestSeller : true
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesTab
    })

    // Apply sorting
    if (sortOption === "priceLowHigh") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortOption === "priceHighLow") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortOption === "soldHighLow") {
      filtered.sort((a, b) => b.sold - a.sold)
    }

    setProducts(filtered)
    setLoading(false)
  }, [query, selectedCategory, sortOption, priceRange, filterStockOnly, activeTab])

  const handleAddToCart = (product) => {
    setSelectedProduct(product)
    setModalType("cart")
    setQuantity(1)
  }

  const handleBuyClick = (product) => {
    setSelectedProduct(product)
    setModalType("buy")
    setQuantity(1)
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setModalType("")
    setQuantity(1)
  }

  const resetFilters = () => {
    setSortOption("default")
    setPriceRange([0, 500000])
    setFilterStockOnly(false)
    setActiveTab("all")
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

  // Fungsi untuk handle tombol di modal
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Katalog Produk Kopi</h1>
          <p className="text-amber-100">Temukan varian kopi terbaik untuk setiap momen harimu</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari produk kopi..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl bg-white text-amber-800 placeholder-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-xl bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug} className="text-amber-800">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Button */}
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
        {/* Tabs Section */}
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

        {/* Login Warning untuk user yang belum login */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-800 font-semibold text-lg">Login untuk membeli produk</h3>
                <p className="text-blue-600 text-sm">
                  Silakan login untuk menambahkan produk ke keranjang dan melakukan pembelian
                </p>
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

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-amber-700">
            Menampilkan {products.length} dari {productsData.length} produk
            {query && ` untuk "${query}"`}
            {selectedCategory && ` dalam kategori ${categories.find(c => c.slug === selectedCategory)?.name}`}
            {activeTab === "best-seller" && " • Best Seller"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-amber-700 mt-4">Memuat produk...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-amber-600">
              {query ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.` : 'Coba ubah filter pencarian Anda.'}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => {
              const soldOut = p.stock <= 0

              return (
                <div key={p.id} className={`bg-white rounded-2xl p-4 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 ${soldOut ? "opacity-60" : "hover:scale-105"}`}>
                  
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
              )
            })}
          </div>
        )}
      </main>

      {/* Modal untuk Add to Cart dan Beli - SAMA PERSIS */}
      {selectedProduct && (modalType === "cart" || modalType === "buy") && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1"
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

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-full md:w-96 bg-gradient-to-b from-amber-50 to-orange-50 p-6 shadow-2xl border-l-4 border-amber-300 overflow-auto rounded-l-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" />
                Filter Produk
              </h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-amber-900">
              {/* Sort Option */}
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

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold mb-2">Rentang Harga (Rp)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="w-1/2 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  />
                  <input
                    type="number"
                    className="w-1/2 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Min: Rp {priceRange[0].toLocaleString("id-ID")} — Max: Rp {priceRange[1].toLocaleString("id-ID")}
                </p>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stockOnly"
                  checked={filterStockOnly}
                  onChange={(e) => setFilterStockOnly(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="stockOnly" className="text-sm font-semibold">
                  Tampilkan produk tersedia saja
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition"
                >
                  Terapkan
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border-2 border-amber-300 rounded-xl font-semibold text-amber-800 bg-white hover:bg-amber-50 transition shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilterPanel(false)}
          />
        </div>
      )}
    </div>
  )
}