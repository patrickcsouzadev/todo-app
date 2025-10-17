import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAndConsumeToken, hashPassword } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)
    const user = await verifyAndConsumeToken(validatedData.token, 'reset')
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }
    const hashedPassword = await hashPassword(validatedData.newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'reset',
      },
    })
    return NextResponse.json({
      ok: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Reset password error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao redefinir senha' },
      { status: 500 }
    )
  }
}



