import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { getSIEMDashboard } from '@/lib/siem'
import { getSecurityStats } from '@/lib/siem'
import { getAnomalyStats } from '@/lib/anomalyDetection'

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
    const hours = parseInt(url.searchParams.get('hours') || '24')
    const statsType = url.searchParams.get('type') || 'dashboard'

    let data: any = {}

    switch (statsType) {
      case 'dashboard':
        data = await getSIEMDashboard(hours)
        break
      case 'security':
        data = await getSecurityStats(hours)
        break
      case 'anomaly':
        data = await getAnomalyStats(hours)
        break
      default:
        return NextResponse.json({ error: 'Tipo de estatística inválido' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      hours
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no painel de segurança:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}



