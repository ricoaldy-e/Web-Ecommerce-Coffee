// src/components/layout/Footer.jsx
"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

const HIDE_ON = ["/admin", "/auth", "/checkout", "/cart", "/orders", "/profile", "/products"]

const BRAND   = "Daily Beans"
const TAGLINE = "Setiap tegukan membawa makna kehidupan"
const SUBLINE = "Have a Nice Day with a Cup of Coffee"
const ADDRESS = "Tembalang, Semarang"
const PHONE   = "+62 123 456 7890"
const EMAIL   = "hello@dailybeans.com"

const HOURS = [
  { label: "Senin – Jumat", value: "07.00 – 22.00" },
  { label: "Sabtu – Minggu", value: "07.00 – 24.00" },
]

const SOCIAL = {
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
  twitter: "https://twitter.com/",
}

function onlyDigits(s = "") {
  return s.replace(/[^\d]/g, "")
}

export default function Footer() {
  const pathname = usePathname()
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null

  const telHref = `tel:${onlyDigits(PHONE)}`
  const waHref = `https://wa.me/${onlyDigits(PHONE)}`
  const mailto = `mailto:${EMAIL}`

  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <footer className="mt-16">
      {/* Garis pembatas halus di atas footer */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

      {/* Bagian utama footer */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 text-amber-50">
        <div
          ref={sectionRef}
          className={`mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-16 animate-on-scroll fade-in-up ${visible ? "animated" : ""}`}
        >
          <div className="grid gap-12 md:grid-cols-3 text-left">
            
            {/* Kolom 1 */}
            <div className="space-y-5">
              <h3 className="text-lg sm:text-xl font-bold tracking-wide uppercase text-amber-200">
                {BRAND}
              </h3>
              <p className="text-amber-100 leading-relaxed max-w-xs">{TAGLINE}</p>
              <p className="text-amber-400 text-sm">{SUBLINE}</p>

              {/* Socials */}
              <div className="mt-6 flex gap-4">
                {Object.entries(SOCIAL).map(([name, link]) => (
                  <a
                    key={name}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-amber-600/50 bg-amber-800/50 p-2 hover:bg-amber-700/60 hover:scale-110 transition-all"
                    aria-label={name}
                  >
                    {name === "instagram" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
                      </svg>
                    )}
                    {name === "tiktok" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M21 8.5a7 7 0 0 1-4-1.3V16a6 6 0 1 1-6-6c.35 0 .7.03 1.03.1V13a3 3 0 1 0 3 3V2h2a5 5 0 0 0 4 4.8V8.5Z" />
                      </svg>
                    )}
                    {name === "twitter" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M18 2h3l-7 8 8 10h-6l-5-6-5 6H3l7-8L2 2h6l5 6 5-6Z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Kolom 2 */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-amber-200 uppercase tracking-wide">Kunjungi Kami</h4>
                <p className="text-amber-100">{ADDRESS}</p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-200 uppercase tracking-wide">Hubungi</h4>
                <p className="text-amber-100">{PHONE}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <a href={telHref} className="rounded-md border border-amber-600/50 bg-amber-800/50 px-3 py-1.5 text-sm hover:bg-amber-700/50 transition-colors">
                    Telepon
                  </a>
                  <a href={waHref} target="_blank" rel="noreferrer" className="rounded-md border border-amber-600/50 bg-amber-800/50 px-3 py-1.5 text-sm hover:bg-amber-700/50 transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-200 uppercase tracking-wide">Email</h4>
                <p className="text-amber-100">{EMAIL}</p>
                <a href={mailto} className="mt-3 inline-block rounded-md border border-amber-600/50 bg-amber-800/50 px-3 py-1.5 text-sm hover:bg-amber-700/50 transition-colors">
                  Kirim Email
                </a>
              </div>
            </div>

            {/* Kolom 3 */}
            <div className="space-y-6">
              <h4 className="font-semibold text-amber-200 uppercase tracking-wide">Jam Operasional</h4>
              <ul className="space-y-4">
                {HOURS.map(h => (
                  <li key={h.label}>
                    <div className="text-amber-100 font-medium">{h.label}</div>
                    <div className="text-amber-400">{h.value}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-amber-950 border-t border-amber-800/60 text-amber-300">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row justify-between items-center text-sm">
            <div>© {new Date().getFullYear()} {BRAND}. All Rights Reserved.</div>
            <div className="mt-2 sm:mt-0 font-semibold tracking-wide">{BRAND}</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
