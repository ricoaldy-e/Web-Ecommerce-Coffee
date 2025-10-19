// src/app/products/page.js
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Package, ShoppingCart, CreditCard, Star, Heart, Plus, Minus, Award, Tag } from "lucide-react"

// Data produk lengkap dengan rating, best seller, dan promo
const productsData = [
  {
    id: 1,
    name: "Kopi Gayo Arabika Premium",
    image: "/products/gayo.png",
    price: 120000,
    promoPrice: 102000,
    sold: 367,
    stock: 64,
    category: "Arabika",
    desc: "Kopi Gayo khas Aceh dengan cita rasa kompleks, aroma floral, dan aftertaste yang panjang.",
    spec: "Asal: Aceh Tengah, 1400-1600 mdpl, Proses: Full Wash",
    rating: 4.8,
    isPromo: true,
    isBestSeller: true,
    discount: 15
  },
  {
    id: 2,
    name: "Kopi Toraja Arabika",
    image: "/products/toraja.png",
    price: 110000,
    sold: 289,
    stock: 42,
    category: "Arabika",
    desc: "Cita rasa earthy, rempah-rempah, dan aftertaste cokelat lembut dari pegunungan Toraja.",
    spec: "Asal: Sulawesi Selatan, 1000-1500 mdpl, Proses: Semi Wash",
    rating: 4.7,
    isBestSeller: true,
    isPromo: false
  },
  {
    id: 3,
    name: "Kopi Kintamani Bali",
    image: "/products/kintamani.png",
    price: 115000,
    sold: 198,
    stock: 45,
    category: "Arabika",
    desc: "Kopi Bali dengan rasa citrus segar, acidity seimbang, dan aroma buah-buahan.",
    spec: "Asal: Bali, 1200-1500 mdpl, Proses: Washed",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 4,
    name: "Kopi Flores Bajawa Organic",
    image: "/products/flores.png",
    price: 105000,
    promoPrice: 94500,
    sold: 156,
    stock: 38,
    category: "Arabika",
    desc: "Kopi Flores organik dengan karakter manis, aroma rempah, dan body yang medium.",
    spec: "Asal: Bajawa, NTT, 1200-1700 mdpl, Proses: Full Wash",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 10
  },
  {
    id: 5,
    name: "Kopi Temanggung Robusta",
    image: "/products/temanggung.png",
    price: 80000,
    sold: 423,
    stock: 72,
    category: "Robusta",
    desc: "Robusta Temanggung dengan cita rasa bold, pahit berkarakter, cocok untuk espresso.",
    spec: "Asal: Temanggung, 800-1200 mdpl, Proses: Natural",
    rating: 4.4,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 6,
    name: "Ethiopia Yirgacheffe",
    image: "/products/ethiopia.png",
    price: 145000,
    promoPrice: 130500,
    sold: 234,
    stock: 28,
    category: "Arabika",
    desc: "Kopi Ethiopia dengan aroma floral, rasa citrus, dan aftertaste wine yang unik.",
    spec: "Asal: Ethiopia, 1800-2200 mdpl, Proses: Washed",
    rating: 4.9,
    isPromo: true,
    isBestSeller: true,
    discount: 10
  },
  {
    id: 7,
    name: "Colombia Supremo",
    image: "/products/colombia.png",
    price: 135000,
    sold: 312,
    stock: 56,
    category: "Arabika",
    desc: "Kopi Colombia grade tertinggi dengan cita rasa nutty, caramel, dan acidity balanced.",
    spec: "Asal: Colombia, 1200-1800 mdpl, Proses: Washed",
    rating: 4.7,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 8,
    name: "Brazil Santos Natural",
    image: "/products/brazil.png",
    price: 95000,
    promoPrice: 80750,
    sold: 278,
    stock: 61,
    category: "Arabika",
    desc: "Kopi Brazil dengan body medium, rasa chocolate, dan low acidity yang smooth.",
    spec: "Asal: Brazil, 800-1300 mdpl, Proses: Natural",
    rating: 4.5,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 9,
    name: "Kopi Luwak Premium",
    image: "/products/luwak.png",
    price: 450000,
    promoPrice: 382500,
    sold: 89,
    stock: 15,
    category: "Spesial",
    desc: "Kopi luwak asli dengan proses alami, rasa smooth, dan rendah acidity.",
    spec: "Asal: Blend Premium, Proses: Natural Luwak",
    rating: 4.9,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 10,
    name: "Jamaica Blue Mountain",
    image: "/products/jamaica.png",
    price: 650000,
    sold: 45,
    stock: 8,
    category: "Spesial",
    desc: "Kopi legendaris Jamaica dengan mild flavor, no bitterness, dan aroma nutty.",
    spec: "Asal: Jamaica, 300-1500 mdpl, Proses: Washed",
    rating: 5.0,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 11,
    name: "Kopi Susu Gula Aren",
    image: "/products/aren.png",
    price: 65000,
    sold: 567,
    stock: 124,
    category: "Susu",
    desc: "Kopi instan dengan gula aren asli, creamy, dan rasa karamel alami.",
    spec: "Netto: 200g, Rasa: Original",
    rating: 4.6,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 12,
    name: "Italian Espresso Blend",
    image: "/products/italian.png",
    price: 125000,
    promoPrice: 112500,
    sold: 289,
    stock: 47,
    category: "Blend",
    desc: "Blend ala Italia dengan crema tebal, body kuat, cocok untuk espresso.",
    spec: "Komposisi: 70% Arabika, 30% Robusta",
    rating: 4.8,
    isPromo: true,
    isBestSeller: true,
    discount: 10
  },
  {
    id: 13,
    name: "Kenya AA Premium",
    image: "/products/kenya.png",
    price: 155000,
    sold: 167,
    stock: 22,
    category: "Spesial",
    desc: "Kopi Kenya grade AA dengan acidity bright, berry notes, dan wine-like finish.",
    spec: "Asal: Kenya, 1500-2100 mdpl, Proses: Washed",
    rating: 4.8,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 14,
    name: "Guatemala Antigua",
    image: "/products/guatemala.png",
    price: 128000,
    promoPrice: 115200,
    sold: 145,
    stock: 29,
    category: "Arabika",
    desc: "Kopi Guatemala dengan cita rasa spicy, cocoa, dan aroma smoky yang khas.",
    spec: "Asal: Guatemala, 1500-1700 mdpl, Proses: Washed",
    rating: 4.7,
    isPromo: true,
    isBestSeller: false,
    discount: 10
  },
  {
    id: 15,
    name: "Sumatra Mandheling",
    image: "/products/mandheling.png",
    price: 118000,
    promoPrice: 100300,
    sold: 234,
    stock: 41,
    category: "Arabika",
    desc: "Kopi Sumatra dengan body full, earthy flavor, dan aftertaste herbal yang kompleks.",
    spec: "Asal: Sumatera Utara, 1100-1300 mdpl, Proses: Wet Hull",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 16,
    name: "Costa Rica Tarrazu",
    image: "/products/costarica.png",
    price: 142000,
    promoPrice: 127800,
    sold: 123,
    stock: 18,
    category: "Spesial",
    desc: "Kopi Costa Rica dengan acidity crisp, citrus notes, dan clean aftertaste.",
    spec: "Asal: Costa Rica, 1200-1700 mdpl, Proses: Honey",
    rating: 4.7,
    isPromo: true,
    isBestSeller: false,
    discount: 10
  },
  {
    id: 17,
    name: "Vietnam Robusta Premium",
    image: "/products/vietnam.png",
    price: 85000,
    sold: 312,
    stock: 45,
    category: "Robusta",
    desc: "Robusta Vietnam dengan bold flavor, high caffeine, cocok untuk vietnamese coffee.",
    spec: "Asal: Vietnam, 500-800 mdpl, Proses: Natural",
    rating: 4.4,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 18,
    name: "Hawaii Kona Premium",
    image: "/products/hawaii.png",
    price: 285000,
    promoPrice: 242250,
    sold: 78,
    stock: 12,
    category: "Spesial",
    desc: "Kopi Hawaii premium dengan rasa mild, slightly sweet, dan aroma floral.",
    spec: "Asal: Hawaii, 800-1500 mdpl, Proses: Washed",
    rating: 4.8,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 19,
    name: "Breakfast Blend",
    image: "/products/breakfast.png",
    price: 98000,
    promoPrice: 83300,
    sold: 189,
    stock: 38,
    category: "Blend",
    desc: "Blend untuk pagi hari dengan medium body, balanced acidity, dan aroma nutty.",
    spec: "Komposisi: 80% Arabika, 20% Robusta",
    rating: 4.5,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 20,
    name: "Vanilla Latte Instant",
    image: "/products/vanilla.png",
    price: 68000,
    promoPrice: 57800,
    sold: 267,
    stock: 57,
    category: "Susu",
    desc: "Kopi instan vanilla latte dengan essence vanilla alami dan creamy texture.",
    spec: "Netto: 180g, Rasa: Vanilla",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 21,
    name: "Hazelnut Coffee",
    image: "/products/hazelnut.png",
    price: 72000,
    sold: 334,
    stock: 48,
    category: "Susu",
    desc: "Perpaduan kopi dan hazelnut dengan aroma kacang yang menggoda.",
    spec: "Netto: 200g, Rasa: Hazelnut",
    rating: 4.5,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 22,
    name: "French Roast Dark",
    image: "/products/french.png",
    price: 108000,
    sold: 156,
    stock: 42,
    category: "Blend",
    desc: "Dark roast dengan smoky flavor, bold body, dan aftertaste caramel.",
    spec: "Komposisi: 60% Arabika, 40% Robusta",
    rating: 4.4,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 23,
    name: "Tanzania Peaberry",
    image: "/products/tanzania.png",
    price: 148000,
    promoPrice: 125800,
    sold: 98,
    stock: 19,
    category: "Spesial",
    desc: "Kopi Tanzania peaberry dengan bright acidity, fruity notes, dan clean finish.",
    spec: "Asal: Tanzania, 1400-1800 mdpl, Proses: Washed",
    rating: 4.7,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 24,
    name: "Peru Organic",
    image: "/products/peru.png",
    price: 118000,
    sold: 134,
    stock: 42,
    category: "Arabika",
    desc: "Kopi Peru organik dengan certified organic, nutty flavor, dan mild acidity.",
    spec: "Asal: Peru, Certified Organic, Proses: Washed",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 25,
    name: "Mexico Chiapas",
    image: "/products/mexico.png",
    price: 118000,
    sold: 112,
    stock: 26,
    category: "Arabika",
    desc: "Kopi Mexico dengan nutty flavor, chocolate notes, dan acidity mild.",
    spec: "Asal: Chiapas, Mexico, 1000-1400 mdpl, Proses: Washed",
    rating: 4.4,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 26,
    name: "India Monsooned Malabar",
    image: "/products/india.png",
    price: 112000,
    promoPrice: 95200,
    sold: 145,
    stock: 38,
    category: "Arabika",
    desc: "Kopi India dengan proses monsoon, low acidity, dan spicy aroma yang unik.",
    spec: "Asal: India, Proses: Monsooned",
    rating: 4.3,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 27,
    name: "Papua New Guinea",
    image: "/products/papua.png",
    price: 132000,
    sold: 89,
    stock: 31,
    category: "Spesial",
    desc: "Kopi Papua New Guinea dengan earthy flavor, low acidity, dan aroma fruity.",
    spec: "Asal: Papua New Guinea, 1400-1800 mdpl, Proses: Washed",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 28,
    name: "Anaerobic Fermentation",
    image: "/products/anaerobic.png",
    price: 168000,
    promoPrice: 142800,
    sold: 67,
    stock: 16,
    category: "Spesial",
    desc: "Kopi dengan proses anaerobic fermentation untuk flavor yang unik dan complex.",
    spec: "Proses: Anaerobic Fermentation, Asal: Colombia",
    rating: 4.8,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 29,
    name: "Natural Process Ethiopia",
    image: "/products/natural-ethiopia.png",
    price: 148000,
    sold: 98,
    stock: 27,
    category: "Spesial",
    desc: "Kopi Ethiopia proses natural dengan intense fruity flavor dan winey body.",
    spec: "Asal: Ethiopia, Proses: Natural",
    rating: 4.7,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 30,
    name: "Honey Process Costa Rica",
    image: "/products/honey-costa.png",
    price: 138000,
    promoPrice: 117300,
    sold: 112,
    stock: 23,
    category: "Spesial",
    desc: "Kopi Costa Rica proses honey dengan sweetness alami dan balanced acidity.",
    spec: "Asal: Costa Rica, Proses: Honey",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 31,
    name: "Caramel Macchiato",
    image: "/products/caramel.png",
    price: 75000,
    promoPrice: 63750,
    sold: 289,
    stock: 41,
    category: "Susu",
    desc: "Kopi instan dengan rasa caramel manis dan creamy milk foam.",
    spec: "Netto: 180g, Rasa: Caramel",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 32,
    name: "Mocha Coffee",
    image: "/products/mocha.png",
    price: 78000,
    sold: 234,
    stock: 36,
    category: "Susu",
    desc: "Perpaduan sempurna kopi dan cokelat dengan rasa yang rich dan creamy.",
    spec: "Netto: 200g, Rasa: Mocha",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 33,
    name: "Cappuccino Instant",
    image: "/products/cappuccino.png",
    price: 72000,
    sold: 312,
    stock: 52,
    category: "Susu",
    desc: "Kopi instan cappuccino dengan foam creamy dan rasa yang balanced.",
    spec: "Netto: 180g, Rasa: Cappuccino",
    rating: 4.5,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 34,
    name: "Irish Cream Coffee",
    image: "/products/irish.png",
    price: 82000,
    promoPrice: 69700,
    sold: 167,
    stock: 38,
    category: "Susu",
    desc: "Kopi dengan rasa Irish cream yang creamy dengan hint of whiskey flavor.",
    spec: "Netto: 200g, Rasa: Irish Cream",
    rating: 4.4,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 35,
    name: "Swiss Water Decaf",
    image: "/products/decaf.png",
    price: 138000,
    promoPrice: 117300,
    sold: 123,
    stock: 28,
    category: "Spesial",
    desc: "Kopi tanpa kafein dengan proses Swiss Water, rasa tetap terjaga.",
    spec: "Asal: Colombia, Process: Swiss Water Decaf",
    rating: 4.5,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 36,
    name: "Organic Mexico",
    image: "/products/organic-mexico.png",
    price: 122000,
    sold: 98,
    stock: 32,
    category: "Arabika",
    desc: "Kopi organik Mexico dengan certified organic, clean taste, dan floral notes.",
    spec: "Asal: Mexico, Certified Organic, Proses: Washed",
    rating: 4.4,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 37,
    name: "Nicaragua Maragogipe",
    image: "/products/nicaragua.png",
    price: 152000,
    promoPrice: 129200,
    sold: 67,
    stock: 21,
    category: "Spesial",
    desc: "Kopi Nicaragua dengan varietas Maragogipe (elephant beans), mild dan aromatic.",
    spec: "Asal: Nicaragua, 1200-1500 mdpl, Proses: Washed",
    rating: 4.7,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 38,
    name: "El Salvador Pacamara",
    image: "/products/elsalvador.png",
    price: 142000,
    sold: 56,
    stock: 24,
    category: "Spesial",
    desc: "Kopi El Salvador varietas Pacamara dengan complex flavor dan fruity notes.",
    spec: "Asal: El Salvador, 1200-1600 mdpl, Proses: Honey",
    rating: 4.6,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 39,
    name: "Honduras SHG",
    image: "/products/honduras.png",
    price: 108000,
    promoPrice: 91800,
    sold: 134,
    stock: 37,
    category: "Arabika",
    desc: "Kopi Honduras Strictly High Grown dengan balanced acidity dan sweet finish.",
    spec: "Asal: Honduras, 1200-1500 mdpl, Proses: Washed",
    rating: 4.4,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 40,
    name: "Panama Geisha",
    image: "/products/panama.png",
    price: 385000,
    sold: 34,
    stock: 6,
    category: "Spesial",
    desc: "Kopi Panama varietas Geisha yang legendaris dengan floral aroma dan complex taste.",
    spec: "Asal: Panama, 1600-1800 mdpl, Proses: Washed",
    rating: 4.9,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 41,
    name: "Dominican Republic",
    image: "/products/dominican.png",
    price: 98000,
    promoPrice: 83300,
    sold: 145,
    stock: 43,
    category: "Arabika",
    desc: "Kopi Dominican Republic dengan mild flavor, low acidity, dan smooth body.",
    spec: "Asal: Dominican Republic, 800-1200 mdpl, Proses: Washed",
    rating: 4.3,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  },
  {
    id: 42,
    name: "Bolivia Caranavi",
    image: "/products/bolivia.png",
    price: 132000,
    sold: 89,
    stock: 29,
    category: "Arabika",
    desc: "Kopi Bolivia dengan chocolate notes, citrus acidity, dan clean aftertaste.",
    spec: "Asal: Bolivia, 1400-1600 mdpl, Proses: Washed",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 43,
    name: "Kopi Lampung Robusta Gold",
    image: "/products/lampung.png",
    price: 82000,
    promoPrice: 72160,
    sold: 278,
    stock: 39,
    category: "Robusta",
    desc: "Robusta Lampung premium dengan cita rasa bold, pahit berkarakter, dan aroma earthy.",
    spec: "Asal: Lampung, 400-800 mdpl, Proses: Natural",
    rating: 4.4,
    isPromo: true,
    isBestSeller: false,
    discount: 12
  },
  {
    id: 44,
    name: "Kopi Malabar Natural",
    image: "/products/malabar.png",
    price: 128000,
    promoPrice: 104960,
    sold: 134,
    stock: 19,
    category: "Spesial",
    desc: "Kopi Jawa Barat dengan proses natural, rasa buah-buahan tropis, dan body winey.",
    spec: "Asal: Jawa Barat, 1400-1600 mdpl, Proses: Natural",
    rating: 4.6,
    isPromo: true,
    isBestSeller: false,
    discount: 18
  },
  {
    id: 45,
    name: "Kopi Aceh Gayo Wine",
    image: "/products/gayo-wine.png",
    price: 142000,
    sold: 78,
    stock: 15,
    category: "Spesial",
    desc: "Limited edition dengan proses wine, rasa kompleks, dan aroma fermented fruit.",
    spec: "Asal: Aceh, 1600-1800 mdpl, Proses: Wine",
    rating: 4.7,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 46,
    name: "Kopi Bali Kintamani Honey",
    image: "/products/bali-honey.png",
    price: 132000,
    sold: 112,
    stock: 22,
    category: "Spesial",
    desc: "Kopi Bali proses honey dengan sweetness alami dan acidity yang bright.",
    spec: "Asal: Bali, 1300-1600 mdpl, Proses: Honey",
    rating: 4.6,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 47,
    name: "Kopi Susu Vanilla",
    image: "/products/vanilla-susu.png",
    price: 68000,
    sold: 289,
    stock: 57,
    category: "Susu",
    desc: "Kopi susu dengan essence vanilla alami, creamy dan aroma yang menggoda.",
    spec: "Netto: 200g, Rasa: Vanilla",
    rating: 4.5,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 48,
    name: "Kopi Aceh Gayo Organic",
    image: "/products/gayo-organic.png",
    price: 118000,
    sold: 156,
    stock: 31,
    category: "Arabika",
    desc: "Kopi Gayo certified organic, bebas pestisida, dengan cita rasa pure dan clean.",
    spec: "Asal: Aceh, 1400-1700 mdpl, Certified Organic",
    rating: 4.7,
    isPromo: false,
    isBestSeller: false
  },
  {
    id: 49,
    name: "Blend Afternoon Delight",
    image: "/products/afternoon-blend.png",
    price: 95000,
    sold: 223,
    stock: 47,
    category: "Blend",
    desc: "Blend khusus sore hari dengan cita rasa smooth, rendah acidity, dan aroma nutty.",
    spec: "Komposisi: 80% Arabika, 20% Robusta",
    rating: 4.4,
    isPromo: false,
    isBestSeller: true
  },
  {
    id: 50,
    name: "Coconut Coffee",
    image: "/products/coconut.png",
    price: 68000,
    promoPrice: 57800,
    sold: 189,
    stock: 45,
    category: "Susu",
    desc: "Perpaduan kopi dan coconut milk dengan rasa tropis yang menyegarkan.",
    spec: "Netto: 180g, Rasa: Coconut",
    rating: 4.5,
    isPromo: true,
    isBestSeller: false,
    discount: 15
  }
];

