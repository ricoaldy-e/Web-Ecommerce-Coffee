// src/components/layout/Footer.jsx
"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

const HIDE_ON = ["/admin", "/auth", "/checkout", "/cart", "/orders", "/profile", "/products"]

const BRAND   = "COFFESST"
const TAGLINE = "di mana setiap tegukan memberikan arti dari kehidupan"
const SUBLINE = "Have a Nice Day with a Cup of Coffee"
const ADDRESS = "Tembalang, Semarang"
const PHONE   = "+62 123 456 7890"
const EMAIL   = "coffesst@gmail.com"

const HOURS = [
  { label: "SENIN sampai JUMAT", value: "07.00 – 22.00" },
  { label: "SABTU dan MINGGU",   value: "07.00 – 24.00" },
]

// ganti ke akunmu bila sudah ada (sementara pakai root biar aman dari 404)
const SOCIAL = {
  instagram: "https://instagram.com/",
  tiktok:    "https://tiktok.com/",
  twitter:   "https://twitter.com/",
}

function onlyDigits(s = "") {
  return s.replace(/[^\d]/g, "")
}

export default function Footer() {
  const pathname = usePathname()
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null

  const telHref = `tel:${onlyDigits(PHONE)}`
  const waHref  = `https://wa.me/${onlyDigits(PHONE)}`
  const mailto  = `mailto:${EMAIL}`

  // ==== Animasi masuk untuk section atas footer ====
  const topRef = useRef(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTop(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    )
    if (topRef.current) obs.observe(topRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <footer className="mt-10">
      {/* Garis pembatas halus di atas footer */}
      <div aria-hidden="true" className="w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {/* ===== Section utama (3 kolom), full-bleed & CENTER + ANIMASI ===== */}
      <div className="bg-neutral-950 text-neutral-200">
        <div
          ref={topRef}
          className={[
            "px-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 py-16",
            "animate-on-scroll fade-in-up",
            showTop ? "animated" : ""
          ].join(" ")}
        >
          <div className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-neutral-800 justify-items-center text-center">
            {/* Kolom 1 — Welcome + Socials */}
            <div className={[
              "w-full max-w-[34rem] space-y-5 md:px-8",
              "animate-on-scroll scale-in stagger-1",
              showTop ? "animated" : ""
            ].join(" ")}>
              <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest">
                Selamat Datang di {BRAND}
              </h3>
              <p className="text-neutral-300 text-base leading-relaxed">{TAGLINE}</p>
              <p className="text-neutral-400 text-sm">{SUBLINE}</p>

              {/* Social icons (selalu center) */}
              <div className="mt-8 flex items-center justify-center gap-8">
                {/* Instagram */}
                <a
                  href={SOCIAL.instagram}
                  target="_blank" rel="noreferrer"
                  aria-label="Instagram"
                  className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 p-2.5 hover:bg-neutral-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href={SOCIAL.tiktok}
                  target="_blank" rel="noreferrer"
                  aria-label="TikTok"
                  className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 p-2.5 hover:bg-neutral-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M21 8.5a7 7 0 0 1-4-1.3V16a6 6 0 1 1-6-6c.35 0 .7.03 1.03.1V13a3 3 0 1 0 3 3V2h2a5 5 0 0 0 4 4.8V8.5Z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href={SOCIAL.twitter}
                  target="_blank" rel="noreferrer"
                  aria-label="Twitter"
                  className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 p-2.5 hover:bg-neutral-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h3l-7 8 8 10h-6l-5-6-5 6H3l7-8L2 2h6l5 6 5-6Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Kolom 2 — Kunjungi / Hubungi / Email */}
            <div className={[
              "w-full max-w-[34rem] space-y-8 md:px-8",
              "animate-on-scroll scale-in stagger-2",
              showTop ? "animated" : ""
            ].join(" ")}>
              <div className="space-y-2">
                <div className="text-lg font-extrabold uppercase tracking-widest">Kunjungi Toko</div>
                <div className="text-neutral-300">{ADDRESS}</div>
              </div>

              <div className="space-y-3">
                <div className="text-lg font-extrabold uppercase tracking-widest">Hubungi</div>
                <div className="text-neutral-300">{PHONE}</div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <a href={telHref}
                     className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors">
                    Telepon
                  </a>
                  <a href={waHref} target="_blank" rel="noreferrer"
                     className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-lg font-extrabold uppercase tracking-widest">Email</div>
                <div className="text-neutral-300">{EMAIL}</div>
                <div className="mt-2">
                  <a href={mailto}
                     className="inline-flex rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors">
                    Kirim Email
                  </a>
                </div>
              </div>
            </div>

            {/* Kolom 3 — Jam Operasional */}
            <div className={[
              "w-full max-w-[34rem] space-y-6 md:px-8",
              "animate-on-scroll scale-in stagger-3",
              showTop ? "animated" : ""
            ].join(" ")}>
              <div className="text-lg font-extrabold uppercase tracking-widest">Jam Operasional</div>
              <ul className="space-y-6">
                {HOURS.map((h) => (
                  <li key={h.label} className="space-y-1">
                    <div className="text-neutral-300 font-medium">{h.label}</div>
                    <div className="text-neutral-400">{h.value}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar (abu-abu gelap berbeda) – tanpa animasi */}
      <div className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
        <div className="px-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 py-5">
          <div className="grid items-center justify-items-center gap-3 md:grid-cols-3">
            <div className="text-xs sm:text-sm md:justify-self-start">
              © {new Date().getFullYear()} {BRAND}, ALL RIGHTS RESERVED.
            </div>
            <div className="text-sm font-semibold tracking-widest uppercase">
              {BRAND}
            </div>
            <div className="text-xs sm:text-sm md:justify-self-end">
              Cup of Coffee for You
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}