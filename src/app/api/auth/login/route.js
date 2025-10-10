// src/app/api/auth/login/route.js
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { signToken } from "@/lib/jwt"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ message: "Email tidak ditemukan" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return Response.json({ message: "Password salah" }, { status: 401 })
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Lax cukup aman & minim efek samping di navigasi top-level
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    return Response.json({
      message: "Login berhasil",
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error("❌ Error login:", err)
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}