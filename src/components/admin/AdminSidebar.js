// src/components/admin/AdminSidebar.js
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const nav = [
  { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
  { href: "/admin/orders", label: "Orders", match: (p) => p.startsWith("/admin/orders") },
  { href: "/admin/products", label: "Products", match: (p) => p.startsWith("/admin/products") },
  { href: "/admin/categories", label: "Categories", match: (p) => p.startsWith("/admin/categories") },
]

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname()

  useEffect(() => { if (open) onClose?.() }, [pathname]) // auto-close di mobile

  const Item = ({ item }) => {
    const active = item.match(pathname || "")
    return (
      <Link
        href={item.href}
        className={[
          "block rounded-lg px-3 py-2 text-sm transition-colors",
          active
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "hover:bg-gray-100 dark:hover:bg-neutral-900"
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

      {/* Drawer / Static */}
      <aside
        className={[
          "fixed z-50 md:z-0 md:static top-0 md:top-auto h-full md:h-auto",
          "w-72 md:w-64 bg-white dark:bg-neutral-950 border-r dark:border-neutral-800 md:border-0",
          "transition-transform md:transition-none",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        ].join(" ")}
      >
        <div className="h-14 md:hidden" />
        <div className="p-4 md:p-0 md:pt-4 md:pl-2">
          <nav className="grid gap-1">
            {nav.map((item) => <Item key={item.href} item={item} />)}
          </nav>
          <div className="mt-6 border-t dark:border-neutral-800 pt-4 text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Coffee Admin
          </div>
        </div>
      </aside>
    </>
  )
}