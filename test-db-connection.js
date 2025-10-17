// Script para testar conexão com o banco Neon
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_e0vNLbpr7aPc@ep-cool-river-acgn07qr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Neon PostgreSQL...')
    
    // Testa a conexão
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Tenta contar usuários
    const userCount = await prisma.user.count()
    console.log(`✅ Encontrados ${userCount} usuários no banco`)
    
    // Verifica se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    console.log('✅ Tabelas encontradas:', tables)
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message)
    console.error('Detalhes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
