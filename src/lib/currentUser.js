// src/lib/currentUser.js
import 'server-only'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  try {
    const token = cookies().get('token')?.value
    if (!token) return null

    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('❌ JWT_SECRET tidak ditemukan')
      return null
    }

    // Verify token menggunakan jsonwebtoken (sama seperti di middleware)
    const payload = jwt.verify(token, secret)
    
    if (!payload?.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    })
    
    return user || null
  } catch (err) {
    console.error('❌ getCurrentUser error:', err.message)
    return null
  }
}