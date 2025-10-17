import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { nameSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const names = await prisma.name.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({
      ok: true,
      data: names,
    })
  } catch (error) {
    console.error('Get names error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar nomes' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const validatedData = nameSchema.parse(body)
    const name = await prisma.name.create({
      data: {
        label: validatedData.label,
        userId: user.id,
      },
    })
    return NextResponse.json({
      ok: true,
      data: name,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Create name error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar nome' },
      { status: 500 }
    )
  }
}



