// prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ✅ Bersihkan dulu biar tidak numpuk
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // ✅ Tambah kategori
  const categories = await prisma.$transaction([
    prisma.category.create({ data: { name: "Kopi Bubuk", slug: "kopi-bubuk" } }),
    prisma.category.create({ data: { name: "Biji Kopi", slug: "biji-kopi" } }),
    prisma.category.create({ data: { name: "Peralatan", slug: "peralatan" } }),
  ])
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]))
  console.log("✅ Kategori berhasil di-seed")

  // ✅ Tambah user dummy
  const userPass = await bcrypt.hash("123456", 10)
  const adminPass = await bcrypt.hash("admin123", 10)

  await prisma.user.createMany({
    data: [
      { name: "User Dummy", email: "user@test.com", passwordHash: userPass, role: "USER" },
      { name: "Admin Dummy", email: "admin@test.com", passwordHash: adminPass, role: "ADMIN" },
    ],
  })
  console.log("✅ User dummy berhasil di-seed")

  // ✅ Tambah produk (2 per kategori)
  await prisma.product.createMany({
    data: [
      // Kopi Bubuk
      {
        name: "Bubuk Kopi Hitam Premium",
        slug: "bubuk-kopi-hitam-premium",
        price: 75000,
        stock: 1000,
        description: "Bubuk kopi hitam premium, digiling halus siap seduh.",
        categoryId: catMap["kopi-bubuk"],
      },
      {
        name: "Bubuk Kopi Campuran",
        slug: "bubuk-kopi-campuran",
        price: 70000,
        stock: 800,
        description: "Perpaduan Robusta & Arabika, rasa balance.",
        categoryId: catMap["kopi-bubuk"],
      },

      // Biji Kopi
      {
        name: "Kopi Arabika Gayo",
        slug: "kopi-arabika-gayo",
        price: 85000,
        stock: 600,
        description: "Kopi Arabika Gayo khas Aceh, floral & fruity.",
        categoryId: catMap["biji-kopi"],
      },
      {
        name: "Kopi Robusta Lampung",
        slug: "kopi-robusta-lampung",
        price: 65000,
        stock: 500,
        description: "Robusta Lampung dengan body kuat, pahit nikmat.",
        categoryId: catMap["biji-kopi"],
      },

      // Peralatan
      {
        name: "Vietnam Drip",
        slug: "vietnam-drip",
        price: 120000,
        stock: 100,
        description: "Peralatan seduh kopi Vietnam Drip berbahan stainless steel.",
        categoryId: catMap["peralatan"],
      },
      {
        name: "French Press",
        slug: "french-press",
        price: 180000,
        stock: 150,
        description: "French Press kaca tebal dengan filter stainless steel.",
        categoryId: catMap["peralatan"],
      },
    ],
  })
  console.log("✅ Produk dummy berhasil di-seed")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })