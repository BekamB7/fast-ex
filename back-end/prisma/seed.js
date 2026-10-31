// back-end/prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding platform admin...')

  const email = 'super@fast-ex.com'
  const password = 'SuperAdmin123!'

  const existing = await prisma.platformAdmin.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('✅ Platform admin already exists')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.platformAdmin.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
    },
  })

  console.log('✅ Platform admin created successfully!')
  console.log('═══════════════════════════════════════')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })