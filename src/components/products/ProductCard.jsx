// src/components/products/ProductCard.jsx
"use client"

import Link from "next/link"

export default function ProductCard({ p, index = 0, isVisible = true }) {
  const price = Number(p.price ?? 0)
  const img = p.imageUrl || "/images/placeholder-product.jpg"
  const staggerClass = index < 8 ? `stagger-${index + 1}` : "stagger-8"

  return (
    <div
      className={`group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 hover:bg-neutral-900/80 transition
                  animate-on-scroll scale-in ${staggerClass} ${isVisible ? "animated" : ""}`}
    >
      <Link
        href={`/products/${p.slug}`}
        aria-label={`Lihat detail ${p.name}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700/60"
      >
        <div className="aspect-[4/3] overflow-hidden bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={p.name}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-3">
        <Link
          href={`/products/${p.slug}`}
          className="line-clamp-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700/60 rounded"
          aria-label={`Produk ${p.name}`}
        >
          {p.name}
        </Link>

        <div className="mt-1 text-neutral-400 text-xs">
          {p.category?.name || "Tanpa Kategori"}
        </div>

        <div className="mt-2 text-lg font-semibold">
          Rp {price.toLocaleString("id-ID")}
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${p.slug}`}
            aria-label={`Lihat detail ${p.name}`}
            className="inline-flex items-center rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700/60"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  )
}