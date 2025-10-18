// src/components/home/USP.jsx
"use client"

import { useEffect, useRef, useState } from "react"

function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    coffee: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M3 9h13a4 4 0 0 1 0 8H9a6 6 0 0 1-6-6V9z" />
        <path d="M16 9v6a2 2 0 0 0 2 2h0a4 4 0 0 0 0-8h-2z" />
        <path strokeLinecap="round" d="M6 3c0 1.5 1 1.5 1 3s-1 1.5-1 3M10 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6z" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 7a3 3 0 0 1 3-3h13a2 2 0 0 1 2 2v2H6a4 4 0 0 0-4 4V7z" />
        <rect x="2" y="8" width="20" height="12" rx="3" />
        <circle cx="17" cy="14" r="1.25" fill="currentColor" />
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 4c-9 2-14 7-16 16 9-2 14-7 16-16z" />
        <path d="M9 15c2 2 4 3 6 3" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2 19 6v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    headset: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5a7 7 0 0 0-7 7v3" />
        <rect x="3" y="13" width="4" height="6" rx="2" />
        <rect x="17" y="13" width="4" height="6" rx="2" />
        <path d="M19 15v-3a7 7 0 0 0-7-7" />
      </svg>
    ),
  }

  return icons[name] || null
}

export default function USP() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  const items = [
    { title: "Kopi Segar", desc: "Roasted terbaru dari UMKM lokal", icon: "coffee" },
    { title: "Kirim Cepat", desc: "Same/next-day untuk area tertentu", icon: "bolt" },
    { title: "Bayar Fleksibel", desc: "COD, Transfer, & E-Wallet", icon: "wallet" },
    { title: "Berkelanjutan", desc: "Sumber biji yang ramah lingkungan", icon: "leaf" },
    { title: "Kualitas Terjamin", desc: "QC ketat sebelum dikirim", icon: "shield" },
    { title: "CS Responsif", desc: "Bantuan cepat via chat", icon: "headset" },
  ]

  useEffect(() => {
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
  }, [])

  return (
    <section
      id="usp"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-14"
    >
      {/* Heading kiri */}
      <div className={`animate-on-scroll fade-in-up ${isVisible ? "animated" : ""}`}>
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs sm:text-sm text-amber-800">
          Keunggulan Kami
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-amber-900">
          Kenapa pilih kopi kami?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-amber-700 max-w-xl">
          Kopi terbaik lahir dari kualitas, kecepatan, dan pelayanan yang tulus ☕
        </p>
        <div className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-amber-400/50 to-transparent" />
      </div>

      {/* Cards kiri */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {items.map((it, idx) => (
          <div
            role="listitem"
            key={it.title}
            className={[
              "group rounded-2xl border border-amber-200 bg-white p-6 transition-all duration-300 ease-out",
              "hover:bg-amber-50 hover:-translate-y-1 hover:shadow-md",
              "animate-on-scroll scale-in",
              isVisible ? "animated" : "",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 ring-1 ring-amber-200 text-amber-700">
                <Icon name={it.icon} className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-amber-900">
                  {it.title}
                </div>
                <p className="mt-1 text-sm sm:text-base text-amber-700 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
