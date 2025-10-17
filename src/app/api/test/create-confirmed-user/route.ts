import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  return handleCreateConfirmedUser(request)
}

export async function GET(request: Request) {
  return handleCreateConfirmedUser(request)
}

async function handleCreateConfirmedUser(request: Request) {
  if (process.env.NODE_ENV === 'production' && process.env.TESTSPRITE_AUTO_CONFIRM !== 'true') {
    return NextResponse.json(
      { ok: false, error: 'Endpoint disponível apenas para testes' },
      { status: 403 }
    )
  }

  try {
    let email, password

    if (request.method === 'GET') {
      const url = new URL(request.url)
      email = url.searchParams.get('email')
      password = url.searchParams.get('password')
    } else {
      const body = await request.json()
      email = body.email
      password = body.password
    }

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isConfirmed: true,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Usuário criado e confirmado automaticamente para testes',
      user: {
        id: user.id,
        email: user.email,
        isConfirmed: user.isConfirmed,
      },
    })
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar usuário de teste' },
      { status: 500 }
    )
  }
}

