"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"

const ToastCtx = createContext(null)

let idSeq = 1
const ICON = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
}
const PALETTE = {
  success: {
    border: "border-green-300",
    bg: "bg-green-50",
    text: "text-green-900",
    pill: "bg-green-100 text-green-800",
    icon: "text-green-700",
    shadow: "shadow-green-200",
    progress: "bg-green-300",
  },
  error: {
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-900",
    pill: "bg-red-100 text-red-800",
    icon: "text-red-700",
    shadow: "shadow-red-200",
    progress: "bg-red-300",
  },
  info: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-900",
    pill: "bg-amber-100 text-amber-800",
    icon: "text-amber-700",
    shadow: "shadow-amber-200",
    progress: "bg-amber-300",
  },
  warning: {
    border: "border-orange-300",
    bg: "bg-orange-50",
    text: "text-orange-900",
    pill: "bg-orange-100 text-orange-800",
    icon: "text-orange-700",
    shadow: "shadow-orange-200",
    progress: "bg-orange-300",
  },
}

export default function ToastProvider({ children, position = "bottom-right" }) {
  const [items, setItems] = useState([])

  const push = useCallback((payload) => {
    const id = idSeq++
    const {
      title,
      message,
      type = "info",
      duration = 2800,
    } = payload || {}

    setItems((prev) => [...prev, { id, title, message, type, duration }])

    // auto dismiss
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, Math.max(1200, duration))
  }, [])

  const close = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const api = useMemo(() => ({
    push,
    success: (msg, opts={}) => push({ message: msg, type: "success", ...opts }),
    error:   (msg, opts={}) => push({ message: msg, type: "error",   ...opts }),
    info:    (msg, opts={}) => push({ message: msg, type: "info",    ...opts }),
    warning: (msg, opts={}) => push({ message: msg, type: "warning", ...opts }),
  }), [push])

  const posCls = {
    "top-right":    "top-4 right-4",
    "top-left":     "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left":  "bottom-4 left-4",
  }[position] || "bottom-right"

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Container */}
      <div className={`pointer-events-none fixed z-[1000] ${posCls} flex flex-col gap-3 w-[min(92vw,380px)]`}>
        {items.map((t) => <ToastItem key={t.id} {...t} onClose={() => close(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastItem({ id, title, message, type = "info", duration = 2800, onClose }) {
  const Icon = ICON[type] || ICON.info
  const C = PALETTE[type] || PALETTE.info
  const progressRef = useRef(null)

  return (
    <div className={`pointer-events-auto border ${C.border} ${C.bg} rounded-xl shadow-md ${C.shadow} overflow-hidden`}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${C.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            {title && <div className={`text-sm font-semibold ${C.text}`}>{title}</div>}
            {message && <div className={`text-sm ${C.text} leading-snug break-words`}>{message}</div>}
          </div>
          <button
            onClick={onClose}
            className="ml-1 rounded-md p-1 hover:bg-black/5 text-black/50"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* progress bar */}
      <div className={`h-1 ${C.progress}`} style={{ animation: `shrink ${duration}ms linear forwards` }} />
      <style jsx>{`
        @keyframes shrink {
          from { width: 100% }
          to   { width: 0% }
        }
      `}</style>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />")
  return ctx
}