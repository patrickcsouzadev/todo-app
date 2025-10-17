import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateAuthToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Iniciando processo de login...')
    
    const body = await request.json()
    console.log('📧 Email recebido:', body.email)

    const validatedData = loginSchema.parse(body)
    console.log('✅ Dados validados com sucesso')

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    console.log('🔍 Usuário encontrado?', !!user)
    console.log('🔍 Usuário confirmado?', user?.isConfirmed)

    const dummyHash = '$2a$12$dummy.hash.for.timing.safety.comparison'
    const hashedPassword = user?.password || dummyHash
    
    console.log('🔐 Verificando senha...')
    const isPasswordValid = await comparePassword(
      validatedData.password,
      hashedPassword
    )
    console.log('🔐 Senha válida?', isPasswordValid)

    if (!user || !isPasswordValid) {
      console.log('❌ Login falhou: credenciais inválidas')
      return NextResponse.json(
        { ok: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    if (!user.isConfirmed) {
      console.log('❌ Login falhou: email não confirmado')
      return NextResponse.json(
        {
          ok: false,
          error:
            'Email não confirmado. Por favor, verifique seu email e confirme sua conta.',
        },
        { status: 403 }
      )
    }

    console.log('🎟️ Gerando token de autenticação...')
    const token = await generateAuthToken({
      userId: user.id,
      email: user.email,
    })
    console.log('✅ Token gerado com sucesso')

    console.log('🍪 Configurando cookie de autenticação...')
    await setAuthCookie(token)
    console.log('✅ Cookie configurado com sucesso')

    console.log('✅ Login bem-sucedido para:', user.email)
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
      console.log('❌ Erro de validação:', error.errors[0].message)
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('❌ Erro no login:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}







