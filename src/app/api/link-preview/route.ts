import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { fetchLinkPreview } from '@/lib/linkPreview'
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
    const url = searchParams.get('url')
    if (!url) {
      return NextResponse.json(
        { ok: false, error: 'URL não fornecida' },
        { status: 400 }
      )
    }
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'URL inválida' },
        { status: 400 }
      )
    }
    const preview = await fetchLinkPreview(url)
    return NextResponse.json({
      ok: true,
      data: preview,
    })
  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar preview do link' },
      { status: 500 }
    )
  }
}



