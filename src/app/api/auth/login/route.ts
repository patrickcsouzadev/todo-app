import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateAuthToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    const dummyHash = '$2a$12$dummy.hash.for.timing.safety.comparison'
    const hashedPassword = user?.password || dummyHash
    
    const isPasswordValid = await comparePassword(
      validatedData.password,
      hashedPassword
    )

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        { ok: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    if (!user.isConfirmed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Email não confirmado. Por favor, verifique seu email e confirme sua conta.',
        },
        { status: 403 }
      )
    }

    const token = await generateAuthToken({
      userId: user.id,
      email: user.email,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          isConfirmed: user.isConfirmed,
        },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}







