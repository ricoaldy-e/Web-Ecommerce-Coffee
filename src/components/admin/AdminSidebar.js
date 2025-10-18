// src/components/admin/AdminSidebar.js
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// import { useEffect } from "react" // Dihapus

const nav = [
  { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
  { href: "/admin/orders", label: "Orders", match: (p) => p.startsWith("/admin/orders") },
  { href: "/admin/products", label: "Products", match: (p) => p.startsWith("/admin/products") },
  { href: "/admin/categories", label: "Categories", match: (p) => p.startsWith("/admin/categories") },
]

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname()

  // Dihapus: useEffect yang lama tidak diperlukan lagi
  // useEffect(() => { if (open) onClose?.() }, [pathname]) 

  const Item = ({ item }) => {
    const active = item.match(pathname || "")
    return (
      <Link
        href={item.href}
        // Ditambahkan: onClick untuk langsung menutup sidebar saat link diklik
        onClick={onClose} 
        className={[
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-md"
            : "text-white hover:bg-amber-700/60 hover:text-white"
        ].join(" ")}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        ].join(" ")}
      />

      {/* Sidebar */}
      <aside
        className={[
          // Mobile: drawer fixed
          "fixed z-50 top-0 h-full w-72 bg-gradient-to-b from-amber-900 to-amber-800 text-white shadow-xl",
          "transition-transform md:transition-none",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: sticky
          "md:static md:translate-x-0 md:w-64",
          "md:sticky md:top-14 md:self-start md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:z-0"
        ].join(" ")}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-700 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <span>Admin Panel</span>
          </h2>
          <button
            onClick={onClose}
            className="md:hidden text-amber-100 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1 bg-amber-900/20 backdrop-blur-sm">
          {nav.map((item) => (
            <Item key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-amber-700/60 text-xs text-amber-200">
          <div>© {new Date().getFullYear()} Coffesst Admin</div>
        </div>
      </aside>
    </>
  )
}