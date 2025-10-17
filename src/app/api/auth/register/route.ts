import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createConfirmationToken } from '@/lib/auth'
import { sendConfirmationEmail } from '@/lib/email'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: 'Email já cadastrado' },
        { status: 400 }
      )
    }
    const hashedPassword = await hashPassword(validatedData.password)
    const autoConfirm = process.env.TESTSPRITE_AUTO_CONFIRM === 'true'
    
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        isConfirmed: autoConfirm,
      },
    })
    if (!autoConfirm) {
      const token = await createConfirmationToken(user.id)
      try {
        await sendConfirmationEmail(user.email, token, user.id)
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          { ok: false, error: 'Erro ao enviar email de confirmação. Tente novamente.' },
          { status: 500 }
        )
      }
    } else {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { isConfirmed: true },
        })
      } catch (updateErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not update user confirmation flag in test flow', updateErr)
        }
      }
    }
    return NextResponse.json({
      ok: true,
      message: autoConfirm
        ? 'Conta criada e confirmada automaticamente! Você já pode fazer login.'
        : 'Conta criada com sucesso! Verifique seu email para confirmar sua conta.',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('❌ Erro ao registrar:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}