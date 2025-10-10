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

export async function PATCH(req, { params }) {
  const [me, err] = await assertUser()
  if (!me) return err

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const { label, recipient, phone, street, city, province, postalCode, isDefault } = body

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== me.id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (typeof isDefault === 'boolean' && isDefault) {
      await tx.address.updateMany({
        where: { userId: me.id, isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.address.update({
      where: { id },
      data: {
        ...(label != null ? { label } : {}),
        ...(recipient != null ? { recipient } : {}),
        ...(phone != null ? { phone } : {}),
        ...(street != null ? { street } : {}),
        ...(city != null ? { city } : {}),
        ...(province != null ? { province } : {}),
        ...(postalCode != null ? { postalCode } : {}),
        ...(typeof isDefault === 'boolean' ? { isDefault } : {}),
      },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const [me, err] = await assertUser()
  if (!me) return err

  const id = Number(params.id)
  if (!id) return NextResponse.json({ message: 'Invalid id' }, { status: 400 })

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== me.id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const used = await prisma.order.count({ where: { addressId: id } })
  if (used > 0) {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.address.update({
        where: { id },
        data: { isArchived: true, isDefault: false },
        select: { id: true, isDefault: true }
      })
      const other = await tx.address.findFirst({
        where: { userId: me.id, isArchived: false, id: { not: id } },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      })
      if (other) {
        await tx.address.update({
          where: { id: other.id },
          data: { isDefault: true }
        })
      }
      return { ok: true, archived: true }
    })
    return NextResponse.json(result)
  }

  const result = await prisma.$transaction(async (tx) => {
    if (address.isDefault) {
      const other = await tx.address.findFirst({
        where: { userId: me.id, isArchived: false, id: { not: id } },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      })
      if (other) {
        await tx.address.update({
          where: { id: other.id },
          data: { isDefault: true }
        })
      }
    }
    await tx.address.delete({ where: { id } })
    return { ok: true, archived: false }
  })

  return NextResponse.json(result)
}