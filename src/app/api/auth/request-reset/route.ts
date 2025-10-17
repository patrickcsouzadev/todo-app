import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResetToken } from '@/lib/auth'
import { sendResetPasswordEmail } from '@/lib/email'
import { requestResetSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = requestResetSchema.parse(body)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    if (!user) {
      return NextResponse.json({
        ok: true,
        message:
          'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
      })
    }
    const token = await createResetToken(user.id)
    try {
      await sendResetPasswordEmail(user.email, token)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: continuing despite email error')
      } else {
        return NextResponse.json(
          { ok: false, error: 'Erro ao enviar email de recuperação' },
          { status: 500 }
        )
      }
    }
    return NextResponse.json({
      ok: true,
      message:
        'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Request reset error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao solicitar recuperação de senha' },
      { status: 500 }
    )
  }
}