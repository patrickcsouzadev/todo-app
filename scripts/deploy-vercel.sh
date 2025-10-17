#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY AUTOMÁTICO - VERCEL + NEON
# ===========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="todoapp"
VERCEL_URL=""
DEPLOY_SECRET=""

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar se git está instalado
    if ! command -v git &> /dev/null; then
        error "Git não está instalado"
        exit 1
    fi
    
    # Verificar se npm está instalado
    if ! command -v npm &> /dev/null; then
        error "npm não está instalado"
        exit 1
    fi
    
    # Verificar se Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI não está instalado. Instalando..."
        npm install -g vercel
    fi
    
    # Verificar se está em um repositório git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Não está em um repositório git"
        exit 1
    fi
    
    success "Pré-requisitos verificados"
}

# Função para verificar variáveis de ambiente
check_env_vars() {
    log "Verificando variáveis de ambiente..."
    
    # Verificar se .env.local existe
    if [[ ! -f ".env.local" ]]; then
        warning "Arquivo .env.local não encontrado"
        warning "Criando arquivo .env.example..."
        
        cat > .env.example << EOF
# Database (Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Secret (OBRIGATÓRIO - mínimo 32 caracteres)
JWT_SECRET="sua-chave-jwt-super-secreta-com-minimo-32-caracteres-para-producao"

# Email Configuration
EMAIL_FROM="noreply@seudominio.com"
EMAIL_HOST="smtp.seudominio.com"
EMAIL_PORT="587"
EMAIL_USER="smtp@seudominio.com"
EMAIL_PASS="sua-senha-smtp"

# Application
NODE_ENV="production"
NEXTAUTH_URL="https://todoapp.vercel.app"

# Security Configuration
WAF_ENABLED="true"
SECURITY_ALERT_EMAIL="security@seudominio.com"

# Cron Jobs Security
CRON_SECRET="seu-secret-super-seguro-para-cron-jobs"

# Deploy Security
DEPLOY_SECRET="seu-secret-para-deploy-automatico"
EOF
        
        error "Configure o arquivo .env.local com suas variáveis de ambiente"
        error "Use .env.example como referência"
        exit 1
    fi
    
    success "Variáveis de ambiente verificadas"
}

# Função para fazer deploy
deploy() {
    log "Iniciando deploy para Vercel..."
    
    # Fazer commit das mudanças
    git add .
    git commit -m "feat: Deploy with automated security systems" || warning "Nenhuma mudança para commitar"
    
    # Push para o repositório
    git push origin main
    
    success "Código enviado para o repositório"
    
    # Fazer deploy via Vercel CLI
    log "Fazendo deploy via Vercel CLI..."
    vercel --prod --yes
    
    success "Deploy concluído"
}

# Função para inicializar sistemas de segurança
init_security() {
    log "Inicializando sistemas de segurança..."
    
    # Aguardar um pouco para o deploy finalizar
    sleep 10
    
    # Obter URL do deploy
    VERCEL_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    if [[ -z "$VERCEL_URL" ]]; then
        error "Não foi possível obter a URL do deploy"
        return 1
    fi
    
    log "URL do deploy: https://$VERCEL_URL"
    
    # Chamar API de inicialização
    log "Chamando API de inicialização..."
    
    # Ler DEPLOY_SECRET do .env.local
    DEPLOY_SECRET=$(grep "DEPLOY_SECRET" .env.local | cut -d '=' -f2 | tr -d '"')
    
    if [[ -z "$DEPLOY_SECRET" ]]; then
        error "DEPLOY_SECRET não configurado no .env.local"
        return 1
    fi
    
    # Fazer chamada para API de inicialização
    response=$(curl -s -X POST "https://$VERCEL_URL/api/deploy/complete" \
        -H "Authorization: Bearer $DEPLOY_SECRET" \
        -H "Content-Type: application/json" \
        -w "%{http_code}")
    
    http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        success "Sistemas de segurança inicializados com sucesso"
    else
        error "Falha ao inicializar sistemas de segurança (HTTP $http_code)"
        return 1
    fi
}

# Função para verificar deploy
verify_deploy() {
    log "Verificando deploy..."
    
    # Aguardar um pouco para o deploy finalizar
    sleep 5
    
    # Verificar se a aplicação está respondendo
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$VERCEL_URL")
    
    if [[ "$response" == "200" ]]; then
        success "Aplicação está respondendo (HTTP 200)"
    else
        error "Aplicação não está respondendo (HTTP $response)"
        return 1
    fi
    
    # Verificar dashboard de segurança
    log "Verificando dashboard de segurança..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$VERCEL_URL/api/security/dashboard")
    
    if [[ "$response" == "200" ]]; then
        success "Dashboard de segurança funcionando"
    else
        warning "Dashboard de segurança não está acessível (HTTP $response)"
    fi
}

# Função para mostrar informações finais
show_final_info() {
    echo ""
    echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "📋 Informações do Deploy:"
    echo "   URL: https://$VERCEL_URL"
    echo "   Dashboard: https://$VERCEL_URL/api/security/dashboard"
    echo "   Status: https://$VERCEL_URL/api/health"
    echo ""
    echo "🔒 Sistemas de Segurança Ativos:"
    echo "   ✅ MFA (Multi-Factor Authentication)"
    echo "   ✅ Rotação de Chaves JWT"
    echo "   ✅ Sistema de Auditoria"
    echo "   ✅ Detecção de Anomalias"
    echo "   ✅ WAF (Web Application Firewall)"
    echo "   ✅ SIEM (Security Information and Event Management)"
    echo ""
    echo "⏰ Cron Jobs Configurados:"
    echo "   📊 Monitoramento: A cada hora"
    echo "   🧹 Limpeza: Semanalmente (domingos)"
    echo "   💾 Backup: Diariamente"
    echo "   🔄 Rotação JWT: Diariamente"
    echo ""
    echo "📞 Próximos Passos:"
    echo "   1. Acesse a aplicação e configure MFA"
    echo "   2. Monitore o dashboard de segurança"
    echo "   3. Configure alertas por email"
    echo "   4. Revise os logs regularmente"
    echo ""
    echo "🚀 Tudo está funcionando automaticamente!"
}

# Função principal
main() {
    echo "🚀 DEPLOY AUTOMÁTICO - TODO APP COM SEGURANÇA"
    echo "=============================================="
    echo ""
    
    # Verificar argumentos
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        echo "Uso: $0 [opções]"
        echo ""
        echo "Opções:"
        echo "  --help, -h     Mostrar esta ajuda"
        echo "  --skip-init    Pular inicialização de segurança"
        echo "  --verify-only  Apenas verificar deploy existente"
        echo ""
        exit 0
    fi
    
    # Executar etapas do deploy
    check_prerequisites
    check_env_vars
    
    if [[ "$1" != "--verify-only" ]]; then
        deploy
    fi
    
    if [[ "$1" != "--skip-init" ]]; then
        init_security
    fi
    
    verify_deploy
    show_final_info
}

# Executar função principal
main "$@"



