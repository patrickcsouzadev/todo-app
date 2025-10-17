import { NextResponse } from 'next/server'
import { removeAuthCookie } from '@/lib/auth'
export async function POST() {
  try {
    await removeAuthCookie()
    return NextResponse.json({
      ok: true,
      message: 'Logout realizado com sucesso',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}



