"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Menu, X, ShoppingCart, Package, UserRound } from "lucide-react"

export default function NavbarClient({ initialUser }) {
  const router   = useRouter()
  const pathname = usePathname() || "/"

  // Sembunyikan navbar di /admin/**
  if (pathname.startsWith("/admin")) return null

  // Hydration guard (elak mismatch warna/SSR)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  // Auth state sinkron dengan BE
  const [user, setUser] = useState(initialUser || null)
  useEffect(() => {
    const onAuthChanged = () => {
      fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
        .then(res => res.json())
        .then(data => setUser(data.user ?? null))
        .catch(() => setUser(null))
    }
    window.addEventListener("auth:changed", onAuthChanged)
    return () => window.removeEventListener("auth:changed", onAuthChanged)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    window.dispatchEvent(new Event("auth:changed"))
    router.replace("/")
  }

  const isGuest = !user
  const isUser  = user?.role === "USER"
  const isLoginPage    = pathname === "/auth/login"
  const isRegisterPage = pathname === "/auth/register"

  // mobile menu
  const [open, setOpen] = useState(false)
  useEffect(() => {
    // tutup menu saat route berganti
    setOpen(false)
  }, [pathname])

  // helper active link
  const isActive = (href) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }
  const navLinkClass = (href) =>
    `px-3 py-2 rounded-lg transition-colors ${
      isActive(href)
        ? "bg-white/15 text-white"
        : "text-white/90 hover:text-white hover:bg-white/10"
    }`

  if (!hydrated) {
    return (
      <nav className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3" />
      </nav>
    )
  }

  return (
    <nav className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bar atas */}
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-extrabold tracking-wide text-white text-lg"
            aria-label="COFFESST Home"
          >
            {/* bisa ganti icon kalau mau */}
            <span className="inline-block rounded-md bg-white/15 px-2 py-1">☕</span>
            <span>COFFESST</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={navLinkClass("/")}>Home</Link>
            <Link href="/products" className={navLinkClass("/products")}>Produk</Link>
            {isUser && (
              <>
                <Link href="/cart" className={navLinkClass("/cart")}>
                  <span className="inline-flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" /> Keranjang
                  </span>
                </Link>
                <Link href="/orders" className={navLinkClass("/orders")}>
                  <span className="inline-flex items-center gap-1">
                    <Package className="w-4 h-4" /> Pesanan
                  </span>
                </Link>
                <Link href="/profile" className={navLinkClass("/profile")}>
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="w-4 h-4" /> Profil
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-3">
            {isGuest ? (
              <>
                {/* di halaman login → tampilkan Register saja */}
                {isLoginPage ? (
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-lg bg-white text-amber-900 font-semibold hover:bg-amber-50 transition"
                  >
                    Register
                  </Link>
                ) : isRegisterPage ? (
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 rounded-lg bg-white text-amber-900 font-semibold hover:bg-amber-50 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-white/90 text-sm">
                  Hi, <span className="font-semibold text-white">{user.name || user.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white transition"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mb-3 rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm p-2">
            <div className="grid gap-1">
              <Link href="/" className={navLinkClass("/")}>Home</Link>
              <Link href="/products" className={navLinkClass("/products")}>Produk</Link>
              {isUser && (
                <>
                  <Link href="/cart" className={navLinkClass("/cart")}>
                    <span className="inline-flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" /> Keranjang
                    </span>
                  </Link>
                  <Link href="/orders" className={navLinkClass("/orders")}>
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-4 h-4" /> Pesanan
                    </span>
                  </Link>
                  <Link href="/profile" className={navLinkClass("/profile")}>
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="w-4 h-4" /> Profil
                    </span>
                  </Link>
                </>
              )}
            </div>

            <div className="my-2 h-px bg-white/10" />

            <div className="flex flex-wrap gap-2">
              {isGuest ? (
                <>
                  {isLoginPage ? (
                    <Link
                      href="/auth/register"
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-white text-amber-900 font-semibold hover:bg-amber-50 transition"
                    >
                      Register
                    </Link>
                  ) : isRegisterPage ? (
                    <Link
                      href="/auth/login"
                      className="flex-1 text-center px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                    >
                      Login
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="flex-1 text-center px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex-1 text-center px-4 py-2 rounded-lg bg-white text-amber-900 font-semibold hover:bg-amber-50 transition"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="w-full px-3 py-2 rounded-lg bg-white/10 text-white/90">
                    Hi, <span className="font-semibold text-white">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex-1 text-center px-4 py-2 rounded-lg border border-white/40 text-white hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}