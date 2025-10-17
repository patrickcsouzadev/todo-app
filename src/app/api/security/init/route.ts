import { NextRequest, NextResponse } from 'next/server'
import { initializeJWTKeys } from '@/lib/jwtRotation'
import { logSecurityEvent } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const deploySecret = process.env.DEPLOY_SECRET || 'default-deploy-secret'
    
    if (authHeader !== `Bearer ${deploySecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Iniciando a inicialização automatizada de segurança...')

    const initResults = {
      timestamp: new Date().toISOString(),
      jwtKeys: false,
      database: false,
      security: false
    }

    try {
      await initializeJWTKeys()
      initResults.jwtKeys = true
      console.log('✅ Chaves JWT inicializadas')
    } catch (error) {
      console.error('❌ Falha na inicialização das chaves JWT:', error)
    }

    try {
      await prisma.$connect()
      await prisma.user.count()
      initResults.database = true
      console.log('✅ Conexão com o banco de dados verificada')
    } catch (error) {
      console.error('❌ Falha na conexão com o banco de dados:', error)
    }

    try {
      await prisma.auditLog.count()
      await prisma.securityEvent.count()
      await prisma.jWTKey.count()
      await prisma.loginAttempt.count()
      await prisma.rateLimitEntry.count()
      
      initResults.security = true
      console.log('✅ Sistemas de segurança verificados')
    } catch (error) {
      console.error('❌ Falha na verificação dos sistemas de segurança:', error)
    }

    await logSecurityEvent({
      eventType: 'SECURITY_INITIALIZATION',
      severity: 'LOW',
      description: `Inicialização de segurança automatizada concluída`,
      sourceIp: 'system',
      metadata: initResults
    })

    const allSystemsReady = initResults.jwtKeys && initResults.database && initResults.security

    if (allSystemsReady) {
      console.log('🎉 Todos os sistemas de segurança foram inicializados com sucesso!')
    } else {
      console.log('⚠️ Alguns sistemas de segurança falharam ao inicializar')
    }

    return NextResponse.json({
      success: allSystemsReady,
      timestamp: new Date().toISOString(),
      initialization: initResults,
      message: allSystemsReady 
        ? 'Inicialização de segurança concluída com sucesso' 
        : 'Inicialização de segurança concluída com algumas falhas'
    })

  } catch (error) {
    console.error('❌ Erro de inicialização de segurança:', error)
    
    return NextResponse.json(
      { 
        error: 'Security initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



