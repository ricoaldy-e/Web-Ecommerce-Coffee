// src/components/admin/AdminTopbar.js
"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

export default function AdminTopbar({ onToggleSidebar }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    router.replace("/auth/login")
  }, [router])

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-md backdrop-blur supports-[backdrop-filter]:bg-amber-900/80">
      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg border border-amber-700 px-2 py-1 md:hidden hover:bg-amber-700/40 transition"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Brand */}
        <Link
          href="/admin"
          className="font-bold text-lg tracking-wide flex items-center gap-2 hover:text-amber-200 transition"
        >
          Coffee Admin
        </Link>

        <span className="text-amber-200/70 mx-2">/</span>
        <span className="text-sm text-amber-100/80 truncate capitalize">
          {pathname?.replace(/^\/admin\/?/, "") || "Dashboard"}
        </span>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="rounded-lg border border-amber-700 px-3 py-1.5 text-sm font-medium hover:bg-amber-700/50 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
