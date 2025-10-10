// src/app/api/auth/logout/route.js
import { cookies } from "next/headers"

export async function POST() {
  // Hapus cookie token (expire segera)
  cookies().set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return Response.json({ message: "Logged out" })
}