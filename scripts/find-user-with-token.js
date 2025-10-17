#!/usr/bin/env node
;(async ()=>{
  try{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const users = await prisma.user.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    for (const u of users) {
      const t = await prisma.token.findFirst({ where: { userId: u.id, type: 'confirm', expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } })
      if (t) {
        console.log(JSON.stringify({ email: u.email, id: u.id, isConfirmed: u.isConfirmed, tokenPrefix: t.token.slice(0,8) }))
      }
    }
    await prisma.$disconnect()
  }catch(e){
    console.error('ERR',e)
    process.exit(1)
  }
})()