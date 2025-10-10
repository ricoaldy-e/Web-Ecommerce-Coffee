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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <AdminTopbar onToggleSidebar={toggle} />
      <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
        <div className="relative md:grid md:grid-cols-[16rem_1fr] md:gap-6">
          <AdminSidebar open={open} onClose={close} />
          <main className="pt-4 md:pt-6 md:pl-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}