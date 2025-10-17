import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request) {
  return handleCleanup(request)
}
export async function GET(request: Request) {
  return handleCleanup(request)
}
async function handleCleanup(request: Request) {
  if (process.env.NODE_ENV === 'production' && process.env.TESTSPRITE_AUTO_CONFIRM !== 'true') {
    return NextResponse.json(
      { ok: false, error: 'Endpoint disponível apenas para testes' },
      { status: 403 }
    )
  }
  try {
    let email
    if (request.method === 'GET') {
      const url = new URL(request.url)
      email = url.searchParams.get('email')
    } else {
      const body = await request.json()
      email = body.email
    }
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      if (user) {
        await prisma.todo.deleteMany({
          where: { userId: user.id },
        })
        await prisma.name.deleteMany({
          where: { userId: user.id },
        })
        await prisma.token.deleteMany({
          where: { userId: user.id },
        })
        await prisma.user.delete({
          where: { id: user.id },
        })
        return NextResponse.json({
          ok: true,
          message: `Usuário ${email} e seus dados foram removidos`,
        })
      }
      return NextResponse.json({
        ok: false,
        error: 'Usuário não encontrado',
      }, { status: 404 })
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })
    for (const user of recentUsers) {
      await prisma.todo.deleteMany({
        where: { userId: user.id },
      })
      await prisma.name.deleteMany({
        where: { userId: user.id },
      })
      await prisma.token.deleteMany({
        where: { userId: user.id },
      })
    }
    await prisma.user.deleteMany({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })
    return NextResponse.json({
      ok: true,
      message: `${recentUsers.length} usuários de teste e seus dados foram removidos`,
      count: recentUsers.length,
    })
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao limpar dados de teste' },
      { status: 500 }
    )
  }
}