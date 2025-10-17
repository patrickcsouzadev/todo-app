import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAndConsumeToken } from '@/lib/auth'
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    if (!token) {
      const accept = request.headers.get('accept') || ''
      if (accept.includes('text/html')) {
        const uiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`
        const redirectUrl = new URL(uiUrl)
        redirectUrl.searchParams.set('status', 'missing')
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.json(
        { ok: false, error: 'Token não fornecido' },
        { status: 400 }
      )
    }
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token,
        type: 'confirm',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })
    if (tokenRecord) {
      const user = tokenRecord.user
      const accept = request.headers.get('accept') || ''
      if (accept.includes('text/html')) {
        const uiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`
        const redirectUrl = new URL(uiUrl)
        redirectUrl.searchParams.set('status', user.isConfirmed ? 'already' : 'ready')
        redirectUrl.searchParams.set('token', token)
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.json({ ok: true, isConfirmed: user.isConfirmed })
    }
  const accept = request.headers.get('accept') || ''
    const uid = searchParams.get('uid')
    if (uid) {
      const user = await prisma.user.findUnique({ where: { id: uid } })
      if (accept.includes('text/html')) {
        const uiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`
        const redirectUrl = new URL(uiUrl)
        redirectUrl.searchParams.set('status', user ? (user.isConfirmed ? 'already' : 'invalid') : 'invalid')
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.json({ ok: true, isConfirmed: !!user?.isConfirmed })
    }
    if (accept.includes('text/html')) {
      const uiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`
      const redirectUrl = new URL(uiUrl)
      redirectUrl.searchParams.set('status', 'invalid')
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.json(
      { ok: false, error: 'Token inválido ou expirado' },
      { status: 400 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Confirmation error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = body.token || request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token não fornecido' }, { status: 400 })
    }
    const user = await verifyAndConsumeToken(token, 'confirm')
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Token inválido ou expirado' }, { status: 400 })
    }
    if (!user.isConfirmed) {
      await prisma.user.update({ where: { id: user.id }, data: { isConfirmed: true } })
    }
    return NextResponse.json({ ok: true, message: 'Email confirmado com sucesso! Você já pode fazer login.' })
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Confirmation POST error:', err)
    }
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}