"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Coffee, User, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const router = useRouter()

  // Validasi password
  function validatePassword(pwd) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    if (!regex.test(pwd)) {
      return "Kata sandi minimal 6 karakter dan harus mengandung huruf serta angka."
    }
    return ""
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      alert("⚠️ Harap isi semua kolom terlebih dahulu.")
      return
    }

    const pwdErr = validatePassword(password)
    if (pwdErr) {
      setPasswordError(pwdErr)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    } else setPasswordError("")

    if (password !== confirmPassword) {
      setConfirmError("Konfirmasi kata sandi tidak sesuai.")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    } else setConfirmError("")

    setIsLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (res.ok) {
      alert("✅ Registrasi berhasil, silakan login.")
      router.push("/auth/login")
    } else {
      const err = await res.json()
      alert("❌ " + err.message)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🔹 Background gambar */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')", // ubah sesuai nama filemu
        }}
      />

      {/* 🔹 Overlay blur lembut */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* 🔹 Konten utama */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Tombol kembali */}
        <motion.button
          variants={itemVariants}
          onClick={() => router.push("/auth/login")}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-amber-900 hover:text-amber-700 mb-6 font-medium text-base"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali ke Login
        </motion.button>

        {/* Kartu Register */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/40"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-amber-900">Daftar Akun</h1>
          </div>

          {/* Form Register */}
          <motion.form variants={containerVariants} onSubmit={handleRegister} className="space-y-4">
            {/* Nama */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 rounded-lg border border-amber-200 bg-white/70 
                             text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 
                             focus:border-amber-400 focus:outline-none transition-all duration-300 text-base"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 rounded-lg border border-amber-200 bg-white/70 
                             text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 
                             focus:border-amber-400 focus:outline-none transition-all duration-300 text-base"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(validatePassword(e.target.value))
                  }}
                  className={`w-full pl-11 pr-11 py-3 rounded-lg border ${
                    passwordError ? "border-red-400" : "border-amber-200"
                  } bg-white/70 text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 
                     focus:border-amber-400 focus:outline-none transition-all duration-300 text-base`}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {passwordError && <p className="text-sm text-red-500 mt-2">{passwordError}</p>}
            </motion.div>

            {/* Konfirmasi Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-base font-semibold text-amber-900 mb-2">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 rounded-lg border ${
                    confirmError ? "border-red-400" : "border-amber-200"
                  } bg-white/70 text-amber-900 placeholder-amber-600/70 focus:ring-2 focus:ring-amber-400 
                     focus:border-amber-400 focus:outline-none transition-all duration-300 text-base`}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {confirmError && <p className="text-sm text-red-500 mt-2">{confirmError}</p>}
            </motion.div>

            {/* Tombol Daftar */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-lg 
                         font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </motion.button>
          </motion.form>

          {/* Link ke Login */}
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <p className="text-sm text-amber-800">
              Sudah punya akun?{" "}
              <motion.button
                onClick={() => router.push("/auth/login")}
                whileHover={{ color: "#f59e0b" }}
                whileTap={{ scale: 0.95 }}
                className="font-semibold text-amber-600"
              >
                Masuk di sini
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
