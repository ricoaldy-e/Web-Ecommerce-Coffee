// src/app/admin/categories/page.js
"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

// ========= Reusable Components =========

function Toasts({ toasts, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            "max-w-[22rem] rounded-lg shadow-lg px-3 py-2 text-sm border",
            t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
            t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            "bg-amber-50 border-amber-200 text-amber-800",
          ].join(" ")}
          role="status" aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5">{t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}</span>
            <div className="flex-1">{t.message}</div>
            <button className="ml-2 text-xs opacity-70 hover:opacity-100" onClick={() => onClose(t.id)} aria-label="Tutup notifikasi">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function InlinePopConfirm({ open, anchorRef, title, description, onConfirm, onCancel }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (!anchorRef?.current || !popRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 260;
    let top = rect.bottom + 8 + window.scrollY;
    let left = rect.right - popW + window.scrollX;
    setPos({ top, left });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onCancel?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos);
    };
  }, [open, anchorRef, onCancel, updatePos]);

  if (!open) return null;

  return createPortal(
    <div ref={popRef} className="absolute z-[9998] w-[260px] rounded-lg border border-amber-200 bg-white shadow-xl p-3" style={{ top: pos.top, left: pos.left }}>
      <div className="text-sm font-semibold text-amber-900">{title}</div>
      <p className="text-xs text-amber-800 mt-1">{description}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium" onClick={onCancel}>Batal</button>
        <button className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Hapus</button>
      </div>
    </div>,
    document.body
  );
}

// ========= Row Component =========

