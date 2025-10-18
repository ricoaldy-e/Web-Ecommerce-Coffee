// src/app/admin/products/page.js
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"

/* ========== Toast minimal, pojok kanan bawah ========== */
function Toasts({ toasts, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            "max-w-[22rem] rounded-lg shadow-lg px-3 py-2 text-sm border",
            t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
            </span>
            <div className="flex-1">{t.message}</div>
            <button
              className="ml-2 text-xs opacity-70 hover:opacity-100"
              onClick={() => onClose(t.id)}
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ========== Popup konfirmasi nempel tombol (portal + auto posisi) ========== */
function InlinePopConfirm({
  open,
  anchorRef,
  title = "Hapus item?",
  description = "Tindakan ini adalah soft delete. Anda bisa memulihkannya nanti.",
  confirmText = "Hapus",
  cancelText = "Batal",
  onConfirm,
  onCancel,
}) {
  const popRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, placement: "bottom" })

  useEffect(() => setMounted(true), [])

  const updatePos = useCallback(() => {
    if (!anchorRef?.current || !popRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const popW = 260
    const popH = 132
    const gap = 8
    const vw = window.innerWidth
    const vh = window.innerHeight

    let placement = "bottom"
    let top = rect.bottom + gap + window.scrollY
    if (rect.bottom + gap + popH > vh) {
      placement = "top"
      top = rect.top - gap - popH + window.scrollY
    }

    let left = rect.left + rect.width - popW + window.scrollX
    left = Math.min(left, window.scrollX + vw - popW - 12)
    left = Math.max(left, window.scrollX + 12)

    setPos({ top, left, placement })
  }, [anchorRef])

  useEffect(() => {
    if (!open) return
    updatePos()
    const onScroll = () => updatePos()
    const onResize = () => updatePos()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onCancel?.() }
    const onClick = (e) => {
      if (!popRef.current?.contains(e.target) && !anchorRef?.current?.contains(e.target)) {
        onCancel?.()
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open, onCancel, anchorRef])

  if (!mounted || !open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9997] bg-black/10" />
      <div
        ref={popRef}
        className="absolute z-[9998] w-[260px] rounded-lg border border-amber-200 bg-white shadow-xl"
        style={{ top: pos.top, left: pos.left }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={[
            "absolute w-3 h-3 bg-white border border-amber-200 rotate-45",
            pos.placement === "bottom" ? "-top-1.5 right-4 border-b-0 border-r-0" : "-bottom-1.5 right-4 border-t-0 border-l-0",
          ].join(" ")}
          aria-hidden
        />
        <div className="p-3">
          <div className="text-sm font-semibold text-amber-900">{title}</div>
          <p className="text-xs text-amber-800 mt-1">{description}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
              onClick={onCancel}
            >
              {cancelText || "Batal"}
            </button>
            <button
              className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

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

  const [confirmId, setConfirmId] = useState(null)
  const deleteBtnRefs = useRef({})

  const [toasts, setToasts] = useState([])
  const seq = useRef(1)
  const pushToast = useCallback((message, type = "info", ttl = 3500) => {
    const id = seq.current++
    setToasts(s => [...s, { id, message, type }])
    if (ttl > 0) setTimeout(() => setToasts(s => s.filter(t => t.id !== id)), ttl)
  }, [])
  const closeToast = (id) => setToasts(s => s.filter(t => t.id !== id))

  const fetchAdminJSON = useCallback(async (url, init) => {
    const res = await fetch(url, { credentials: "include", cache: "no-store", ...(init || {}) })
    if (res.status === 401 || res.status === 403) {
      const msg = (await res.json().catch(() => ({})))?.message || "Unauthorized"
      pushToast(`❌ ${msg}. Login sebagai ADMIN.`, "error", 3000)
      setTimeout(() => { window.location.href = "/auth/login" }, 800)
      throw new Error("unauthorized")
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  }, [pushToast])

  const uploadImage = useCallback(async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/uploads", { method: "POST", credentials: "include", body: fd })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Upload gagal (${res.status})`)
    }
    const data = await res.json()
    return data.url
  }, [])

  const load = useCallback(async () => {
    try {
      const cats = await fetchAdminJSON(`/api/admin/categories?includeDeleted=1`)
      const prods = await fetchAdminJSON(
        `/api/admin/products?includeDeleted=${includeDeleted ? "1" : "0"}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`
      )
      setCategories(Array.isArray(cats) ? cats.filter(c => !c.deletedAt) : [])
      setProducts(Array.isArray(prods) ? prods : [])
    } catch (e) {
      pushToast(`Gagal memuat data: ${e.message}`, "error")
    }
  }, [fetchAdminJSON, includeDeleted, q, category, pushToast])

  useEffect(() => { load() }, [load])

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
      setForm({ name: "", slug: "", price: "", stock: "", categoryId: "", description: "", isActive: true })
      setCreateImageFile(null)
      await load()
      pushToast("Produk berhasil dibuat.", "success")
    } catch (e2) {
      pushToast(`Gagal membuat produk: ${e2.message}`, "error")
    } finally {
      setCreating(false)
    }
  }

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
      pushToast("Produk berhasil diperbarui.", "success")
    } catch (e2) {
      pushToast(`Gagal memperbarui: ${e2.message}`, "error")
    } finally {
      setSaving(false)
    }
  }

  const softDelete = async (id) => {
    try {
      await fetchAdminJSON(`/api/admin/products/${id}`, { method: "DELETE" })
      await load()
      pushToast("Produk berhasil dihapus (soft delete).", "success")
    } catch (e2) {
      pushToast(`Gagal menghapus: ${e2.message}`, "error")
    } finally {
      setConfirmId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-6 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold">Admin • Products</h1>
      </div>

      {/* Filters */}
      <div className="border border-amber-200 bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:flex-wrap gap-3 items-stretch md:items-center">
          <div className="flex items-center w-full md:w-auto">
              <input
                  className="border border-amber-300 rounded-l-md px-2 py-1 focus:outline-none focus:border-amber-500 w-full focus:z-10"
                  placeholder="Cari produk..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          e.preventDefault();
                          load();
                      }
                  }}
              />
              <button
                  type="button"
                  onClick={() => load()}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-r-md border border-amber-700 -ml-px"
                  aria-label="Cari produk"
              >
                  Cari
              </button>
          </div>

          <select
              className="border border-amber-300 rounded-md px-2 py-1 focus:outline-none focus:border-amber-500 w-full md:w-auto"
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
      <form onSubmit={submitCreate} className="border border-amber-200 bg-white rounded-xl shadow-md p-4 space-y-2 max-w-2xl overflow-hidden">
          <div className="font-semibold text-amber-900 border-b-2 border-amber-600 pb-1">Tambah Produk</div>
          
          <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Nama" name="name" value={form.name} onChange={onCreateChange} />
          
          <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Slug (unik)" name="slug" value={form.slug} onChange={onCreateChange} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Harga" name="price" value={form.price} onChange={onCreateChange} />
              <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Stok" name="stock" value={form.stock} onChange={onCreateChange} />
          </div>
          
          <select className="border border-amber-300 rounded-md px-2 py-1 w-full" name="categoryId" value={form.categoryId} onChange={onCreateChange}>
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

          <textarea
              className="border border-amber-300 rounded-md px-2 py-1 min-h-28 resize-y w-full"
              placeholder="Deskripsi"
              name="description"
              value={form.description}
              onChange={onCreateChange}
              rows={6}
          />
          
          <label className="inline-flex items-center gap-2 text-amber-900">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={onCreateChange} /> Aktif
          </label>
          
          <div className="pt-2">
              <button disabled={creating} className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded w-fit transition" type="submit">
                  {creating ? "Menyimpan..." : "Buat Produk"}
              </button>
          </div>
      </form>

      {/* List */}
      <ul className="space-y-3">
        {products.map((p) => {
          const isEditing = editingId === p.id
          const isConfirming = confirmId === p.id
          if (!deleteBtnRefs.current[p.id]) deleteBtnRefs.current[p.id] = { current: null }
          return (
            <li key={p.id} className="relative border border-amber-200 bg-white rounded-xl shadow-md p-4 max-w-full overflow-hidden">
              {!isEditing && (
                 <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-3 min-w-0 w-full">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} className="h-16 w-16 object-cover rounded border border-amber-300 flex-shrink-0" />
                    )}
                    <div className="min-w-0 w-full">
                      <div className="font-semibold text-amber-900 break-words">
                        {p.name} {p.deletedAt && <span className="text-red-600 text-xs">(deleted)</span>}
                      </div>
                      <div className="text-sm text-amber-800 break-words">
                        Slug: {p.slug} • Kategori: {p.category?.name || "-"}
                      </div>
                      <div className="text-sm text-amber-800">
                        Harga: Rp {Number(p.price).toLocaleString("id-ID")} • Stok: {p.stock}
                      </div>
                      {p.description && (
                        <div className="text-xs mt-1 text-amber-700 whitespace-pre-wrap break-words max-h-32 overflow-auto pr-1">
                          {p.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 self-end md:self-auto">
                    {!p.deletedAt && (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 border border-amber-300 text-amber-900 rounded hover:bg-amber-50 text-sm"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          ref={(el) => (deleteBtnRefs.current[p.id].current = el)}
                          className="px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm"
                          onClick={() => setConfirmId(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <InlinePopConfirm
                    open={isConfirming}
                    anchorRef={deleteBtnRefs.current[p.id]}
                    title="Yakin hapus produk ini?"
                    description="Produk ini akan dihapus dari daftar dan tidak dapat digunakan kembali. Lanjutkan?"
                    confirmText="Hapus"
                    cancelText="Batal"
                    onCancel={() => setConfirmId(null)}
                    onConfirm={() => softDelete(p.id)}
                  />
                </div>
              )}

              {isEditing && (
                <div className="grid gap-2">
                  <div className="flex flex-col md:flex-row gap-4 items-start min-w-0">
                    {(!removeImage && (replaceImageFile || edit.imageUrl)) && (
                      <img
                        src={replaceImageFile ? URL.createObjectURL(replaceImageFile) : edit.imageUrl}
                        alt="preview"
                        className="h-16 w-16 object-cover rounded border border-amber-300 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 grid gap-2 min-w-0 w-full">
                      <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Nama" value={edit.name} onChange={(e) => setEdit(s => ({ ...s, name: e.target.value }))} />
                      <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Slug" value={edit.slug} onChange={(e) => setEdit(s => ({ ...s, slug: e.target.value }))} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Harga" value={edit.price} onChange={(e) => setEdit(s => ({ ...s, price: e.target.value }))} />
                        <input className="border border-amber-300 rounded-md px-2 py-1 w-full" placeholder="Stok" value={edit.stock} onChange={(e) => setEdit(s => ({ ...s, stock: e.target.value }))} />
                      </div>
                      <select className="border border-amber-300 rounded-md px-2 py-1 w-full" value={edit.categoryId} onChange={(e) => setEdit(s => ({ ...s, categoryId: e.target.value }))}>
                        <option value="">(Kategori)</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <textarea
                        className="border border-amber-300 rounded-md px-2 py-1 min-h-28 resize-y w-full min-w-0"
                        placeholder="Deskripsi"
                        value={edit.description}
                        onChange={(e) => setEdit(s => ({ ...s, description: e.target.value }))}
                        rows={6}
                      />
                      <label className="inline-flex items-center gap-2 text-amber-900">
                        <input type="checkbox" checked={edit.isActive} onChange={(e) => setEdit(s => ({ ...s, isActive: e.target.checked }))} /> Aktif
                      </label>
                      <div className="grid gap-1">
                        <label className="text-sm text-amber-900">Gambar:</label>
                        <input type="file" accept="image/*" onChange={(e) => { setReplaceImageFile(e.target.files?.[0] || null); setRemoveImage(false) }} />
                        <label className="inline-flex items-center gap-2 text-sm text-amber-900">
                          <input type="checkbox" checked={removeImage} onChange={(e) => { setRemoveImage(e.target.checked); if (e.target.checked) setReplaceImageFile(null) }} /> Hapus gambar
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

      <Toasts toasts={toasts} onClose={closeToast} />
    </main>
  )
}