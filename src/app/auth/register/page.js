"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (res.ok) {
      alert("✅ Registrasi berhasil, silakan login")
      router.push("/auth/login")
    } else {
      const err = await res.json()
      alert("❌ " + err.message)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-2 max-w-sm">
        <input placeholder="Nama" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="bg-black text-white p-2">Register</button>
      </form>
    </main>
  )
}