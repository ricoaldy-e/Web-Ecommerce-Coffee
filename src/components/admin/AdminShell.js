// src/components/admin/AdminShell.js
"use client"

import { useState, useCallback } from "react"
import AdminTopbar from "./AdminTopbar"
import AdminSidebar from "./AdminSidebar"

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((s) => !s), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 via-amber-100 to-yellow-50 text-neutral-900">
      {/* === Topbar === */}
      <AdminTopbar onToggleSidebar={toggle} />

      {/* === Content wrapper === */}
      <div className="flex-1 w-full mx-auto max-w-[120rem] flex flex-col md:flex-row">
        {/* Sidebar */}
        <AdminSidebar open={open} onClose={close} />

        {/* Main content */}
        <main
          className="
            flex-1 
            p-4 md:p-6 
            bg-white/60 
            backdrop-blur-sm 
            rounded-tl-2xl md:rounded-none
            shadow-inner
          "
        >
          <div className="bg-white/80 border border-amber-300 rounded-2xl p-6 shadow-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
