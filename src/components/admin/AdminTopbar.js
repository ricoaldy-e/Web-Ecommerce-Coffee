// src/components/admin/AdminTopbar.js
"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useCallback, useState, useRef } from "react" // Ditambahkan: useState, useRef
import InlinePopConfirm from "./InlinePopConfirm" // Ditambahkan: Import komponen pop-up

export default function AdminTopbar({ onToggleSidebar }) {
  const router = useRouter()
  const pathname = usePathname()

  // Ditambahkan: State untuk kontrol pop-up dan ref untuk posisi
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const logoutBtnRef = useRef(null)

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setShowLogoutConfirm(false) // Tutup pop-up setelah proses selesai
    router.replace("/auth/login")
  }, [router])

  return (
    <>
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
            Coffesst Admin
          </Link>

          <span className="text-amber-200/70 mx-2">/</span>
          <span className="text-sm text-amber-100/80 truncate capitalize">
            {pathname?.replace(/^\/admin\/?/, "") || "Dashboard"}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Diubah: Tombol Logout sekarang membuka pop-up */}
            <button
              ref={logoutBtnRef} // Ditambahkan: Ref untuk anchor
              onClick={() => setShowLogoutConfirm(true)} // Diubah: Buka pop-up, bukan logout langsung
              className="rounded-lg border border-amber-700 px-3 py-1.5 text-sm font-medium hover:bg-amber-700/50 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Ditambahkan: Komponen Pop-up Konfirmasi Logout */}
      <InlinePopConfirm
        open={showLogoutConfirm}
        anchorRef={logoutBtnRef}
        title="Yakin ingin logout?"
        description="Anda akan diarahkan kembali ke halaman login."
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}