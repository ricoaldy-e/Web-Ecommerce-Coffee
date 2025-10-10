// src/components/RootNavbarGate.js
"use client"
import { usePathname } from "next/navigation"

export default function RootNavbarGate({ children }) {
  const pathname = usePathname() || "/"
  // Sembunyikan navbar toko di seluruh route /admin/**
  if (pathname.startsWith("/admin")) return null
  return children
}
