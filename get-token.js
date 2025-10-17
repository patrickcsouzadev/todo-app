const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const token = await prisma.token.findFirst({
    where: { type: 'confirm' },
    orderBy: { createdAt: 'desc' },
    select: { token: true, user: { select: { email: true, id: true } } }
  })

  if (token) {
    console.log('Token:', token.token)
    console.log('User ID:', token.user.id)
    console.log('Email:', token.user.email)
    console.log('\nURL de confirmação:')
    console.log(`http://localhost:3000/api/auth/confirm?token=${token.token}&uid=${encodeURIComponent(token.user.id)}`)
  } else {
    console.log('Nenhum token encontrado')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
