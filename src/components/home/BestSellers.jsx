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

  // Reveal on view (or immediately if reduce motion)
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
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [prefersReduce])

  return (
    <section
      id="best"
      ref={sectionRef}
      className="mt-25 mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className={`mb-4 flex items-end justify-between gap-3 animate-on-scroll fade-in-up ${isVisible ? "animated" : ""}`}>
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        <Link
          href="/products"
          aria-label="Lihat semua produk"
          className="text-sm text-neutral-300 underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700/60"
        >
          Lihat semua
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 animate-pulse h-64 sm:h-72" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-neutral-400">Belum ada produk.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((p, idx) => (
            <ProductCard key={p.id} p={p} index={idx} isVisible={isVisible} />
          ))}
        </div>
      )}
    </section>
  )
}