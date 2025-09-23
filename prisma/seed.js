// prisma/seed.js
const { PrismaClient } = require('@prisma/client')   // ← ini penting
const prisma = new PrismaClient()

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Bubuk Kopi", slug: "bubuk-kopi" },
      { name: "Biji Kopi", slug: "biji-kopi" }
    ],
    skipDuplicates: true
  })
  console.log("✅ Kategori default berhasil ditambahkan!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
