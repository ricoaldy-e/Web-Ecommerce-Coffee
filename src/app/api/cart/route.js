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
  if (me.role !== 'USER') return [null, NextResponse.json({ message: 'Only USER can use cart' }, { status: 403 })]
  return [me, null]
}

async function getOrCreateCart(userId) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
  return cart
}

export async function GET() {
  const [me, err] = await assertUser()
  if (!me) return err

  const cart = await getOrCreateCart(me.id)
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  })
  return NextResponse.json({ cartId: cart.id, items })
}

export async function POST(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const body = await req.json().catch(() => ({}))
  let { productId, qty } = body
  productId = Number(productId)
  qty = Number(qty)

  if (!productId || !Number.isInteger(qty) || qty <= 0) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, isActive: true, deletedAt: true, price: true },
  })
  if (!product || product.deletedAt || product.isActive === false) {
    return NextResponse.json({ message: 'Product not available' }, { status: 400 })
  }

  const cart = await getOrCreateCart(me.id)
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  })

  const intendedQty = (existing?.qty || 0) + qty
  if (intendedQty > product.stock) {
    return NextResponse.json(
      { message: `Stok ${product.name} tinggal ${product.stock}. Kamu meminta ${intendedQty}.` },
      { status: 400 }
    )
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { qty: intendedQty },
    })
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, qty } })
  }

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  })
  return NextResponse.json({ cartId: cart.id, items }, { status: 201 })
}

export async function PATCH(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const body = await req.json().catch(() => ({}))
  let { productId, qty } = body
  productId = Number(productId)
  qty = Number(qty)

  if (!productId || !Number.isFinite(qty)) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const cart = await getOrCreateCart(me.id)

  if (qty === 0) {
    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    }).catch(() => null)
  } else if (qty > 0) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    })
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }
    if (qty > product.stock) {
      return NextResponse.json(
        { message: `Maksimal ${product.stock} untuk ${product.name}` },
        { status: 400 }
      )
    }

    try {
      await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { qty },
      })
    } catch {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }
  } else {
    return NextResponse.json({ message: 'Invalid qty' }, { status: 400 })
  }

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  })
  return NextResponse.json({ cartId: cart.id, items })
}

export async function DELETE(req) {
  const [me, err] = await assertUser()
  if (!me) return err

  const body = await req.json().catch(() => ({}))
  const productId = Number(body.productId)
  if (!productId) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const cart = await getOrCreateCart(me.id)

  try {
    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    })
  } catch {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 })
  }

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  })
  return NextResponse.json({ cartId: cart.id, items })
}