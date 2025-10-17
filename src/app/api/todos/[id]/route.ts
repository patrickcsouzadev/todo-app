import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { updateTodoSchema } from '@/lib/validations'
import { fetchLinkPreview } from '@/lib/linkPreview'
import { ZodError } from 'zod'
import { Priority } from '@prisma/client'
export async function GET(
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
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        name: true,
      },
    })
    if (!todo) {
      return NextResponse.json(
        { ok: false, error: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json({
      ok: true,
      data: todo,
    })
  } catch (error) {
    console.error('Get todo error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar tarefa' },
      { status: 500 }
    )
  }
}
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
    const validatedData = updateTodoSchema.parse(body)
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    if (!existingTodo) {
      return NextResponse.json(
        { ok: false, error: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }
    if (validatedData.nameId) {
      const name = await prisma.name.findFirst({
        where: {
          id: validatedData.nameId,
          userId: user.id,
        },
      })
      if (!name) {
        return NextResponse.json(
          { ok: false, error: 'Nome não encontrado' },
          { status: 404 }
        )
      }
    }
    let linkImage: string | undefined = existingTodo.linkImage || undefined
    if (validatedData.link && validatedData.link !== existingTodo.link) {
      try {
        const preview = await fetchLinkPreview(validatedData.link)
        linkImage = preview.image
      } catch (error) {
        console.error('Failed to fetch link preview:', error)
      }
    }
    const updateData: any = {}
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.link !== undefined) updateData.link = validatedData.link
    if (linkImage !== undefined) updateData.linkImage = linkImage
    if (validatedData.priority) updateData.priority = validatedData.priority as Priority
    if (Object.prototype.hasOwnProperty.call(validatedData, 'nameId')) {
      updateData.nameId = validatedData.nameId ?? null
    }
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateData as any,
      include: {
        name: true,
      },
    })
    return NextResponse.json({
      ok: true,
      data: updatedTodo,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Update todo error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar tarefa' },
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
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    if (!existingTodo) {
      return NextResponse.json(
        { ok: false, error: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }
    await prisma.todo.delete({
      where: {
        id,
        userId: user.id
      },
    })
    return NextResponse.json({
      ok: true,
      message: 'Tarefa deletada com sucesso',
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete todo error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro ao deletar tarefa' },
      { status: 500 }
    )
  }
}