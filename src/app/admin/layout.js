// src/app/admin/layout.js
import { getCurrentUser } from "@/lib/currentUser"
import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"

export const runtime = "nodejs"
export const metadata = { title: "Admin • Coffee" }

export default async function AdminLayout({ children }) {
  const me = await getCurrentUser()
  if (!me) redirect(`/auth/login?next=/admin`)
  if (me.role !== "ADMIN") redirect("/")

  // Bungkus semua halaman admin dengan AdminShell (Topbar + Sidebar)
  return <AdminShell>{children}</AdminShell>
}