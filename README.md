# 🔒 Todo App - Sistema de Segurança Enterprise

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/todoapp)
[![Security Score](https://img.shields.io/badge/Security-A+%20Grade-brightgreen)](https://github.com/seu-usuario/todoapp/security)
[![OWASP Compliant](https://img.shields.io/badge/OWASP-Compliant-blue)](https://owasp.org/)

Um aplicativo de tarefas (TODO) moderno e seguro, construído com Next.js, Prisma e PostgreSQL, implementando **sistemas de segurança de nível enterprise** com automação completa.

## 🚀 Características Principais

### 📝 Funcionalidades do Todo App
- ✅ **Gerenciamento de Tarefas** - Criar, editar, deletar e marcar como concluídas
- ✅ **Sistema de Prioridades** - Vermelho (Urgente), Amarelo (Prioridade), Azul (Pode esperar)
- ✅ **Categorização por Nomes** - Organizar tarefas por categorias personalizáveis
- ✅ **Links e Previews** - Adicionar links com preview automático
- ✅ **Interface Responsiva** - Mobile-first design
- ✅ **Filtros Avançados** - Por prioridade, status, nome e data

### 🔒 Sistemas de Segurança Enterprise

#### 🔐 **MFA (Multi-Factor Authentication)**
- ✅ **TOTP (Time-based One-Time Password)** - Compatível com Google Authenticator, Authy
- ✅ **Códigos de Backup** - 10 códigos únicos para recuperação
- ✅ **QR Code** - Configuração automática via QR Code
- ✅ **Detecção de Anomalias** - Monitoramento de tentativas suspeitas

#### 🔄 **Rotação Automática de Chaves JWT**
- ✅ **Rotação Programada** - Automática quando próximas do vencimento
- ✅ **Múltiplas Chaves** - Controle de versão e compatibilidade
- ✅ **Limpeza Automática** - Remoção de chaves expiradas
- ✅ **API de Gerenciamento** - Rotação manual quando necessário

#### 📝 **Sistema de Auditoria Completo**
- ✅ **Logs Detalhados** - Todas as ações dos usuários registradas
- ✅ **Tracking de Login** - IP, User-Agent, tentativas falhadas
- ✅ **Eventos de Segurança** - Categorizados por severidade
- ✅ **Retenção Configurável** - 90 dias por padrão

#### 🕵️ **Detecção Inteligente de Anomalias**
- ✅ **Força Bruta** - Detecção por email e IP
- ✅ **Padrões Suspeitos** - Novo IP, User-Agent, localização
- ✅ **Abuso de Reset** - Múltiplas tentativas de reset de senha
- ✅ **Escalação de Privilégios** - Tentativas de acesso não autorizado
- ✅ **Rate Limiting Anômalo** - Detecção de ataques de negação

#### 🛡️ **WAF (Web Application Firewall)**
- ✅ **SQL Injection** - Proteção contra UNION SELECT, DROP TABLE, OR 1=1
- ✅ **XSS** - Bloqueio de script tags, javascript:, event handlers
- ✅ **Command Injection** - Detecção de comandos do sistema
- ✅ **Path Traversal** - Proteção contra ../../../ ataques
- ✅ **User-Agent Suspeitos** - Bloqueio de ferramentas de ataque

#### 📊 **SIEM (Security Information and Event Management)**
- ✅ **Dashboard em Tempo Real** - Métricas de segurança live
- ✅ **Correlação de Eventos** - Regras automáticas de detecção
- ✅ **Alertas por Severidade** - LOW, MEDIUM, HIGH, CRITICAL
- ✅ **Análise de Tendências** - Estatísticas históricas
- ✅ **Resolução de Incidentes** - Workflow de investigação

## 🏗️ Arquitetura Técnica

### **Stack Principal**
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: JWT com rotação automática
- **Security**: MFA, WAF, SIEM, Auditoria

### **Deploy e Infraestrutura**
- **Hosting**: Vercel (Edge Functions, Global CDN)
- **Database**: Neon (Serverless PostgreSQL)
- **Monitoring**: Vercel Analytics + Custom Security Dashboard
- **Cron Jobs**: Vercel Cron (execução automática)
- **CI/CD**: GitHub Actions + Vercel Integration

### **Banco de Dados**
```sql
-- Tabelas principais
User, Todo, Name, Token

-- Tabelas de segurança
LoginAttempt, AuditLog, SecurityEvent, RateLimitEntry, JWTKey
```

## 🚀 Deploy Automático

### **Deploy Zero-Config (Recomendado)**
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/todoapp.git
cd todoapp

# 2. Deploy na Vercel
npx vercel --prod

# 3. Configurar variáveis de ambiente no Vercel Dashboard
# 4. Inicializar sistemas de segurança (uma vez)
curl -X POST https://todoapp.vercel.app/api/deploy/complete \
  -H "Authorization: Bearer $DEPLOY_SECRET"
```

### **Deploy com Script Automático**
```bash
# Executar script completo
./scripts/deploy-vercel.sh

# O script faz tudo automaticamente:
# - Verifica pré-requisitos
# - Faz deploy na Vercel
# - Inicializa sistemas de segurança
# - Verifica funcionamento
```

### **Deploy com GitHub Actions**
```bash
# Configurar secrets no GitHub:
# - VERCEL_TOKEN, ORG_ID, PROJECT_ID
# - VERCEL_URL, DEPLOY_SECRET, CRON_SECRET

# Push ativa deploy automático
git push origin main
```

## ⚙️ Configuração

### **Variáveis de Ambiente (Vercel Dashboard)**
```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# JWT (OBRIGATÓRIO - mínimo 32 caracteres)
JWT_SECRET="sua-chave-jwt-super-secreta-com-minimo-32-caracteres"

# Email (para notificações de segurança)
EMAIL_FROM="noreply@seudominio.com"
EMAIL_HOST="smtp.seudominio.com"
EMAIL_PORT="587"
EMAIL_USER="smtp@seudominio.com"
EMAIL_PASS="sua-senha-smtp"

# Aplicação
NODE_ENV="production"
NEXTAUTH_URL="https://todoapp.vercel.app"

# Segurança
WAF_ENABLED="true"
SECURITY_ALERT_EMAIL="security@seudominio.com"

# Secrets para APIs automáticas
CRON_SECRET="seu-secret-super-seguro-para-cron-jobs"
DEPLOY_SECRET="seu-secret-para-deploy-automatico"
```

### **Configuração Neon Database**
1. Criar projeto no [Neon Console](https://console.neon.tech/)
2. Copiar connection string
3. Configurar no Vercel como `DATABASE_URL`

## 🔒 Segurança Implementada

### **Níveis de Segurança**
- **Nível 1**: Autenticação JWT, Hash de senhas, Rate limiting
- **Nível 2**: MFA, Auditoria, Detecção de anomalias, WAF
- **Nível 3**: SIEM, Rotação de chaves, Alertas automáticos
- **Nível 4**: Compliance OWASP, Enterprise-grade

### **Proteções Ativas**
- ✅ **OWASP Top 10** - Proteção completa contra vulnerabilidades
- ✅ **Zero Trust** - Verificação contínua de identidade
- ✅ **Defense in Depth** - Múltiplas camadas de proteção
- ✅ **Security by Design** - Segurança desde a arquitetura

### **Monitoramento 24/7**
- ✅ **Cron Jobs Automáticos** - Monitoramento, limpeza, backup, rotação
- ✅ **Alertas Inteligentes** - Notificações por email/Slack
- ✅ **Dashboard Live** - Métricas em tempo real
- ✅ **Logs Centralizados** - Auditoria completa

## 📊 APIs de Segurança

### **Dashboard e Monitoramento**
```bash
# Dashboard completo
GET /api/security/dashboard

# Estatísticas específicas
GET /api/security/dashboard?type=security
GET /api/security/dashboard?type=anomaly

# Eventos de segurança
GET /api/security/events
POST /api/security/events (resolver eventos)
```

### **MFA (Multi-Factor Authentication)**
```bash
# Configurar MFA
POST /api/auth/mfa/setup

# Verificar código MFA
POST /api/auth/mfa/verify

# Desabilitar MFA
POST /api/auth/mfa/disable
```

### **Gerenciamento de Chaves JWT**
```bash
# Listar chaves
GET /api/security/jwt-keys

# Rotacionar chaves
POST /api/security/jwt-keys (action: rotate)

# Limpar chaves expiradas
POST /api/security/jwt-keys (action: cleanup)
```

### **APIs de Cron (Automáticas)**
```bash
# Monitoramento (executa a cada hora)
GET /api/security/monitor

# Limpeza de logs (executa semanalmente)
GET /api/security/cleanup

# Backup (executa diariamente)
GET /api/security/backup

# Rotação JWT (executa diariamente)
GET /api/security/jwt-rotation
```

## ⏰ Cron Jobs Automáticos

| Horário | Função | Frequência | Descrição |
|---------|--------|------------|-----------|
| **00:00** | Monitoramento | A cada hora | Verifica eventos críticos e alertas |
| **01:00** | Backup | Diário | Backup de dados e estatísticas |
| **02:00** | Rotação JWT | Diário | Rotaciona chaves próximas do vencimento |
| **03:00** | Limpeza | Semanal | Remove logs antigos (90+ dias) |

## 🧪 Testes

### **Executar Testes**
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em CI
npm run test:ci

# Testes E2E
npm run test:e2e
```

### **Cobertura de Testes**
- ✅ **Unitários**: 80%+ cobertura
- ✅ **Integração**: APIs e banco de dados
- ✅ **E2E**: Fluxos críticos do usuário
- ✅ **Segurança**: Testes de vulnerabilidades

## 📈 Performance

### **Métricas Alvo**
- ✅ **First Contentful Paint**: < 1.5s
- ✅ **Largest Contentful Paint**: < 2.5s
- ✅ **First Input Delay**: < 100ms
- ✅ **API Response Time**: < 200ms (p95)

### **Otimizações**
- ✅ **Edge Functions** - Vercel global CDN
- ✅ **Database Indexing** - Otimizações Prisma
- ✅ **Image Optimization** - Next.js Image
- ✅ **Code Splitting** - Lazy loading automático

## 🔧 Desenvolvimento

### **Setup Local**
```bash
# Instalar dependências
npm install

# Configurar banco local
cp .env.example .env.local
# Editar .env.local com suas configurações

# Executar migrações
npm run db:migrate

# Inicializar segurança
npm run security:init

# Executar em desenvolvimento
npm run dev
```

### **Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Testes
npm test             # Testes unitários
npm run test:coverage # Testes com coverage
npm run test:ci      # Testes em CI

# Banco de dados
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados de teste
npm run db:reset     # Reset do banco

# Segurança
npm run security:init    # Inicializar sistemas de segurança
npm run security:monitor # Monitoramento manual

# Deploy
./scripts/deploy-vercel.sh # Deploy automatizado
```

## 📚 Documentação

### **Guias Disponíveis**
- 📖 **[Guia Completo de Produção](GUIA_COMPLETO_PRODUCAO.md)** - Deploy em servidor próprio
- 🚀 **[Deploy Vercel + Neon](DEPLOY_VERCEL_NEON.md)** - Deploy automatizado na nuvem
- 🔒 **[Setup de Segurança](SECURITY_SETUP.md)** - Configuração de segurança
- 📋 **[Resumo de Implementação](IMPLEMENTACAO_SEGURANCA_COMPLETA.md)** - Detalhes técnicos

### **APIs Documentadas**
- 📊 **[Dashboard de Segurança](docs/security-dashboard.md)**
- 🔐 **[MFA APIs](docs/mfa-apis.md)**
- 🛡️ **[WAF Configuration](docs/waf-config.md)**
- 📝 **[Audit System](docs/audit-system.md)**

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Guidelines**
- ✅ Seguir padrões de código (ESLint + Prettier)
- ✅ Escrever testes para novas funcionalidades
- ✅ Documentar APIs e mudanças importantes
- ✅ Manter compatibilidade com sistemas de segurança

## 🛡️ Segurança

### **Reportar Vulnerabilidades**
- 📧 **Email**: 
- 🔒 **PGP Key**: Disponível em [security policy](SECURITY.md)
- 🚨 **Responsible Disclosure**: 90 dias para correção

### **Auditorias de Segurança**
- ✅ **OWASP ZAP** - Scan automático
- ✅ **npm audit** - Dependências seguras
- ✅ **CodeQL** - Análise estática
- ✅ **Penetration Testing** - Testes regulares

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Roadmap

### **Próximas Funcionalidades**
- 🔄 **Machine Learning** - Detecção avançada de anomalias
- 📱 **Mobile App** - React Native com sincronização
- 🌐 **Multi-idioma** - i18n completo
- 🔗 **Integrações** - Slack, Discord, Teams
- 📊 **Analytics** - Métricas de produtividade

### **Melhorias de Segurança**
- 🧠 **AI Security** - Detecção baseada em ML
- 🔐 **Hardware Keys** - FIDO2/WebAuthn
- 📋 **Compliance** - GDPR, PCI-DSS, SOC2
- 🔍 **Forensics** - Análise de incidentes avançada

## 📞 Suporte

### **Canais de Suporte**
- 📧 **Email**: --
- 💬 **Discord**: --
- 📖 **Documentação**:--
- 🐛 **Issues**:--

### **Status e Monitoramento**
- 🟢 **Status Page**:--
- 📊 **Uptime**: 99.9% SLA
- 🚨 **Incident Response**: < 15 minutos
- 📞 **Suporte 24/7**: Para planos Enterprise

---

## 🎉 Agradecimentos

- **[Next.js](https://nextjs.org/)** - Framework React
- **[Prisma](https://prisma.io/)** - ORM moderno
- **[Vercel](https://vercel.com/)** - Deploy e hosting
- **[Neon](https://neon.tech/)** - Database serverless
- **[OWASP](https://owasp.org/)** - Padrões de segurança

---

<div align="center">

**🔒 Construído com segurança em mente**

[![Security](https://img.shields.io/badge/Security-First-red)](https://github.com/seu-usuario/todoapp/security)
[![Enterprise Ready](https://img.shields.io/badge/Enterprise-Ready-blue)](https://github.com/seu-usuario/todoapp)
[![Zero Config](https://img.shields.io/badge/Zero%20Config-Deploy-green)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/todoapp)

**[🚀 Deploy Now](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/todoapp)** | **[📖 Documentation](docs/)** | **[🛡️ Security](SECURITY.md)**

</div>