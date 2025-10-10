// src/app/api/auth/me/route.js
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({ user })
}