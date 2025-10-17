#!/usr/bin/env node

/**
 * Script de monitoramento de segurança
 * Executa: node scripts/security-monitor.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function securityMonitor() {
  console.log('🔍 Iniciando monitoramento de segurança...')

  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    console.log('🚨 Verificando eventos críticos...')
    
    const criticalEvents = await prisma.securityEvent.findMany({
      where: {
        severity: 'CRITICAL',
        resolved: false,
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (criticalEvents.length > 0) {
      console.log(`⚠️  ${criticalEvents.length} eventos críticos encontrados:`)
      criticalEvents.forEach(event => {
        console.log(`   - ${event.eventType}: ${event.description}`)
        console.log(`     IP: ${event.sourceIp}, Timestamp: ${event.createdAt}`)
      })
    } else {
      console.log('✅ Nenhum evento crítico recente')
    }

    console.log('🔐 Verificando tentativas de login suspeitas...')
    
    const suspiciousLogins = await prisma.loginAttempt.groupBy({
      by: ['ip', 'email'],
      where: {
        success: false,
        createdAt: { gte: oneHourAgo }
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: 5 } }
      },
      orderBy: { _count: { id: 'desc' } }
    })

    if (suspiciousLogins.length > 0) {
      console.log(`⚠️  ${suspiciousLogins.length} IPs com tentativas suspeitas:`)
      suspiciousLogins.forEach(login => {
        console.log(`   - IP: ${login.ip}, Email: ${login.email}, Tentativas: ${login._count.id}`)
      })
    } else {
      console.log('✅ Nenhuma tentativa de login suspeita')
    }

    console.log('🔑 Verificando chaves JWT...')
    
    const expiringKeys = await prisma.jWTKey.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    })

    if (expiringKeys.length > 0) {
      console.log(`⚠️  ${expiringKeys.length} chave(s) JWT expirando em breve:`)
      expiringKeys.forEach(key => {
        const daysLeft = Math.ceil((key.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        console.log(`   - Key ID: ${key.keyId}, Expira em: ${daysLeft} dias`)
      })
    } else {
      console.log('✅ Todas as chaves JWT válidas')
    }

    console.log('📊 Estatísticas de segurança (últimas 24h):')
    
    const [totalEvents, resolvedEvents, highEvents, criticalEvents] = await Promise.all([
      prisma.securityEvent.count({
        where: { createdAt: { gte: oneDayAgo } }
      }),
      prisma.securityEvent.count({
        where: { 
          createdAt: { gte: oneDayAgo },
          resolved: true
        }
      }),
      prisma.securityEvent.count({
        where: { 
          createdAt: { gte: oneDayAgo },
          severity: 'HIGH'
        }
      }),
      prisma.securityEvent.count({
        where: { 
          createdAt: { gte: oneDayAgo },
          severity: 'CRITICAL'
        }
      })
    ])

    console.log(`   - Total de eventos: ${totalEvents}`)
    console.log(`   - Eventos resolvidos: ${resolvedEvents}`)
    console.log(`   - Eventos de alta severidade: ${highEvents}`)
    console.log(`   - Eventos críticos: ${criticalEvents}`)
    console.log(`   - Taxa de resolução: ${totalEvents > 0 ? ((resolvedEvents / totalEvents) * 100).toFixed(1) : 0}%`)

    console.log('⚡ Verificando anomalias de rate limiting...')
    
    const rateLimitViolations = await prisma.securityEvent.findMany({
      where: {
        eventType: 'RATE_LIMIT_EXCEEDED',
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    if (rateLimitViolations.length > 0) {
      console.log(`⚠️  ${rateLimitViolations.length} violações de rate limit:`)
      rateLimitViolations.forEach(violation => {
        console.log(`   - IP: ${violation.sourceIp}, Timestamp: ${violation.createdAt}`)
      })
    } else {
      console.log('✅ Nenhuma violação de rate limit')
    }

    console.log('💡 Recomendações:')
    
    const recommendations = []
    
    if (criticalEvents.length > 0) {
      recommendations.push('Investigar eventos críticos imediatamente')
    }
    
    if (suspiciousLogins.length > 0) {
      recommendations.push('Considerar bloquear IPs com tentativas suspeitas')
    }
    
    if (expiringKeys.length > 0) {
      recommendations.push('Rotacionar chaves JWT que estão expirando')
    }
    
    if (resolvedEvents / totalEvents < 0.8 && totalEvents > 0) {
      recommendations.push('Melhorar taxa de resolução de eventos de segurança')
    }
    
    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    } else {
      console.log('   ✅ Sistema de segurança funcionando adequadamente')
    }

    console.log('✅ Monitoramento de segurança concluído')

  } catch (error) {
    console.error('❌ Erro durante monitoramento:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  securityMonitor()
}

module.exports = { securityMonitor }



