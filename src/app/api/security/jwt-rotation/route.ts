import { NextRequest, NextResponse } from 'next/server'
import { scheduledKeyRotation, cleanupExpiredKeys } from '@/lib/jwtRotation'
import { logSecurityEvent } from '@/lib/audit'

// Configuração para rotas dinâmicas
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Iniciando a rotação automatizada de chaves JWT...')

    await scheduledKeyRotation()

    const deletedKeys = await cleanupExpiredKeys()

    console.log(`✅ Rotação de chave JWT concluída. Excluído ${deletedKeys} chaves expiradas`)

    await logSecurityEvent({
      eventType: 'JWT_KEY_ROTATION',
      severity: 'LOW',
      description: `Rotação automatizada de chaves JWT concluída`,
      sourceIp: 'system',
      metadata: { deletedExpiredKeys: deletedKeys }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      deletedExpiredKeys: deletedKeys
    })

  } catch (error) {
    console.error('❌ Erro de rotação de chave JWT:', error)
    
    await logSecurityEvent({
      eventType: 'JWT_ROTATION_ERROR',
      severity: 'HIGH',
      description: `Falha na rotação automatizada de chaves JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
      sourceIp: 'system',
      metadata: { error: error instanceof Error ? error.stack : String(error) }
    })

    return NextResponse.json(
      { error: 'Falha na rotação de chaves JWT' },
      { status: 500 }
    )
  }
}



