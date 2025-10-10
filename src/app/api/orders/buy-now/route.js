import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const COURIER_RATES = {
  JNE:    { base: 12000, perItem: 3000 },
  JNT:    { base: 13000, perItem: 2500 },
  SICEPAT:{ base: 11000, perItem: 3500 },
}
function calcShipping(courier, itemsCount) {
  const cfg = COURIER_RATES[courier]
  if (!cfg) throw new Error('Invalid shippingMethod')
  const n = Math.max(1, Number(itemsCount || 0))
  const cost = cfg.base + cfg.perItem * (n - 1)
  return Math.max(0, Math.round(cost))
}

async function assertUser() {
  const me = await getCurrentUser()
  if (!me) return [null, NextResponse.json({ message: 'Unauthorized' }, { status: 401 })]
  if (me.role !== 'USER') return [null, NextResponse.json({ message: 'Only USER can checkout' }, { status: 403 })]
  return [me, null]
}

export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const { productId, qty, addressId, note, shippingMethod } = await req.json().catch(() => ({}))
  const pid = Number(productId)
  const q = Number(qty)
  const addrId = Number(addressId)

  if (!pid || !Number.isInteger(q) || q <= 0) {
    return NextResponse.json({ message: 'Invalid product/qty' }, { status: 400 })
  }
  if (!addrId) {
    return NextResponse.json({ message: 'addressId required' }, { status: 400 })
  }
  if (!['JNE','JNT','SICEPAT'].includes(shippingMethod)) {
    return NextResponse.json({ message: 'Invalid shippingMethod' }, { status: 400 })
  }

  const [product, address] = await Promise.all([
    prisma.product.findUnique({
      where: { id: pid },
      select: { id: true, name: true, stock: true, isActive: true, deletedAt: true, price: true },
    }),
    prisma.address.findUnique({
      where: { id: addrId },
      select: { id: true, userId: true, isArchived: true }
    })
  ])

  if (!address || address.userId !== me.id) {
    return NextResponse.json({ message: 'Address not found' }, { status: 404 })
  }
  if (address.isArchived) {
    return NextResponse.json({ message: 'Address is archived' }, { status: 400 })
  }

  if (!product || product.deletedAt || product.isActive === false) {
    return NextResponse.json({ message: 'Product not available' }, { status: 400 })
  }
  if (q > product.stock) {
    return NextResponse.json({ message: `Stok ${product.name} tinggal ${product.stock}` }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const itemsTotal = Number(product.price) * q
      const shippingCost = calcShipping(shippingMethod, q)
      const total = itemsTotal + shippingCost

      const updated = await tx.user.update({
        where: { id: me.id },
        data: { nextOrderNo: { increment: 1 } },
        select: { nextOrderNo: true },
      })
      const orderNo = updated.nextOrderNo - 1

      const order = await tx.order.create({
        data: {
          userId: me.id,
          orderNo,
          total,
          addressId: addrId,
          note: note || null,
          shippingMethod,
          shippingCost,
        },
      })

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          price: product.price,
          qty: q,
          subtotal: Number(product.price) * q,
        },
      })
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: q } },
      })

      return {
        id: order.id,
        orderNo,
        total,
        shippingMethod,
        shippingCost,
        status: 'PROCESSED',
        createdAt: order.createdAt,
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    const message = e?.message || 'Checkout failed'
    return NextResponse.json({ message }, { status: 400 })
  }
}