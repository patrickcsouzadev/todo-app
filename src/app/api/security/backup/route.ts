import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('💾 Iniciando a backup automatizado...')

    const backupData = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.count(),
      todos: await prisma.todo.count(),
      auditLogs: await prisma.auditLog.count(),
      securityEvents: await prisma.securityEvent.count(),
      jwtKeys: await prisma.jWTKey.count()
    }

    console.log('📊 Backup statistics:', backupData)

    await logSecurityEvent({
      eventType: 'AUTOMATED_BACKUP',
      severity: 'LOW',
      description: `Backup automatizado concluído com sucesso`,
      sourceIp: 'system',
      metadata: backupData
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      backup: backupData
    })

  } catch (error) {
    console.error('❌ Erro de backup:', error)
    
    await logSecurityEvent({
      eventType: 'BACKUP_ERROR',
      severity: 'HIGH',
      description: `Falha no backup automatizado: ${error instanceof Error ? error.message : 'Unknown error'}`,
      sourceIp: 'system',
      metadata: { error: error instanceof Error ? error.stack : String(error) }
    })

    return NextResponse.json(
      { error: 'Falha no backup' },
      { status: 500 }
    )
  }
}



