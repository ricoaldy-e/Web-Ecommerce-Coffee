import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function assertUser() {
  const me = await getCurrentUser()
  if (!me) return [null, NextResponse.json({ message: 'Unauthorized' }, { status: 401 })]
  if (me.role !== 'USER') return [null, NextResponse.json({ message: 'Only USER can manage addresses' }, { status: 403 })]
  return [me, null]
}

// GET /api/addresses → list alamat user (hanya yang tidak diarsipkan)
export async function GET() {
  const [me, err] = await assertUser()
  if (!me) return err

  const addresses = await prisma.address.findMany({
    where: { userId: me.id, isArchived: false },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(addresses)
}

// POST /api/addresses → tambah alamat
export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const body = await req.json().catch(() => ({}))
  const { label, recipient, phone, street, city, province, postalCode, isDefault } = body || {}

  const labelStr = String(label ?? "").trim()
  if (!labelStr || !recipient || !phone || !street || !province || !city || !postalCode) {
    return NextResponse.json({ message: 'Incomplete address (label wajib)' }, { status: 400 })
  }

  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId: me.id, isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.address.create({
      data: {
        userId: me.id,
        label: labelStr,
        recipient, phone, street, city, province, postalCode,
        isDefault: !!isDefault,
      },
    })
  })

  return NextResponse.json(created, { status: 201 })
}