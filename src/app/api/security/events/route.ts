import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { getSecurityEvents, resolveSecurityEvents } from '@/lib/siem'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('__Host-auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const url = new URL(request.url)
    const filters = {
      severity: url.searchParams.get('severity') || undefined,
      eventType: url.searchParams.get('eventType') || undefined,
      sourceIp: url.searchParams.get('sourceIp') || undefined,
      resolved: url.searchParams.get('resolved') ? 
        url.searchParams.get('resolved') === 'true' : undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0')
    }

    const result = await getSecurityEvents(filters)

    return NextResponse.json({
      success: true,
      events: result.events,
      total: result.total,
      hasMore: result.hasMore,
      filters
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro de eventos de segurança:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('__Host-auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { action, eventIds } = await request.json()

    if (!action || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json({ error: 'Ação e IDs de eventos são obrigatórios' }, { status: 400 })
    }

    switch (action) {
      case 'resolve':
        await resolveSecurityEvents(eventIds)
        break
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Ação executada com sucesso',
      action,
      eventIds
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro de ação de eventos de segurança:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}



