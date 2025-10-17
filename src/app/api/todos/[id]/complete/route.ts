import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
export async function POST(
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
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !existingTodo.completed,
      },
      include: {
        name: true,
      },
    })
    return NextResponse.json({
      ok: true,
      data: updatedTodo,
    })
  } catch (error) {
    console.error('Toggle todo completion error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    )
  }
}



