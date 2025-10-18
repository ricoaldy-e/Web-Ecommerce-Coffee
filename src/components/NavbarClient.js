"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function NavbarClient({ initialUser }) {
  const router = useRouter()
  const pathname = usePathname() || "/"

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

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

  // ⬇️ Admin area: jangan render navbar toko
  if (pathname.startsWith("/admin")) return null

  if (!hydrated) {
    return <nav className="p-4 border-b border-amber-200 bg-amber-50" />
  }

  const isUser  = user?.role === "USER"
  const isGuest = !user

  return (
    <nav className="flex flex-wrap items-center gap-4 p-4 border-b border-amber-200 bg-amber-50 text-amber-900 shadow-sm backdrop-blur-sm">
      {/* Brand */}
      <Link 
        href="/" 
        className="font-bold text-lg text-amber-800 hover:text-amber-700 transition-colors"
      >
        Daily Beans
      </Link>

      {/* Menu utama */}
      <Link 
        href="/" 
        className="hover:text-amber-700 transition-colors"
      >
        Home
      </Link>
      <Link 
        href="/products" 
        className="hover:text-amber-700 transition-colors"
      >
        Produk
      </Link>

      {/* USER only */}
      {isUser && (
        <>
          <Link 
            href="/cart" 
            className="hover:text-amber-700 transition-colors"
          >
            Keranjang
          </Link>
          <Link 
            href="/orders" 
            className="hover:text-amber-700 transition-colors"
          >
            Pesanan Saya
          </Link>
          <Link 
            href="/profile" 
            className="hover:text-amber-700 transition-colors"
          >
            Profil
          </Link>
        </>
      )}

      <span className="flex-1" />

      {/* Auth */}
      {isGuest ? (
        <div className="flex gap-3">
          <Link 
            href="/auth/login" 
            className="px-4 py-2 text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
          >
            Register
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-700">
            Hi, {user.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-amber-300 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
