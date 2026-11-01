// back-end/prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding platform admin...\n')

  const name = process.env.PLATFORM_ADMIN_NAME || 'Super Admin'
  const email = process.env.PLATFORM_ADMIN_EMAIL || 'super@fast-ex.com'
  const password = process.env.PLATFORM_ADMIN_PASSWORD || 'SuperAdmin123!'

  // Validate env vars
  if (!email || !password) {
    console.error('❌ PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_PASSWORD is missing in .env')
    process.exit(1)
  }

  // Check if admin exists
  const existing = await prisma.platformAdmin.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('⚠️  Platform admin already exists')
    console.log(`   Email:    ${existing.email}`)
    console.log(`   Name:     ${existing.name}`)
    console.log(`   Active:   ${existing.isActive}`)
    console.log('\n💡 To reset the password, delete the admin in Prisma Studio')
    console.log('   or run: npx prisma studio')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create admin
  const admin = await prisma.platformAdmin.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  console.log('✅ Platform admin created successfully!\n')
  console.log('═══════════════════════════════════════════')
  console.log(`   Name:     ${admin.name}`)
  console.log(`   Email:    ${admin.email}`)
  console.log(`   Password: ${password}`)
  console.log('═══════════════════════════════════════════')
  console.log('\n🔐 Login at: http://localhost:3000/admin/login')
  console.log('⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })