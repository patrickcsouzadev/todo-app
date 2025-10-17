import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldLogs } from '@/lib/siem'
import { logSecurityEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧹 Starting automated log cleanup...')

    const cleanupResult = await cleanupOldLogs(90)

    console.log('✅ Log cleanup completed:', cleanupResult)

    await logSecurityEvent({
      eventType: 'LOG_CLEANUP',
      severity: 'LOW',
      description: `Automated log cleanup completed`,
      sourceIp: 'system',
      metadata: cleanupResult
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleanup: cleanupResult
    })

  } catch (error) {
    console.error('❌ Log cleanup error:', error)
    
    await logSecurityEvent({
      eventType: 'CLEANUP_ERROR',
      severity: 'HIGH',
      description: `Falha na limpeza automatizada de logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      sourceIp: 'system',
      metadata: { error: error instanceof Error ? error.stack : String(error) }
    })

    return NextResponse.json(
      { error: 'Falha na limpeza de logs' },
      { status: 500 }
    )
  }
}



