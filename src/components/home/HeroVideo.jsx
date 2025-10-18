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

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-gradient-to-b from-amber-900/70 via-amber-950/70 to-amber-900">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-[0.6] contrast-[1.05] saturate-[1.2]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
      >
        {sources.map(s => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/85 via-amber-900/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-amber-50/40" />

      {/* Konten utama */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 text-center">
        <div className="pt-28 pb-20 sm:pt-36 sm:pb-28">
          <h1
            className={`font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <span className="block text-amber-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">
              Hari yang Baik,
            </span>
            <span className="block text-amber-50">
              Ditemani <span className="text-amber-400">Kopi Terbaik.</span>
            </span>
          </h1>

          <p
            className={`mt-6 max-w-2xl mx-auto text-base sm:text-lg text-amber-100/90 font-light transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            Pilih biji & bubuk kopi asli Nusantara. Segar, terkurasi, dan siap kirim.
          </p>

          <div
            className={`mt-8 flex justify-center transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-amber-600 hover:bg-amber-700 text-white text-base sm:text-lg font-semibold px-6 py-3 shadow-lg shadow-amber-900/40 transition-transform hover:scale-105"
            >
              Belanja Sekarang
            </Link>
          </div>

          <div
            className={`mt-8 flex justify-center items-center flex-wrap gap-3 text-sm text-amber-200 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              ☕ 100+ varian kopi
            </span>
            <span>•</span>
            <span>Pengiriman cepat</span>
            <span>•</span>
            <span>Dukungan e-wallet & COD</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator - diperbaiki */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-opacity duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <a
          href="#best"
          className="group flex flex-col items-center gap-1 hover:text-amber-100 transition-colors"
          aria-label="Scroll ke Best Sellers"
        >
          <svg
            className="w-6 h-6 animate-bounce-smooth text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs font-medium text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] group-hover:text-amber-50 transition-opacity">
            Scroll
          </span>
        </a>
      </div>
    </section>
  )
}
