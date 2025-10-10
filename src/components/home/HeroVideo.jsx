// src/components/home/HeroVideo.jsx
"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function HeroVideo({
  poster = "/images/hero-poster.jpg",
  sources = [
    { src: "/videos/hero.webm", type: "video/webm" },
    { src: "/videos/hero.mp4",  type: "video/mp4"  },
  ],
}) {
  const videoRef = useRef(null)
  const [canPlay, setCanPlay] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handle = () => setCanPlay(!mq.matches)
    handle()
    mq.addEventListener?.("change", handle)
    return () => mq.removeEventListener?.("change", handle)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (canPlay) v.play().catch(() => {})
    else v.pause()
  }, [canPlay])

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[80vh] lg:min-h-[86vh] w-full overflow-hidden bg-neutral-950">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
      >
        {sources.map(s => <source key={s.src} src={s.src} type={s.type} />)}
        Your browser does not support the video tag.
      </video>

      {/* Overlay: darken + top gradient */}
      <div className="absolute inset-0 bg-neutral-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent" />

      {/* Fade bottom supaya peralihan ke konten halus */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-b from-transparent to-neutral-950" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight animate-on-scroll fade-in-up delay-long-1 ${isVisible ? 'animated' : ''}`}>
            Hari yang Baik,<br className="hidden sm:block" />
            <span className="text-neutral-300">Ditemani Kopi Terbaik.</span>
          </h1>
          <p className={`mt-4 max-w-2xl text-sm sm:text-base text-neutral-300 animate-on-scroll fade-in-up delay-long-2 ${isVisible ? 'animated' : ''}`}>
            Pilih biji & bubuk kopi asli Nusantara. Segar, terkurasi, dan siap kirim.
          </p>

          <div className={`mt-6 flex flex-wrap gap-3 animate-on-scroll fade-in-up delay-long-3 ${isVisible ? 'animated' : ''}`}>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium
                         bg-white text-neutral-900 hover:bg-neutral-200 transition"
            >
              Belanja Sekarang
            </Link>
          </div>

          <div className={`mt-6 flex items-center gap-3 text-xs text-neutral-400 animate-on-scroll fade-in-up delay-long-4 ${isVisible ? 'animated' : ''}`}>
            <span className="inline-flex items-center gap-2">☕ 100+ varian kopi</span>
            <span>•</span><span>Pengiriman cepat</span><span>•</span><span>Dukungan e-wallet & COD</span>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20
                    flex flex-col items-center text-neutral-400 hover:text-neutral-200 transition-colors
                    animate-on-scroll fade-in-up delay-long-5 ${isVisible ? 'animated' : ''}`}
      >
        <a href="#best" className="group flex flex-col items-center gap-1" aria-label="Scroll ke Best Sellers">
          <svg
            className="w-6 h-6 animate-bounce-smooth text-current"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs opacity-80 group-hover:opacity-100 transition-opacity">
            Scroll
          </span>
        </a>
      </div>
    </section>
  )
}