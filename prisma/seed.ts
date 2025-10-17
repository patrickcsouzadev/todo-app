import { PrismaClient, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
  console.log('🌱 Iniciando seed...')
  await prisma.todo.deleteMany()
  await prisma.name.deleteMany()
  await prisma.token.deleteMany()
  await prisma.user.deleteMany()
  const hashedPassword = await bcrypt.hash('Senha123!', 12)
  const user = await prisma.user.create({
    data: {
      email: 'demo@ex.com',
      password: hashedPassword,
      isConfirmed: true,
    },
  })
  console.log('✅ Usuário criado:', user.email)
  const joao = await prisma.name.create({
    data: {
      label: 'João',
      userId: user.id,
    },
  })
  const maria = await prisma.name.create({
    data: {
      label: 'Maria',
      userId: user.id,
    },
  })
  const equipe = await prisma.name.create({
    data: {
      label: 'Equipe',
      userId: user.id,
    },
  })
  console.log('✅ Nomes criados: João, Maria, Equipe')
  const todos = [
    {
      title: 'Comprar material de escritório',
      description: 'Canetas, papel A4, grampeador e clips',
      priority: Priority.RED,
      nameId: joao.id,
      userId: user.id,
      link: 'https://www.amazon.com.br/dp/B08N5WRWNW',
    },
    {
      title: 'Revisar apresentação do projeto',
      description: 'Ajustar slides 5-10 com feedback do cliente',
      priority: Priority.YELLOW,
      nameId: maria.id,
      userId: user.id,
    },
    {
      title: 'Agendar reunião de planejamento',
      description: 'Definir datas e horários com toda a equipe',
      priority: Priority.BLUE,
      nameId: equipe.id,
      userId: user.id,
    },
    {
      title: 'Corrigir bug crítico no sistema',
      description: 'Erro no login que está impedindo acesso de usuários',
      priority: Priority.RED,
      nameId: joao.id,
      userId: user.id,
      completed: true,
    },
    {
      title: 'Atualizar documentação da API',
      description: 'Incluir novos endpoints e exemplos de uso',
      priority: Priority.YELLOW,
      nameId: maria.id,
      userId: user.id,
      link: 'https://github.com',
    },
    {
      title: 'Pesquisar novas ferramentas de produtividade',
      description: 'Avaliar opções para melhorar workflow da equipe',
      priority: Priority.BLUE,
      nameId: equipe.id,
      userId: user.id,
      link: 'https://www.notion.so',
    },
  ]
  for (const todo of todos) {
    await prisma.todo.create({ data: todo })
  }
  console.log('✅ 6 todos criados com diferentes prioridades')
  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📧 Credenciais de teste:')
  console.log('   Email: demo@ex.com')
  console.log('   Senha: Senha123!')
}
main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



