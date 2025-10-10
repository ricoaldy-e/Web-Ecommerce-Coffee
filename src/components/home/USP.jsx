// src/components/home/USP.jsx
"use client"

import { useEffect, useRef, useState } from "react"

function Icon({ name, className = "w-5 h-5" }) {
  // ikon inline (tanpa lib, ringan)
  if (name === "coffee") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" d="M3 9h13a4 4 0 0 1 0 8H9a6 6 0 0 1-6-6V9z" />
        <path d="M16 9v6a2 2 0 0 0 2 2h0a4 4 0 0 0 0-8h-2z" />
        <path strokeLinecap="round" d="M6 3c0 1.5 1 1.5 1 3s-1 1.5-1 3M10 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" />
      </svg>
    )
  }
  if (name === "bolt") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6z" />
      </svg>
    )
  }
  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 7a3 3 0 0 1 3-3h13a2 2 0 0 1 2 2v2H6a4 4 0 0 0-4 4V7z" />
        <rect x="2" y="8" width="20" height="12" rx="3" />
        <circle cx="17" cy="14" r="1.25" fill="currentColor" />
      </svg>
    )
  }
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 4c-9 2-14 7-16 16 9-2 14-7 16-16z" />
        <path d="M9 15c2 2 4 3 6 3" />
      </svg>
    )
  }
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2 19 6v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  }
  if (name === "headset") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5a7 7 0 0 0-7 7v3" />
        <rect x="3" y="13" width="4" height="6" rx="2" />
        <rect x="17" y="13" width="4" height="6" rx="2" />
        <path d="M19 15v-3a7 7 0 0 0-7-7" />
      </svg>
    )
  }
  return null
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
      className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* heading */}
      <div className={`animate-on-scroll fade-in-up ${isVisible ? "animated" : ""}`}>
        <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300">
          Keunggulan Kami
        </span>
        <h2 className="mt-3 text-xl sm:text-2xl font-semibold">Kenapa pilih kopi kami?</h2>
        <div className="mt-3 h-px w-full max-w-md bg-gradient-to-r from-neutral-600/70 to-transparent" />
      </div>

      {/* cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3" role="list">
        {items.map((it, idx) => (
          <div
            role="listitem"
            key={it.title}
            className={[
              "group rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition",
              "hover:bg-neutral-900/90 hover:-translate-y-0.5 hover:shadow-sm",
              "animate-on-scroll scale-in",
              `stagger-${Math.min(idx + 1, 8)}`,
              isVisible ? "animated" : "",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800/70 ring-1 ring-neutral-700/70 text-neutral-200">
                <Icon name={it.icon} className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base font-semibold">{it.title}</div>
                <p className="mt-1 text-sm text-neutral-400">{it.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}