import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createConfirmationToken } from '@/lib/auth'
import { sendConfirmationEmail } from '@/lib/email'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Iniciando registro de usuário...')
    console.log('🔍 DATABASE_URL configurado?', !!process.env.DATABASE_URL)
    console.log('🔍 SMTP configurado?', !!process.env.SMTP_HOST)
    
    const body = await request.json()
    console.log('📧 Email recebido:', body.email)
    
    const validatedData = registerSchema.parse(body)
    console.log('✅ Dados validados com sucesso')
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
        console.log('✅ Confirmation email sent to:', user.email)
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError)
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
        console.warn('Não foi possível atualizar o sinalizador de confirmação do usuário no fluxo de teste', updateErr)
      }
      console.log('✅ Modo de confirmação automática: usuário confirmado automaticamente:', user.email)
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