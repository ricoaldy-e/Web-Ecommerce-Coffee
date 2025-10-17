// src/app/admin/categories/page.js
"use client"

import { useEffect, useState, useMemo } from "react"

async function fetchAdminJSON(url, init) {
  const res = await fetch(url, { credentials: "include", cache: "no-store", ...(init || {}) })
  if (res.status === 401 || res.status === 403) {
    const msg = (await res.json().catch(() => ({})))?.message || "Unauthorized"
    alert("❌ " + msg + ". Login sebagai ADMIN.")
    window.location.href = "/auth/login"
    throw new Error("unauthorized")
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

function Row({ c, onUpdated, onDelete }) {
  const [name, setName] = useState(c.name || "")
  const [slug, setSlug] = useState(c.slug || "")
  const [saving, setSaving] = useState(false)

  const changed = useMemo(() =>
    name !== (c.name || "") || slug !== (c.slug || "")
  , [name, slug, c])

  const reset = () => {
    setName(c.name || "")
    setSlug(c.slug || "")
  }

  const update = async () => {
    setSaving(true)
    try {
      await fetchAdminJSON(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      })
      onUpdated()
      alert("✅ Kategori diperbarui")
    } catch (e) {
      alert("Gagal update: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-amber-900 font-semibold text-base">
            {c.name}{" "}
            {c.deletedAt && (
              <span className="text-red-600 text-xs">(deleted)</span>
            )}
          </div>
          <div className="text-sm text-amber-700/80">Slug: {c.slug || "-"}</div>
        </div>
        {!c.deletedAt && (
          <button
            className="text-sm px-3 py-1.5 border border-amber-300 rounded-lg text-amber-800 hover:bg-amber-50 transition-colors"
            onClick={() => onDelete(c.id)}
          >
            Soft Delete
          </button>
        )}
      </div>

      {!c.deletedAt && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            placeholder="Nama"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            placeholder="Slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 text-sm font-medium shadow-sm"
              onClick={update}
              disabled={!changed || saving}
              type="button"
            >
              {saving ? "Menyimpan..." : "Update"}
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-amber-300 hover:bg-amber-50 text-sm text-amber-800"
              type="button"
              onClick={reset}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

export default function AdminCategoriesPage() {
  const [list, setList] = useState([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      const data = await fetchAdminJSON("/api/admin/categories?includeDeleted=1")
      setList(Array.isArray(data) ? data : [])
    } catch {}
  }
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await fetchAdminJSON("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      })
      setName(""); setSlug("")
      await load()
      alert("✅ Kategori dibuat")
    } catch (e2) {
      alert("Gagal buat kategori: " + e2.message)
    } finally {
      setCreating(false)
    }
  }

  const del = async (id) => {
    if (!confirm("Soft delete kategori ini? (Ditolak jika masih dipakai produk)")) return
    try {
      await fetchAdminJSON(`/api/admin/categories/${id}`, { method: "DELETE" })
      await load()
    } catch (e2) {
      alert("Gagal delete: " + e2.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Admin • Orders</h1>
      </div>

      {/* Create form */}
      <form
        onSubmit={create}
        className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 grid gap-3 max-w-lg"
      >
        <div className="uppercase text-xs font-semibold tracking-wide text-amber-600">
          Tambah Kategori
        </div>
        <input
          className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          placeholder="Nama"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          placeholder="Slug (opsional)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg w-fit text-sm font-medium shadow-sm"
          type="submit"
          disabled={creating}
        >
          {creating ? "Menyimpan..." : "Buat"}
        </button>
      </form>

      {/* List */}
      <section>
        <div className="uppercase text-xs font-semibold tracking-wide text-amber-600 mb-3">
          Daftar Kategori
        </div>
        <ul className="space-y-4">
          {list.map(c => (
            <Row key={c.id} c={c} onUpdated={load} onDelete={del} />
          ))}
        </ul>
      </section>
    </main>
  )
}
