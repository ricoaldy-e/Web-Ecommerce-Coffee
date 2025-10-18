"use client"

import Link from "next/link"

export default function ProductCard({ p, index = 0, isVisible = true }) {
  const price = Number(p.price ?? 0)
  const img = p.imageUrl || "/images/placeholder-product.jpg"
  const staggerClass = index < 8 ? `stagger-${index + 1}` : "stagger-8"

  return (
    <div
      className={`group rounded-xl overflow-hidden border border-amber-200 bg-white shadow-sm hover:shadow-md transition-all
                  animate-on-scroll scale-in ${staggerClass} ${isVisible ? "animated" : ""}`}
    >
      <Link
        href={`/products/${p.slug}`}
        aria-label={`Lihat detail ${p.name}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        <div className="aspect-[4/3] overflow-hidden bg-amber-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={p.name}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link
          href={`/products/${p.slug}`}
          className="line-clamp-2 font-medium text-amber-900 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:rounded"
          aria-label={`Produk ${p.name}`}
        >
          {p.name}
        </Link>

        <div className="mt-1 text-amber-600 text-xs">
          {p.category?.name || "Tanpa Kategori"}
        </div>

        <div className="mt-2 text-lg font-semibold text-amber-700">
          Rp {price.toLocaleString("id-ID")}
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${p.slug}`}
            aria-label={`Lihat detail ${p.name}`}
            className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  )
}