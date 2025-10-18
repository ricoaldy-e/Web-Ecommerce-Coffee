"use client"

import { useEffect, useState } from "react"
import { loadRegions, getCitiesForProvince } from "@/lib/regions"
import { User, MapPin, Plus, Home, Building, Trash2, Star } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [regions, setRegions] = useState({ provinces: [] })
  const [provinceCities, setProvinceCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [form, setForm] = useState({
    recipient: "", phone: "",
    street: "",
    province: "", city: "",
    postalCode: "",
    isDefault: false,
    label: "",
  })

  const load = () => {
    setIsLoading(true)
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null))

    fetch("/api/addresses", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(list => setAddresses(Array.isArray(list) ? list : []))
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    loadRegions().then(setRegions)
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const onProvinceInput = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, province: value, city: "" }));
    setProvinceCities(getCitiesForProvince(regions, value));
  };

  const addAddress = async () => {
    const required = ["recipient","phone","street","province","city","postalCode","label"]
    for (const k of required) {
      if (!form[k]) {
        alert("Lengkapi data alamat: " + k)
        return
      }
    }
    
    const res = await fetch("/api/addresses", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({
        recipient: "", phone: "",
        street: "", province: "", city: "",
        postalCode: "", isDefault: false, label: ""
      })
      setProvinceCities([])
      load()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Gagal menambah alamat: " + (err.message || res.status))
    }
  }

  const setDefault = async (id) => {
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    })
    if (res.ok) load()
  }

  const delAddress = async (id) => {
    if (!confirm("Hapus alamat ini?")) return
    const res = await fetch(`/api/addresses/${id}`, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setAddresses(prev => prev.filter(a => a.id !== id))
      if (data.archived) {
        alert("Alamat telah diarsipkan karena pernah dipakai di pesanan.")
      }
      return
    }
    alert("Gagal hapus: " + (data.message || res.status))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900 font-semibold">Memuat profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Profile Tidak Ditemukan</h1>
          <p className="text-amber-700">Silakan login terlebih dahulu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Profile */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-300 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Profil Saya</h1>
              <p className="text-gray-600">Kelola informasi dan alamat pengiriman Anda</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 font-semibold">Email</p>
                <p className="text-amber-900 font-medium">{user.email}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 font-semibold">Role</p>
                <p className="text-amber-900 font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alamat Tersimpan */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-300 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-amber-900">Alamat Tersimpan</h2>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700 font-medium">Belum ada alamat tersimpan</p>
              <p className="text-amber-600 text-sm mt-1">Tambahkan alamat untuk memudahkan pengiriman</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map((a, index) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    a.isDefault 
                      ? 'border-amber-500 bg-amber-50 shadow-md' 
                      : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {a.label === 'Rumah' ? (
                        <Home className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Building className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="font-semibold text-amber-900">{a.label}</span>
                      {a.isDefault && (
                        <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-amber-800 space-y-1">
                    <p><span className="font-semibold">{a.recipient}</span> ({a.phone})</p>
                    <p>{a.street}</p>
                    <p>{a.city}, {a.province} {a.postalCode}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!a.isDefault && (
                      <motion.button
                        onClick={() => setDefault(a.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-all"
                      >
                        Jadikan Default
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => delAddress(a.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tambah Alamat Baru */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-300">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-amber-900">Tambah Alamat Baru</h2>
          </div>

          <div className="grid gap-4 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Nama Penerima
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                  placeholder="Nama lengkap penerima"
                  name="recipient"
                  value={form.recipient}
                  onChange={onChange}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  No. Telepon
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                  placeholder="Contoh: 081234567890"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Provinsi
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                placeholder="Pilih provinsi"
                name="province"
                value={form.province}
                onChange={onProvinceInput}
                list="province-list"
                autoComplete="address-level1"
              />
              <datalist id="province-list">
                {(regions.provinces || []).map(p => <option key={p.name} value={p.name} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Kota/Kabupaten
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base disabled:opacity-50"
                placeholder={form.province ? "Pilih kota" : "Pilih provinsi terlebih dahulu"}
                name="city"
                value={form.city}
                onChange={onChange}
                list="city-list"
                disabled={!form.province}
                autoComplete="address-level2"
              />
              <datalist id="city-list">
                {(provinceCities || []).map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Alamat Lengkap
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                placeholder="Jalan, nomor rumah, gedung, dll."
                name="street"
                value={form.street}
                onChange={onChange}
                autoComplete="street-address"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Kode Pos
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                  placeholder="Contoh: 12345"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={onChange}
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Label Alamat
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-amber-900 placeholder-amber-600/60 text-base"
                  placeholder="Contoh: Rumah, Kantor, Kos"
                  name="label"
                  value={form.label}
                  onChange={onChange}
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-3 mt-2">
              <input 
                type="checkbox" 
                name="isDefault" 
                checked={form.isDefault} 
                onChange={onChange}
                className="w-4 h-4 accent-amber-600"
              />
              <span className="text-amber-900 font-medium">Jadikan alamat default</span>
            </label>

            <motion.button
              onClick={addAddress}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 text-base mt-4"
            >
              <Plus className="w-5 h-5" />
              Simpan Alamat
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}