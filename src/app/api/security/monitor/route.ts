import { NextRequest, NextResponse } from 'next/server'
import { getSIEMDashboard, getSecurityStats } from '@/lib/siem'
import { getAnomalyStats } from '@/lib/anomalyDetection'
import { logSecurityEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Iniciando o monitoramento de segurança automatizado...')

    const securityStats = await getSecurityStats(24)
    const anomalyStats = await getAnomalyStats(24)
    const dashboard = await getSIEMDashboard(24)

    const criticalEvents = dashboard.criticalEvents
    const highEvents = dashboard.highEvents
    const openAlerts = dashboard.openAlerts

    await logSecurityEvent({
      eventType: 'AUTOMATED_MONITORING',
      severity: 'LOW',
      description: `Monitoramento de segurança automatizado concluído. Critical: ${criticalEvents}, High: ${highEvents}, Open Alerts: ${openAlerts}`,
      sourceIp: 'system',
      metadata: {
        criticalEvents,
        highEvents,
        openAlerts,
        totalEvents: securityStats.totalEvents,
        resolutionRate: securityStats.resolutionRate
      }
    })

    if (criticalEvents > 0) {
      await logSecurityEvent({
        eventType: 'CRITICAL_ALERT',
        severity: 'CRITICAL',
        description: `${criticalEvents} eventos críticos de segurança detectados`,
        sourceIp: 'system',
        metadata: { criticalEvents }
      })
    }

    if (highEvents >= 5) {
      await logSecurityEvent({
        eventType: 'HIGH_EVENTS_ALERT',
        severity: 'HIGH',
        description: `${highEvents} eventos de alta gravidade detectados`,
        sourceIp: 'system',
        metadata: { highEvents }
      })
    }

    console.log(`✅ Monitoramento de segurança concluído – Crítico: ${criticalEvents}, High: ${highEvents}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        criticalEvents,
        highEvents,
        openAlerts,
        totalEvents: securityStats.totalEvents,
        resolutionRate: securityStats.resolutionRate
      }
    })

  } catch (error) {
    console.error('❌ Erro de monitoramento de segurança:', error)
    
    await logSecurityEvent({
      eventType: 'MONITORING_ERROR',
      severity: 'HIGH',
      description: `Falha no monitoramento de segurança automatizado: ${error instanceof Error ? error.message : 'Unknown error'}`,
      sourceIp: 'system',
      metadata: { error: error instanceof Error ? error.stack : String(error) }
    })

    return NextResponse.json(
      { error: 'Falha no monitoramento de segurança' },
      { status: 500 }
    )
  }
}



