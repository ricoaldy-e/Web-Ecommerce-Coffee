"use client"

import { useEffect, useState } from "react"
import { loadRegions, getCitiesForProvince } from "@/lib/regions"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [regions, setRegions] = useState({ provinces: [] })
  const [provinceCities, setProvinceCities] = useState([])

  const [form, setForm] = useState({
    recipient: "", phone: "",
    street: "",
    province: "", city: "",
    postalCode: "",
    isDefault: false,
    label: "",
  })

  const load = () => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null))

    fetch("/api/addresses", { credentials: "include", cache: "no-store" })
      .then(res => res.json())
      .then(list => setAddresses(Array.isArray(list) ? list : []))
      .catch(() => setAddresses([]))
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

  if (!user) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Profil</h1>
        <p>Sedang memuat...</p>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">Alamat Tersimpan</h2>
      {addresses.length === 0 && <p>Belum ada alamat.</p>}
      <ul className="space-y-2">
        {addresses.map(a => (
          <li key={a.id} className="border p-3 rounded">
            <div className="font-medium">
              {a.label} {a.isDefault && <span className="text-xs text-green-700">(Default)</span>}
            </div>
            <div className="text-sm">
              {a.recipient} ({a.phone}) — {a.street}, {a.city}, {a.province} {a.postalCode}
            </div>
            <div className="mt-2 flex gap-2">
              {!a.isDefault && (
                <button
                  onClick={() => setDefault(a.id)}
                  className="px-2 py-1 border rounded hover:bg-gray-50"
                >
                  Jadikan Default
                </button>
              )}
              <button
                onClick={() => delAddress(a.id)}
                className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">Tambah Alamat Baru</h2>
      <div className="grid gap-2 max-w-xl">
        {/* 👉 Urutan e-commerce standar */}
        <input
          className="border px-2 py-1 rounded"
          placeholder="Nama Penerima"
          name="recipient"
          value={form.recipient}
          onChange={onChange}
          autoComplete="name"
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="No. Telepon"
          name="phone"
          value={form.phone}
          onChange={onChange}
          autoComplete="tel"
        />

        {/* Provinsi */}
        <input
          className="border px-2 py-1 rounded"
          placeholder="Provinsi"
          name="province"
          value={form.province}
          onChange={onProvinceInput}
          list="province-list"
          autoComplete="address-level1"
        />
        <datalist id="province-list">
          {(regions.provinces || []).map(p => <option key={p.name} value={p.name} />)}
        </datalist>

        {/* Kota sesuai provinsi */}
        <input
          className="border px-2 py-1 rounded"
          placeholder="Kota/Kabupaten"
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

        <input
          className="border px-2 py-1 rounded"
          placeholder="Jalan/Detail"
          name="street"
          value={form.street}
          onChange={onChange}
          autoComplete="street-address"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="Kode Pos"
            name="postalCode"
            value={form.postalCode}
            onChange={onChange}
            autoComplete="postal-code"
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Label (Contoh: Rumah/Kantor)"
            name="label"
            value={form.label}
            onChange={onChange}
          />
        </div>

        <label className="inline-flex items-center gap-2 mt-1">
          <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onChange} />
          Jadikan default
        </label>

        <button onClick={addAddress} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
          Simpan Alamat
        </button>
      </div>
    </main>
  )
}