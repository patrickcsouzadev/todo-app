import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { nameSchema } from '@/lib/validations'
import { ZodError } from 'zod'
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const { id } = await params
    const body = await request.json()
    const validatedData = nameSchema.parse(body)
    const existingName = await prisma.name.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    if (!existingName) {
      return NextResponse.json(
        { ok: false, error: 'Nome não encontrado' },
        { status: 404 }
      )
    }
    const updatedName = await prisma.name.update({
      where: { id },
      data: {
        label: validatedData.label,
      },
    })
    return NextResponse.json({
      ok: true,
      data: updatedName,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Update name error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro ao atulizar nome' },
      { status: 500 }
    )
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const { id } = await params
    const existingName = await prisma.name.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    if (!existingName) {
      return NextResponse.json(
        { ok: false, error: 'Nome não encontrado' },
        { status: 404 }
      )
    }
    let desassociated = false
    try {
      await prisma.todo.updateMany({
        where: {
          nameId: id,
          userId: user.id,
        },
        data: { nameId: null },
      })
      desassociated = true
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.warn('prisma.todo.updateMany set null failed, will try fallback')
      }
    }
    if (!desassociated) {
      try {
        await prisma.todo.updateMany({
          where: {
            nameId: id,
            userId: user.id,
          },
          data: { nameId: null }
        })
        desassociated = true
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Prisma updateMany set NULL failed, will try sentinel fallback', err)
        }
      }
    }
    if (!desassociated) {
      const sentinelLabel = '(Autor removido)'
      let sentinel = await prisma.name.findFirst({
        where: {
          userId: user.id,
          label: sentinelLabel,
        },
      })
      if (!sentinel) {
        sentinel = await prisma.name.create({
          data: {
            label: sentinelLabel,
            userId: user.id,
          },
        })
      }
      try {
        await prisma.todo.updateMany({
          where: {
            nameId: id,
            userId: user.id,
          },
          data: { nameId: sentinel.id },
        })
      } catch {
        await prisma.todo.updateMany({
          where: {
            nameId: id,
            userId: user.id,
          },
          data: { nameId: sentinel.id }
        })
      }
    }
    await prisma.name.delete({
      where: { id },
    })
    return NextResponse.json({
      ok: true,
      message: 'Nome deletado com sucesso',
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete name error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro ao deletar name' },
      { status: 500 }
    )
  }
}