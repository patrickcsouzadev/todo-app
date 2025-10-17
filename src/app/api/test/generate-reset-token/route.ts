import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
export async function POST(request: Request) {
  return handleGenerateResetToken(request)
}
export async function GET(request: Request) {
  return handleGenerateResetToken(request)
}
async function handleGenerateResetToken(request: Request) {
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
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await prisma.token.create({
      data: {
        token,
        type: 'RESET_PASSWORD',
        userId: user.id,
        expiresAt,
      },
    })
    return NextResponse.json({
      ok: true,
      message: 'Token de reset gerado com sucesso',
      token,
      expiresAt,
      resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`,
    })
  } catch (error) {
    console.error('Erro ao gerar token de reset:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao gerar token de reset' },
      { status: 500 }
    )
  }
}