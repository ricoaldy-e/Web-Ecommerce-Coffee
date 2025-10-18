"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

export default function InlinePopConfirm({
  open,
  anchorRef,
  title = "Anda yakin?",
  description = "Tindakan ini tidak dapat diurungkan.",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  onCancel,
}) {
  const popRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const updatePos = useCallback(() => {
    if (!anchorRef?.current || !popRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const popW = 260
    let top = rect.bottom + 8 + window.scrollY
    let left = rect.right - popW + window.scrollX
    // Clamp to viewport
    left = Math.max(16, Math.min(left, window.innerWidth - popW - 16))
    
    setPos({ top, left })
  }, [anchorRef])

  useEffect(() => {
    if (!open) return
    updatePos()
    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onCancel?.()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", updatePos)
    window.addEventListener("scroll", updatePos, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", updatePos)
      window.removeEventListener("scroll", updatePos)
    }
  }, [open, anchorRef, onCancel, updatePos])

  if (!open) return null

  return createPortal(
    <div
      ref={popRef}
      className="absolute z-[9998] w-[260px] rounded-lg border border-amber-200 bg-white shadow-xl p-3"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="text-sm font-semibold text-amber-900">{title}</div>
      <p className="text-xs text-amber-800 mt-1">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>,
    document.body
  )
}