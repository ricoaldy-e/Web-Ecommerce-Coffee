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
    } catch (e) {
      alert("Gagal update: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="border p-3 rounded">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">
            {c.name} {c.deletedAt && <span className="text-red-600 text-xs">(deleted)</span>}
          </div>
          <div className="text-sm">Slug: {c.slug}</div>
        </div>
        {!c.deletedAt && (
          <button className="px-2 py-1 border rounded" onClick={() => onDelete(c.id)}>
            Soft Delete
          </button>
        )}
      </div>

      {!c.deletedAt && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className="border px-2 py-1" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} />
          <input className="border px-2 py-1" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} />
          <div className="sm:col-span-2 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-black text-white disabled:opacity-50"
              onClick={update}
              disabled={!changed || saving}
              type="button"
            >
              {saving ? "Menyimpan..." : "Update"}
            </button>
            <button className="px-3 py-1 rounded border" type="button" onClick={reset} disabled={saving}>
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
      load()
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
      load()
    } catch (e2) {
      alert("Gagal delete: " + e2.message)
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Admin • Categories</h1>

      <form onSubmit={create} className="border p-3 rounded mb-6 grid gap-2 max-w-md">
        <div className="font-semibold">Tambah Kategori</div>
        <input className="border px-2 py-1" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} />
        <input className="border px-2 py-1" placeholder="Slug (opsional)" value={slug} onChange={e => setSlug(e.target.value)} />
        <button className="px-3 py-1 bg-black text-white rounded w-fit" type="submit" disabled={creating}>
          {creating ? "Menyimpan..." : "Buat"}
        </button>
      </form>

      <ul className="space-y-3">
        {list.map(c => (
          <Row key={c.id} c={c} onUpdated={load} onDelete={del} />
        ))}
      </ul>
    </main>
  )
}