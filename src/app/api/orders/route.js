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
  if (!cfg) throw new Error('Invalid courier')
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

// POST /api/orders → buat order dari cart
export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const payload = await req.json().catch(() => ({}))
  const { addressId, note, shippingMethod } = payload || {}
  const addrId = Number(addressId)
  if (!addrId) return NextResponse.json({ message: 'addressId required' }, { status: 400 })
  if (!['JNE','JNT','SICEPAT'].includes(shippingMethod)) {
    return NextResponse.json({ message: 'Invalid shippingMethod' }, { status: 400 })
  }

  const address = await prisma.address.findUnique({
    where: { id: addrId },
    select: { id: true, userId: true, isArchived: true }
  })
  if (!address || address.userId !== me.id) {
    return NextResponse.json({ message: 'Address not found' }, { status: 404 })
  }
  if (address.isArchived) {
    return NextResponse.json({ message: 'Address is archived' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let items = []
      let itemsTotal = 0
      let itemsCount = 0

      const cart = await tx.cart.findUnique({ where: { userId: me.id } })
      if (!cart) throw new Error('Cart empty')

      const cartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      })
      if (cartItems.length === 0) throw new Error('Cart empty')

      for (const it of cartItems) {
        if (it.product.deletedAt || !it.product.isActive) {
          throw new Error('Product not available')
        }
        if (it.qty > it.product.stock) {
          throw new Error(`Insufficient stock for ${it.product.name}`)
        }
        const sub = Number(it.product.price) * it.qty
        itemsTotal += sub
        itemsCount += it.qty

        items.push({
          productId: it.productId,
          price: it.product.price,
          qty: it.qty,
          subtotal: sub
        })
      }

      const shippingCost = calcShipping(shippingMethod, itemsCount)
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

      for (const it of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: it.productId,
            price: it.price,
            qty: it.qty,
            subtotal: it.subtotal,
          },
        })
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.qty } },
        })
      }

      // kosongkan cart
      const cart2 = await tx.cart.findUnique({ where: { userId: me.id } })
      if (cart2) await tx.cartItem.deleteMany({ where: { cartId: cart2.id } })

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

// GET /api/orders → list order milik user
export async function GET() {
  const [me, err] = await assertUser()
  if (!me) return err

  const orders = await prisma.order.findMany({
    where: { userId: me.id },
    include: {
      items: { include: { product: true } },
      payment: true,
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}