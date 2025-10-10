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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-800 px-2 py-1 md:hidden hover:bg-neutral-900"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Brand → balik ke dashboard */}
        <Link href="/admin" className="font-semibold tracking-wide">
          Coffee Admin
        </Link>

        <span className="text-neutral-700 mx-2">/</span>
        <span className="text-sm text-neutral-400 truncate">
          {pathname?.replace(/^\/admin\/?/, "") || "Dashboard"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-900"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}