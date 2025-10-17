#!/usr/bin/env node

/**
 * Script para inicializar sistemas de segurança
 * Executa: node scripts/initialize-security.js
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function initializeSecurity() {
  console.log('🔒 Inicializando sistemas de segurança...')

  try {
    // 1. Inicializar chaves JWT
    console.log('📝 Inicializando chaves JWT...')
    
    const existingKeys = await prisma.jWTKey.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingKeys === 0) {
      const keyId = crypto.randomUUID()
      const secret = crypto.randomBytes(64).toString('hex')
      const algorithm = 'HS256'
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days

      await prisma.jWTKey.create({
        data: {
          keyId,
          secret,
          algorithm,
          isActive: true,
          expiresAt
        }
      })

      console.log('✅ Chave JWT inicial criada:', keyId)
    } else {
      console.log('✅ Chaves JWT já existentes')
    }

    // 2. Limpar logs antigos
    console.log('🧹 Limpando logs antigos...')
    
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
    
    const [auditLogsDeleted, securityEventsDeleted, loginAttemptsDeleted] = await Promise.all([
      prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoffDate } }
      }),
      prisma.securityEvent.deleteMany({
        where: { 
          createdAt: { lt: cutoffDate },
          resolved: true
        }
      }),
      prisma.loginAttempt.deleteMany({
        where: { createdAt: { lt: cutoffDate } }
      })
    ])

    console.log(`✅ Logs antigos removidos:`)
    console.log(`   - Audit logs: ${auditLogsDeleted.count}`)
    console.log(`   - Security events: ${securityEventsDeleted.count}`)
    console.log(`   - Login attempts: ${loginAttemptsDeleted.count}`)

    // 3. Verificar configurações de segurança
    console.log('🔍 Verificando configurações de segurança...')
    
    const requiredEnvVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'EMAIL_FROM',
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USER',
      'EMAIL_PASS'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.log('⚠️  Variáveis de ambiente faltando:', missingVars.join(', '))
    } else {
      console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas')
    }

    // 4. Verificar JWT_SECRET
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.log('⚠️  JWT_SECRET muito fraco (mínimo 32 caracteres)')
    } else {
      console.log('✅ JWT_SECRET configurado corretamente')
    }

    // 5. Estatísticas iniciais
    console.log('📊 Estatísticas do sistema:')
    
    const [userCount, auditLogCount, securityEventCount] = await Promise.all([
      prisma.user.count(),
      prisma.auditLog.count(),
      prisma.securityEvent.count()
    ])

    console.log(`   - Usuários: ${userCount}`)
    console.log(`   - Audit logs: ${auditLogCount}`)
    console.log(`   - Security events: ${securityEventCount}`)

    console.log('🎉 Inicialização de segurança concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeSecurity()
}

module.exports = { initializeSecurity }



