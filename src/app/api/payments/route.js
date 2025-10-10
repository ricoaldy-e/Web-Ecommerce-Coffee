import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function assertUser() {
  const me = await getCurrentUser()
  if (!me) return [null, NextResponse.json({ message: 'Unauthorized' }, { status: 401 })]
  if (me.role !== 'USER') return [null, NextResponse.json({ message: 'Only USER can submit payment' }, { status: 403 })]
  return [me, null]
}

export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  try {
    const { orderId, method, proofUrl, proofBase64 } = await req.json().catch(() => ({}))

    if (!orderId || !method) {
      return NextResponse.json({ message: 'orderId & method required' }, { status: 400 })
    }
    if (!['COD','BANK_TRANSFER','EWALLET'].includes(method)) {
      return NextResponse.json({ message: 'Invalid method' }, { status: 400 })
    }

    const finalProof = proofUrl || proofBase64 || null
    if (method !== 'COD' && !finalProof) {
      return NextResponse.json({ message: 'Proof required for non-COD' }, { status: 400 })
    }
    if (finalProof && String(finalProof).length > 5_000_000) {
      return NextResponse.json({ message: 'Proof too large' }, { status: 413 })
    }

    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } })
    if (!order || order.userId !== me.id) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    const payment = await prisma.payment.upsert({
      where: { orderId: Number(orderId) },
      update: { method, proofUrl: finalProof, userId: me.id },
      create: { orderId: Number(orderId), method, proofUrl: finalProof, userId: me.id },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (err) {
    console.error('payments POST error:', err)
    return NextResponse.json({ message: 'Failed to save payment' }, { status: 500 })
  }
}