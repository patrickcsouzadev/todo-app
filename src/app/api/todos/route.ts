import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { todoSchema } from '@/lib/validations'
import { fetchLinkPreview } from '@/lib/linkPreview'
import { ZodError } from 'zod'
import { Priority } from '@prisma/client'
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const searchParams = request.nextUrl.searchParams
    const priorityParam = searchParams.get('priority')
    const nameId = searchParams.get('nameId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sort = searchParams.get('sort') || 'createdAt_desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const where: any = {
      userId: user.id,
    }
    if (priorityParam) {
      const priorities = priorityParam.split(',').filter(p => ['RED', 'YELLOW', 'BLUE'].includes(p))
      if (priorities.length > 0) {
        where.priority = { in: priorities as Priority[] }
      }
    }
    if (nameId) {
      where.nameId = nameId
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'createdAt_asc') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'priority') {
      orderBy = [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    }
    const skip = (page - 1) * limit
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        include: {
          name: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.todo.count({ where }),
    ])
    return NextResponse.json({
      ok: true,
      data: {
        todos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get todos error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
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
    const validatedData = todoSchema.parse(body)
    let name = null
    if (validatedData.nameId) {
      name = await prisma.name.findFirst({
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
    let linkImage: string | undefined
    if (validatedData.link) {
      try {
        const preview = await fetchLinkPreview(validatedData.link)
        linkImage = preview.image
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch link preview:', error)
        }
      }
    }
    const todo = await prisma.todo.create({
      data: ({
        title: validatedData.title,
        description: validatedData.description,
        link: validatedData.link,
        linkImage,
        priority: validatedData.priority as Priority,
        nameId: validatedData.nameId ?? undefined,
        userId: user.id,
      } as any),
      include: {
        name: true,
      },
    })
    return NextResponse.json({
      ok: true,
      data: todo,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Create todo error:', error)
    }
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}