const categories = [
  { id: 1, name: "Semua Kategori", slug: "" },
  { id: 2, name: "Arabika", slug: "arabika" },
  { id: 3, name: "Robusta", slug: "robusta" },
  { id: 4, name: "Spesial", slug: "spesial" },
  { id: 5, name: "Blend", slug: "blend" },
  { id: 6, name: "Contoh", slug: "Contoh" }
];

export default function ProductsPage() {
  const [products, setProducts] = useState(productsData)
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [modalType, setModalType] = useState("") // "cart" or "buy"
  const [sortOption, setSortOption] = useState("default")
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [minRating, setMinRating] = useState(0)
  const [filterStockOnly, setFilterStockOnly] = useState(false)

  // Filter products based on search, category, and filters
  useEffect(() => {
    setLoading(true)
    
    let filtered = productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase()) ||
                           product.desc.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesRating = product.rating >= minRating
      const matchesStock = !filterStockOnly || product.stock > 0
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock
    })

    // Apply sorting
    if (sortOption === "priceLowHigh") {
      filtered.sort((a, b) => (a.isPromo ? a.promoPrice : a.price) - (b.isPromo ? b.promoPrice : b.price))
    } else if (sortOption === "priceHighLow") {
      filtered.sort((a, b) => (b.isPromo ? b.promoPrice : b.price) - (a.isPromo ? a.promoPrice : a.price))
    } else if (sortOption === "ratingHighLow") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortOption === "soldHighLow") {
      filtered.sort((a, b) => b.sold - a.sold)
    }

    setProducts(filtered)
    setLoading(false)
  }, [query, selectedCategory, sortOption, priceRange, minRating, filterStockOnly])

  async function requireLogin(action) {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      if (!isLoggedIn) {
        alert(`❌ Silakan login terlebih dahulu untuk ${action}!`)
        window.location.href = `/auth/login`
        return false
      }
      return true
    } catch {
      window.location.href = `/auth/login`
      return false
    }
  }

  const addToCart = async (product, qty) => {
    if (!requireLogin("menambah ke keranjang")) return
    
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItem = cart.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += qty
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.isPromo ? product.promoPrice : product.price,
          image: product.image,
          quantity: qty,
          stock: product.stock
        })
      }
      
      localStorage.setItem("cart", JSON.stringify(cart))
      alert(`✅ ${qty} ${product.name} berhasil ditambahkan ke keranjang!`)
      setSelectedProduct(null)
      setQuantity(1)
      setModalType("")
      return true
    } catch {
      alert("❌ Gagal menambahkan produk")
      return false
    }
  }

  const handleBuyNow = async (product, qty) => {
    if (!requireLogin("membeli produk")) return
    
    try {
      const buyNowItem = {
        productId: product.id,
        qty: qty,
        name: product.name,
        price: product.isPromo ? product.promoPrice : product.price,
        image: product.image
      }
      sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem))
      window.location.href = "/checkout/confirm?buynow=1"
    } catch {
      alert("❌ Gagal memproses pembelian")
    }
  }

  const handleCartClick = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setModalType("cart")
  }

  const handleBuyClick = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setModalType("buy")
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

  const closeModal = () => {
    setSelectedProduct(null)
    setQuantity(1)
    setModalType("")
  }

  const resetFilters = () => {
    setSortOption("default")
    setPriceRange([0, 500000])
    setMinRating(0)
    setFilterStockOnly(false)
  }

  const getDisplayPrice = (product) => {
    return product.isPromo ? product.promoPrice : product.price
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Katalog Produk</h1>
          <p className="text-amber-100">Temukan 50+ varian kopi terbaik untuk setiap momen harimu</p>
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
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-amber-700">
            Menampilkan {products.length} dari 50 produk
            {query && ` untuk "${query}"`}
            {selectedCategory && ` dalam kategori ${categories.find(c => c.slug === selectedCategory)?.name}`}
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

        {/* Products Grid - UKURAN KECIL PERSIS SEPERTI CONTOH */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => {
              const soldOut = p.stock <= 0
              const displayPrice = getDisplayPrice(p)
              const originalPrice = p.isPromo ? p.price : null

              return (
                <div key={p.id} className={`bg-white rounded-xl p-3 flex flex-col items-center text-center shadow-md hover:shadow-xl transition border border-amber-200 ${soldOut ? "opacity-60" : ""}`}>
                  
                  {/* Product Image with Badges - PERSIS SEPERTI CONTOH */}
                  <div className="relative w-full mb-2">
                    <div className="aspect-square w-full bg-amber-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
                         onClick={() => handleCartClick(p)}>
                      <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                        <Package className="w-8 h-8 text-amber-600" />
                      </div>
                    </div>
                    
                    {/* Best Seller Icon - sangat minimalis di dalam gambar */}
                    {p.isBestSeller && (
                      <div className="absolute top-1 left-1 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-900 p-1 rounded-full shadow-lg border border-amber-300">
                        <Award className="w-3 h-3" fill="currentColor" />
                      </div>
                    )}

                    {/* Promo Badge - Premium Red di dalam gambar */}
                    {p.isPromo && (
                      <div className="absolute top-1 right-1 bg-gradient-to-br from-rose-700 via-red-600 to-rose-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-xl border border-rose-300/40">
                        -{p.discount}%
                      </div>
                    )}
                    
                    {/* Sold Out Badge */}
                    {soldOut && (
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        HABIS
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="font-semibold text-gray-900 text-xs mt-1 cursor-pointer hover:text-amber-700 transition leading-tight min-h-[2.5rem] flex items-center justify-center">
                    {p.name}
                  </h3>

                  {/* Price - PERSIS SEPERTI CONTOH */}
                  {p.isPromo && p.discount ? (
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-red-600 font-bold text-sm">
                        Rp {displayPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-gray-400 text-xs line-through">
                        Rp {originalPrice?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-amber-700 font-bold text-sm mt-1">
                      Rp {displayPrice.toLocaleString("id-ID")}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(p.rating) ? "text-yellow-500" : "text-gray-300"}`}
                        fill={i < Math.floor(p.rating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>

                  {/* Stock & Sold Info */}
                  <p className="text-xs text-gray-600 mb-2 font-medium">Terjual {p.sold} | Stok {p.stock}</p>

                  {/* Action Buttons - PERSIS SEPERTI CONTOH */}
                  {localStorage.getItem("isLoggedIn") ? (
                    <div className="flex gap-1 w-full">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                        }}
                        className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleBuyClick(p)}
                        className="flex-1 px-2 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg text-white text-xs font-semibold hover:from-amber-700 hover:to-amber-800 transition shadow-md"
                        disabled={p.stock <= 0}
                      >
                        {p.stock <= 0 ? "Habis" : "Beli"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                      }}
                      className="w-full px-2 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg text-white text-xs font-semibold hover:from-amber-700 hover:to-amber-800 transition shadow-md"
                    >
                      Lihat Detail
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Cart Modal */}
      {selectedProduct && modalType === "cart" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1"
            >
              ✕
            </button>

            <div className="flex flex-col gap-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl overflow-hidden flex items-center justify-center">
                  <Package className="w-12 h-12 text-amber-600" />
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h2 className="text-xl font-bold text-amber-900 text-center">{selectedProduct.name}</h2>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(selectedProduct.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({selectedProduct.rating}/5) • Terjual {selectedProduct.sold}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm text-center mt-3">
                  {selectedProduct.desc}
                </p>

                {/* Price */}
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-800">Subtotal:</span>
                    <div className="text-right">
                      {selectedProduct.isPromo && (
                        <span className="text-gray-500 text-sm line-through block">
                          Rp {(Number(selectedProduct.price) * quantity).toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-xl font-bold text-amber-700">
                        Rp {(getDisplayPrice(selectedProduct) * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4 p-3 bg-amber-50 rounded-lg">
                  <span className="font-semibold text-amber-800">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center text-amber-900">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= selectedProduct.stock}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    onClick={() => addToCart(selectedProduct, quantity)}
                    disabled={selectedProduct.stock <= 0}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {selectedProduct && modalType === "buy" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-amber-300">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full p-1"
            >
              ✕
            </button>

            <div className="flex flex-col gap-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl overflow-hidden flex items-center justify-center">
                  <Package className="w-12 h-12 text-amber-600" />
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h2 className="text-xl font-bold text-amber-900 text-center">{selectedProduct.name}</h2>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(selectedProduct.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({selectedProduct.rating}/5)
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-800">Total Pembayaran:</span>
                    <div className="text-right">
                      {selectedProduct.isPromo && (
                        <span className="text-gray-500 text-sm line-through block">
                          Rp {(Number(selectedProduct.price) * quantity).toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-xl font-bold text-amber-700">
                        Rp {(getDisplayPrice(selectedProduct) * quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4 p-3 bg-amber-50 rounded-lg">
                  <span className="font-semibold text-amber-800">Jumlah:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center text-amber-900">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= selectedProduct.stock}
                      className="w-8 h-8 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center hover:bg-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    onClick={() => handleBuyNow(selectedProduct, quantity)}
                    disabled={selectedProduct.stock <= 0}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Beli Sekarang
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
                  <option value="ratingHighLow">Rating: Tertinggi</option>
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

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">Rating Minimum</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-300 bg-white text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                >
                  <option value="0">Semua</option>
                  <option value="3">3 ⭐ ke atas</option>
                  <option value="4">4 ⭐ ke atas</option>
                  <option value="4.5">4.5 ⭐ ke atas</option>
                </select>
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