function Row({ c, onUpdate, onDeleteRequest, pushToast }) {
  const [name, setName] = useState(c.name || "")
  const [slug, setSlug] = useState(c.slug || "")
  const [saving, setSaving] = useState(false)
  const deleteBtnRef = useRef(null)

  const changed = useMemo(() => name !== (c.name || "") || slug !== (c.slug || ""), [name, slug, c])

  const reset = () => {
    setName(c.name || "")
    setSlug(c.slug || "")
  }

  const update = async () => {
    setSaving(true)
    try {
      const updatedData = { name: name.trim(), slug: slug.trim() };
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Credentials": "include" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal update');

      onUpdate(c.id, updatedData);
      pushToast("Kategori berhasil diperbarui.", "success");
    } catch (e) {
      pushToast(`Gagal update: ${e.message}`, "error");
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="bg-white border border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="text-amber-900 font-semibold text-base break-words">
            {c.name}{" "}
            {c.deletedAt && <span className="text-red-600 text-xs font-normal">(deleted)</span>}
          </div>
          <div className="text-sm text-amber-700/80 break-words">Slug: {c.slug || "-"}</div>
        </div>
        {!c.deletedAt && (
          <button
            ref={deleteBtnRef}
            className="text-sm px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
            onClick={() => onDeleteRequest(c.id, deleteBtnRef)}
          >
            Delete
          </button>
        )}
      </div>

      {!c.deletedAt && (
        <div className="mt-4 pt-4 border-t border-amber-100 grid gap-3 sm:grid-cols-2">
          <input
            className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm min-w-0"
            placeholder="Nama" value={name} onChange={e => setName(e.target.value)}
          />
          <input
            className="border border-amber-300 bg-amber-50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm min-w-0"
            placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)}
          />
          <div className="sm:col-span-2 flex gap-2">
            {/* Changed: Button color updated for consistency */}
            <button
              className="px-4 py-2 rounded-lg bg-amber-700 text-white hover:bg-amber-800 text-sm font-medium shadow-sm disabled:cursor-not-allowed"
              onClick={update} disabled={!changed || saving} type="button"
            >
              {saving ? "Menyimpan..." : "Update"}
            </button>
            {/* Changed: Button color updated for consistency */}
            <button
              className="px-4 py-2 rounded-lg border border-amber-300 text-amber-900 hover:bg-amber-50 text-sm disabled:opacity-50"
              type="button" onClick={reset} disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

// ========= Main Page Component =========

export default function AdminCategoriesPage() {
  const [list, setList] = useState([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const [toasts, setToasts] = useState([])
  const toastSeq = useRef(1)
  const [confirmDelete, setConfirmDelete] = useState({ id: null, anchorRef: null });

  const pushToast = useCallback((message, type = "info", ttl = 3500) => {
    const id = toastSeq.current++;
    setToasts(s => [...s, { id, message, type }]);
    if (ttl > 0) setTimeout(() => setToasts(s => s.filter(t => t.id !== id)), ttl);
  }, []);
  const closeToast = id => setToasts(s => s.filter(t => t.id !== id));

  const fetchAdminJSON = useCallback(async (url, init) => {
    const res = await fetch(url, { credentials: "include", cache: "no-store", ...(init || {}) });
    if (res.status === 401 || res.status === 403) {
      const msg = (await res.json().catch(() => ({})))?.message || "Unauthorized";
      pushToast(`❌ ${msg}. Login sebagai ADMIN.`, "error");
      setTimeout(() => window.location.href = "/auth/login", 800);
      throw new Error("unauthorized");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }, [pushToast]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminJSON("/api/admin/categories?includeDeleted=1");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      pushToast("Gagal memuat kategori.", "error");
    } finally {
      setLoading(false);
    }
  }, [fetchAdminJSON, pushToast]);

  useEffect(() => { load() }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const createdCategory = await fetchAdminJSON("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      setName(""); setSlug("");
      setList(currentList => [createdCategory, ...currentList]);
      pushToast("Kategori berhasil dibuat.", "success");
    } catch (e2) {
      pushToast(`Gagal buat kategori: ${e2.message}`, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = (id, updatedData) => {
    setList(list => list.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  const requestDelete = (id, anchorRef) => {
    setConfirmDelete({ id, anchorRef });
  };

  const executeDelete = async () => {
    const idToDelete = confirmDelete.id;
    if (!idToDelete) return;

    try {
      await fetchAdminJSON(`/api/admin/categories/${idToDelete}`, { method: "DELETE" });
      setList(list => list.map(c => c.id === idToDelete ? { ...c, deletedAt: new Date().toISOString() } : c));
      pushToast("Kategori berhasil dihapus (soft delete).", "success");
    } catch (e2) {
      pushToast(`Gagal menghapus: ${e2.message}`, "error");
    } finally {
      setConfirmDelete({ id: null, anchorRef: null });
    }
  };

  const filteredList = useMemo(() => {
    if (includeDeleted) return list;
    return list.filter(c => !c.deletedAt);
  }, [list, includeDeleted]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-6 space-y-6">
      <Toasts toasts={toasts} onClose={closeToast} />

      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold">Admin • Categories</h1>
      </div>

      <form onSubmit={create} className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm grid gap-3 max-w-lg">
        <h2 className="font-semibold tracking-wide text-amber-800">Tambah Kategori Baru</h2>
        <input
          className="border border-amber-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm min-w-0"
          placeholder="Nama Kategori" value={name} onChange={e => setName(e.target.value)} required
        />
        <input
          className="border border-amber-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm min-w-0"
          placeholder="Slug (otomatis jika kosong)" value={slug} onChange={e => setSlug(e.target.value)}
        />
        {/* Changed: Button color updated for consistency */}
        <button
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg w-fit text-sm font-medium shadow-sm"
          type="submit" disabled={creating || !name}
        >
          {creating ? "Menyimpan..." : "Buat Kategori"}
        </button>
      </form>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold tracking-wide text-amber-800">Daftar Kategori</h2>
          <label className="inline-flex items-center gap-2 text-amber-900 cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-amber-600 focus:ring-amber-500"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            <span className="text-sm">Tampilkan yang terhapus</span>
          </label>
        </div>
        {loading ? (
          <p className="text-center py-8 text-amber-700">Memuat data...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-center py-8 text-amber-700/70">
            {includeDeleted ? "Tidak ada kategori yang ditemukan." : "Tidak ada kategori aktif."}
          </p>
        ) : (
          <ul className="space-y-4">
            {filteredList.map(c => (
              <Row key={c.id} c={c} onUpdate={handleUpdate} onDeleteRequest={requestDelete} pushToast={pushToast} />
            ))}
          </ul>
        )}
      </section>
      
      <InlinePopConfirm
        open={!!confirmDelete.id}
        anchorRef={confirmDelete.anchorRef}
        title="Hapus Kategori?"
        description="Ini adalah soft delete. Kategori tidak akan bisa digunakan lagi."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ id: null, anchorRef: null })}
      />
    </main>
  )
}