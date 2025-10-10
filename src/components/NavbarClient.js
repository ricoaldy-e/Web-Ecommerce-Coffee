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
    return <nav className="p-4 border-b" />
  }

  const isUser  = user?.role === "USER"
  const isGuest = !user

  return (
    <nav className="flex flex-wrap gap-4 p-4 border-b bg-neutral-950 border-neutral-800 text-neutral-100">
      {/* Toko (guest & user) */}
      <Link href="/">Home</Link>
      <Link href="/products">Produk</Link>

      {/* USER only */}
      {isUser && (
        <>
          <Link href="/cart">Keranjang</Link>
          <Link href="/orders">Pesanan Saya</Link>
          <Link href="/profile">Profil</Link>
        </>
      )}

      <span className="flex-1" />

      {/* Auth */}
      {isGuest ? (
        <>
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/register">Register</Link>
        </>
      ) : (
        <button
          onClick={handleLogout}
          className="px-3 py-1 border border-neutral-800 rounded bg-neutral-900 hover:bg-neutral-800"
        >
          Logout
        </button>
      )}
    </nav>
  )
}