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
    recipient: "",
    phone: "",
    street: "",
    province: "",
    city: "",
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
  useEffect(() => { loadRegions().then(setRegions) }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const onProvinceInput = (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, province: value, city: "" }))
    setProvinceCities(getCitiesForProvince(regions, value))
  }

  const addAddress = async () => {
    const required = ["recipient", "phone", "street", "province", "city", "postalCode", "label"]
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
        recipient: "",
        phone: "",
        street: "",
        province: "",
        city: "",
        postalCode: "",
        isDefault: false,
        label: "",
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
      if (data.archived) alert("Alamat telah diarsipkan karena pernah dipakai di pesanan.")
    } else {
      alert("Gagal hapus: " + (data.message || res.status))
    }
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
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Profil Tidak Ditemukan</h1>
          <p className="text-amber-700">Silakan login terlebih dahulu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-10 px-4 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header Profile */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-md">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-amber-900 mb-1">Profil Saya</h1>
            <p className="text-gray-600 mb-4">Kelola informasi dan alamat pengiriman Anda</p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-md">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-700 font-semibold">Email</p>
                <p className="text-amber-900 font-medium break-all">{user.email}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-700 font-semibold">Role</p>
                <p className="text-amber-900 font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Alamat */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Alamat Tersimpan</h2>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700 font-medium">Belum ada alamat tersimpan</p>
              <p className="text-amber-600 text-sm mt-1">Tambahkan alamat untuk memudahkan pengiriman</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((a, index) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    a.isDefault
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-amber-200 bg-amber-50/60 hover:border-amber-400"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {a.label === "Rumah" ? (
                        <Home className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Building className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="font-semibold text-amber-900">{a.label}</span>
                      {a.isDefault && (
                        <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-amber-800 space-y-1 mb-4">
                    <p><span className="font-semibold">{a.recipient}</span> ({a.phone})</p>
                    <p>{a.street}</p>
                    <p>{a.city}, {a.province} {a.postalCode}</p>
                  </div>

                  <div className="flex gap-2">
                    {!a.isDefault && (
                      <motion.button
                        onClick={() => setDefault(a.id)}
                        whileHover={{ scale: 1.05 }}
                        className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
                      >
                        Jadikan Default
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => delAddress(a.id)}
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 flex items-center justify-center gap-1"
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

        {/* Tambah Alamat */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Tambah Alamat Baru</h2>
          </div>

          <div className="grid gap-4 max-w-2xl">
            {[
              { label: "Nama Penerima", name: "recipient", placeholder: "Nama lengkap penerima" },
              { label: "No. Telepon", name: "phone", placeholder: "Contoh: 081234567890" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-amber-900 mb-2">{f.label}</label>
                <input
                  name={f.name}
                  value={form[f.name]}
                  onChange={onChange}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-amber-900"
                />
              </div>
            ))}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Provinsi</label>
                <input
                  name="province"
                  value={form.province}
                  onChange={onProvinceInput}
                  list="province-list"
                  placeholder="Pilih provinsi"
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <datalist id="province-list">
                  {(regions.provinces || []).map(p => <option key={p.name} value={p.name} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Kota/Kabupaten</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  list="city-list"
                  placeholder={form.province ? "Pilih kota" : "Pilih provinsi terlebih dahulu"}
                  disabled={!form.province}
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
                />
                <datalist id="city-list">
                  {(provinceCities || []).map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">Alamat Lengkap</label>
              <input
                name="street"
                value={form.street}
                onChange={onChange}
                placeholder="Jalan, nomor rumah, gedung, dll."
                className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Kode Pos</label>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={onChange}
                  placeholder="Contoh: 12345"
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Label Alamat</label>
                <input
                  name="label"
                  value={form.label}
                  onChange={onChange}
                  placeholder="Contoh: Rumah, Kantor, Kos"
                  className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 outline-none"
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 mt-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
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
