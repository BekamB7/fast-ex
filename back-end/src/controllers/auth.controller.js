// In register function, add slug generation
export async function register(req, res) {
  try {
    const validated = registerSchema.parse(req.body)

    // Check if organization already exists
    const existing = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { adminEmail: validated.adminEmail },
        ],
      },
    })

    if (existing) {
      return res.status(400).json({ 
        error: 'Organization name or email already exists' 
      })
    }

    // Generate slug from name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Hash password
    const hashedPassword = await hashPassword(validated.password)

    // Create organization with slug
    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
        slug: slug,
        adminEmail: validated.adminEmail,
        adminPassword: hashedPassword,
        phone: validated.phone,
        address: validated.address,
      },
    })

    return res.status(201).json({
      message: 'Organization registered successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        adminEmail: organization.adminEmail,
      },
    })
  } catch (error) {
    // ... error handling
  }
}