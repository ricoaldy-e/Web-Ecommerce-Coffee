"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Coffee, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get("next")

  useEffect(() => {
    setIsLoading(true)
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
      .finally(() => setIsLoading(false))
  }, [router, nextParam])

  async function handleLogin(e) {
    e.preventDefault()

    if (!email || !password) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setIsLoading(true)

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
      if (nextParam) {
        router.replace(nextParam)
      } else {
        router.replace(data?.user?.role === "ADMIN" ? "/admin" : "/products")
      }
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      alert("❌ " + (data.message || "Login gagal"))
    }
    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background gambar (ganti background.png sesuai file kamu) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')",
        }}
      />

      {/* Overlay ringan transparan untuk efek lembut */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Konten Utama */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Tombol kembali */}
        <motion.button
          variants={itemVariants}
          onClick={() => router.push("/products")}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-amber-900 hover:text-amber-700 mb-6 transition-all font-medium text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Beranda
        </motion.button>

        {/* Kartu login transparan terang */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/40"
        >
          <motion.div variants={itemVariants} className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-amber-900">
              Masuk ke Akun
            </h1>
          </motion.div>

          {/* Form login */}
          <motion.form 
            variants={containerVariants}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 rounded-lg border border-amber-200 bg-white/70 text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-300 text-base"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-lg border border-amber-200 bg-white/70 text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-300 text-base"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-700 hover:text-amber-800 transition-all"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>

            {/* Tombol Masuk */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </motion.button>
          </motion.form>

          {/* Link daftar */}
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <p className="text-sm text-amber-800">
              Belum punya akun?{" "}
              <motion.button
                onClick={() => router.push("/auth/register")}
                whileHover={{ 
                  color: "#f59e0b",
                  textShadow: "0 0 8px rgba(245, 158, 11, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="font-semibold text-amber-600 transition-all duration-200"
              >
                Daftar di sini
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
