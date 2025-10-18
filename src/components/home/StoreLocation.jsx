// src/components/home/StoreLocation.jsx
"use client"

import { useEffect, useRef, useState } from "react"

const LAT = -7.0463295956464
const LNG = 110.43806138840836
const ZOOM = 16
const ADDRESS = "Tembalang, Semarang"
const MAP_QUERY = encodeURIComponent(ADDRESS)

// Link buka Google Maps tepat di koordinat
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`

// Iframe embed ke koordinat yang sama
const MAPS_EMBED = `https://www.google.com/maps?ll=${LAT},${LNG}&q=${LAT},${LNG}&z=${ZOOM}&t=m&output=embed`

export default function StoreLocation() {
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
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="store"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-left"
      aria-labelledby="store-heading"
    >
      {/* Heading kiri */}
      <div className={`animate-on-scroll fade-in-up ${visible ? "animated" : ""}`}>
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs text-amber-800">
          Toko Offline
        </span>
        <h2
          id="store-heading"
          className="mt-3 text-xl sm:text-2xl font-bold text-amber-900"
        >
          Kunjungi gerai kami di {ADDRESS}
        </h2>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-amber-700">
          Kami juga menyediakan layanan pembelian langsung di lokasi. Klik peta di bawah untuk membuka Google Maps.
        </p>

        {/* Garis bawah elegan */}
        <div className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-amber-400/50 to-transparent" />
      </div>

      {/* Map Card */}
      <div
        className={[
          "mt-6 relative rounded-xl overflow-hidden border border-amber-200 bg-white shadow-sm",
          "animate-on-scroll scale-in",
          visible ? "animated" : "",
        ].join(" ")}
      >
        <div className="relative w-full h-[220px] sm:h-[260px] lg:h-[500px]">
          {/* Overlay anchor full-area → klik apapun buka maps */}
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            aria-label="Buka lokasi di Google Maps"
            className="absolute inset-0 z-10"
          />
          {/* Badge "Buka di Maps" */}
          <div className="absolute right-3 top-3 z-20">
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100/90 px-2.5 py-1 text-xs text-amber-800 backdrop-blur">
              Buka di Maps ↗
            </span>
          </div>
          {/* Iframe peta (di-nonaktifkan interaksi supaya klik selalu buka Maps) */}
          <iframe
            title={`Lokasi ${ADDRESS}`}
            src={MAPS_EMBED}
            className="absolute inset-0 h-full w-full pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
