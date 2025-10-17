// src/app/admin/products/page.js
"use client"

import { useEffect, useState } from "react"

export default function AdminProductsPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [q, setQ] = useState("")
  const [category, setCategory] = useState("")
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [form, setForm] = useState({
    name: "", slug: "", price: "", stock: "",
    categoryId: "", description: "", isActive: true,
  })
  const [createImageFile, setCreateImageFile] = useState(null)
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [edit, setEdit] = useState({
    name: "", slug: "", price: "", stock: "",
    categoryId: "", description: "", isActive: true,
    imageUrl: null,
  })
  const [replaceImageFile, setReplaceImageFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)

  // --- helpers ---
  const fetchAdminJSON = async (url, init) => {
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

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      credentials: "include",
      body: fd,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Upload gagal (${res.status})`)
    }
    const data = await res.json()
    return data.url
  }

  const load = async () => {
    try {
      const cats = await fetchAdminJSON(`/api/admin/categories?includeDeleted=1`)
      const prods = await fetchAdminJSON(
        `/api/admin/products?includeDeleted=${includeDeleted ? "1" : "0"}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`
      )
      setCategories(Array.isArray(cats) ? cats.filter(c => !c.deletedAt) : [])
      setProducts(Array.isArray(prods) ? prods : [])
    } catch {}
  }
  useEffect(() => { load() }, [q, category, includeDeleted])

  // --- create ---
  const onCreateChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(s => ({ ...s, [name]: type === "checkbox" ? checked : value }))
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      let imageUrl = null
      if (createImageFile) imageUrl = await uploadImage(createImageFile)

      const body = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        description: form.description || null,
        imageUrl,
        isActive: !!form.isActive,
      }
      await fetchAdminJSON("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      setForm({
        name: "", slug: "", price: "", stock: "",
        categoryId: "", description: "", isActive: true,
      })
      setCreateImageFile(null)
      await load()
      alert("✅ Produk dibuat")
    } catch (e2) {
      alert("Gagal buat produk: " + e2.message)
    } finally {
      setCreating(false)
    }
  }

  // --- edit ---
  const startEdit = (p) => {
    setEditingId(p.id)
    setEdit({
      name: p.name || "",
      slug: p.slug || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? ""),
      categoryId: String(p.category?.id ?? ""),
      description: p.description || "",
      isActive: !!p.isActive,
      imageUrl: p.imageUrl || null,
    })
    setReplaceImageFile(null)
    setRemoveImage(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setReplaceImageFile(null)
    setRemoveImage(false)
  }

  const saveEdit = async (id) => {
    try {
      setSaving(true)
      let finalImageUrl = edit.imageUrl || null
      if (removeImage) finalImageUrl = null
      else if (replaceImageFile) finalImageUrl = await uploadImage(replaceImageFile)

      const payload = {
        name: edit.name.trim(),
        slug: edit.slug.trim(),
        price: Number(edit.price),
        stock: Number(edit.stock),
        categoryId: edit.categoryId ? Number(edit.categoryId) : null,
        description: edit.description || null,
        isActive: !!edit.isActive,
        imageUrl: finalImageUrl,
      }

      await fetchAdminJSON(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      await load()
      cancelEdit()
      alert("✅ Produk diperbarui")
    } catch (e2) {
      alert("Gagal update: " + e2.message)
    } finally {
      setSaving(false)
    }
  }

  const softDelete = async (id) => {
    if (!confirm("Soft delete produk ini?")) return
    try {
      await fetchAdminJSON(`/api/admin/products/${id}`, { method: "DELETE" })
      await load()
    } catch (e2) {
      alert("Gagal delete: " + e2.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">Admin • Products</h1>
      </div>

      {/* Filters */}
      <div className="border border-amber-200 bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-2 items-center">
        <input
          className="border border-amber-300 rounded-md px-2 py-1 focus:outline-none focus:border-amber-500"
          placeholder="Cari produk..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border border-amber-300 rounded-md px-2 py-1 focus:outline-none focus:border-amber-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">(Semua kategori)</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-amber-900">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
          <span className="text-sm">Tampilkan yang terhapus</span>
        </label>
      </div>

      {/* Create */}
      <form
        onSubmit={submitCreate}
        className="border border-amber-200 bg-white rounded-xl shadow-md p-4 grid gap-2 max-w-2xl"
      >
        <div className="font-semibold text-amber-900 border-b-2 border-amber-600 pb-1">
          Tambah Produk
        </div>
        <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Nama" name="name" value={form.name} onChange={onCreateChange} />
        <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Slug (unik)" name="slug" value={form.slug} onChange={onCreateChange} />
        <div className="grid grid-cols-2 gap-2">
          <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Harga" name="price" value={form.price} onChange={onCreateChange} />
          <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Stok" name="stock" value={form.stock} onChange={onCreateChange} />
        </div>
        <select className="border border-amber-300 rounded-md px-2 py-1" name="categoryId" value={form.categoryId} onChange={onCreateChange}>
          <option value="">Pilih Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="grid gap-1">
          <label className="text-sm text-amber-900">Gambar (opsional)</label>
          <input type="file" accept="image/*" onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)} />
          {createImageFile && (
            <img src={URL.createObjectURL(createImageFile)} alt="preview" className="h-16 w-16 object-cover rounded border border-amber-300" />
          )}
        </div>

        <textarea className="border border-amber-300 rounded-md px-2 py-1" placeholder="Deskripsi" name="description" value={form.description} onChange={onCreateChange} />
        <label className="inline-flex items-center gap-2 text-amber-900">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={onCreateChange} /> Aktif
        </label>
        <button disabled={creating} className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded w-fit transition" type="submit">
          {creating ? "Menyimpan..." : "Buat Produk"}
        </button>
      </form>

      {/* List */}
      <ul className="space-y-3">
        {products.map((p) => {
          const isEditing = editingId === p.id
          return (
            <li key={p.id} className="border border-amber-200 bg-white rounded-xl shadow-md p-4">
              {!isEditing && (
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} className="h-16 w-16 object-cover rounded border border-amber-300" />
                    )}
                    <div>
                      <div className="font-semibold text-amber-900">
                        {p.name} {p.deletedAt && <span className="text-red-600 text-xs">(deleted)</span>}
                      </div>
                      <div className="text-sm text-amber-800">Slug: {p.slug} • Kategori: {p.category?.name || "-"}</div>
                      <div className="text-sm text-amber-800">Harga: Rp {Number(p.price).toLocaleString("id-ID")} • Stok: {p.stock}</div>
                      {p.description && <div className="text-xs mt-1 text-amber-700">{p.description}</div>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!p.deletedAt && (
                      <div className="flex gap-2">
                        <button className="px-2 py-1 border border-amber-300 text-amber-900 rounded hover:bg-amber-50" onClick={() => startEdit(p)}>Edit</button>
                        <button className="px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50" onClick={() => softDelete(p.id)}>Soft Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="grid gap-2">
                  <div className="flex gap-3 items-start">
                    {(!removeImage && (replaceImageFile || edit.imageUrl)) && (
                      <img
                        src={replaceImageFile ? URL.createObjectURL(replaceImageFile) : edit.imageUrl}
                        alt="preview"
                        className="h-16 w-16 object-cover rounded border border-amber-300"
                      />
                    )}
                    <div className="flex-1 grid gap-2">
                      <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Nama" value={edit.name} onChange={(e) => setEdit(s => ({ ...s, name: e.target.value }))} />
                      <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Slug" value={edit.slug} onChange={(e) => setEdit(s => ({ ...s, slug: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Harga" value={edit.price} onChange={(e) => setEdit(s => ({ ...s, price: e.target.value }))} />
                        <input className="border border-amber-300 rounded-md px-2 py-1" placeholder="Stok" value={edit.stock} onChange={(e) => setEdit(s => ({ ...s, stock: e.target.value }))} />
                      </div>
                      <select className="border border-amber-300 rounded-md px-2 py-1" value={edit.categoryId} onChange={(e) => setEdit(s => ({ ...s, categoryId: e.target.value }))}>
                        <option value="">(Kategori)</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <textarea className="border border-amber-300 rounded-md px-2 py-1" placeholder="Deskripsi" value={edit.description} onChange={(e) => setEdit(s => ({ ...s, description: e.target.value }))} />

                      <label className="inline-flex items-center gap-2 text-amber-900">
                        <input type="checkbox" checked={edit.isActive} onChange={(e) => setEdit(s => ({ ...s, isActive: e.target.checked }))} /> Aktif
                      </label>

                      <div className="grid gap-1">
                        <label className="text-sm text-amber-900">Gambar:</label>
                        <input type="file" accept="image/*" onChange={(e) => {
                          setReplaceImageFile(e.target.files?.[0] || null)
                          setRemoveImage(false)
                        }} />
                        <label className="inline-flex items-center gap-2 text-sm text-amber-900">
                          <input type="checkbox" checked={removeImage} onChange={(e) => {
                            setRemoveImage(e.target.checked)
                            if (e.target.checked) setReplaceImageFile(null)
                          }} /> Hapus gambar
                        </label>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button disabled={saving} className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded transition" onClick={() => saveEdit(p.id)} type="button">
                          {saving ? "Menyimpan..." : "Update"}
                        </button>
                        <button className="px-3 py-1 border border-amber-300 text-amber-900 rounded hover:bg-amber-50" onClick={cancelEdit} type="button">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
