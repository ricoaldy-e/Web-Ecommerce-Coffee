// src/components/home/BestSellers.jsx
"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import ProductCard from "@/components/products/ProductCard"

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

  // Load items
  useEffect(() => {
    let stop = false
    const load = async () => {
      try {
        let res = await fetch("/api/products/best-sellers?limit=8", { cache: "no-store" })
        if (!res.ok) res = await fetch("/api/products", { cache: "no-store" })
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error("Invalid response")
        if (!stop) setItems(data.slice(0, 8))
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
          href="/products"
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
