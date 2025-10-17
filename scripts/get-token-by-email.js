#!/usr/bin/env node
const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/get-token-by-email.js <email>')
  process.exit(2)
}
;(async ()=>{
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log('USER_NOT_FOUND')
      await prisma.$disconnect()
      process.exit(1)
    }
    const token = await prisma.token.findFirst({ where: { userId: user.id, type: 'confirm' }, orderBy: { createdAt: 'desc' } })
    if (!token) {
      console.log('NO_TOKEN')
    } else {
      console.log(token.token)
    }
    await prisma.$disconnect()
  } catch (e) {
    console.error('ERROR', e)
    process.exit(3)
  }
})()