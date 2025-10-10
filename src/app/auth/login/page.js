"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get("next")

  // Kalau sudah login, arahkan sesuai role/next
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const u = data?.user
        if (!u) return
        if (nextParam) {
          router.replace(nextParam)
        } else {
          router.replace(u.role === "ADMIN" ? "/admin" : "/products")
        }
      })
      .catch(() => {})
  }, [router, nextParam])

  async function handleLogin(e) {
    e.preventDefault()
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      window.dispatchEvent(new Event("auth:changed"))
      setEmail("")
      setPassword("")
      // Hormati ?next=
      if (nextParam) {
        router.replace(nextParam)
      } else {
        router.replace(data?.user?.role === "ADMIN" ? "/admin" : "/products")
      }
    } else {
      alert("❌ " + (data.message || "Login gagal"))
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-sm">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-2 py-1"
        />
        <button type="submit" className="bg-black text-white p-2">
          Login
        </button>
      </form>
    </main>
  )
}