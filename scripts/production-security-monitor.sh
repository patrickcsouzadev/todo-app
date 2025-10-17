#!/bin/bash

# Script de Monitoramento de Segurança para Produção
# Uso: ./scripts/production-security-monitor.sh [--alert] [--email]

PROJECT_DIR="/path/to/your/project"
LOG_FILE="/var/log/security-monitor.log"
ALERT_EMAIL="security@seudominio.com"
ALERT_THRESHOLD_CRITICAL=1
ALERT_THRESHOLD_HIGH=3

# Função para enviar alertas por email
send_alert() {
    local subject="$1"
    local message="$2"
    
    if [[ "$SEND_EMAIL" == "true" ]]; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        echo "$(date): Alert sent to $ALERT_EMAIL" >> "$LOG_FILE"
    fi
}

# Função para verificar se deve enviar alertas
check_alerts() {
    local output="$1"
    
    # Contar eventos críticos
    critical_count=$(echo "$output" | grep -c "eventos críticos encontrados" || echo "0")
    high_count=$(echo "$output" | grep -c "Eventos de alta severidade" || echo "0")
    
    # Extrair números dos eventos
    if [[ "$critical_count" -gt 0 ]]; then
        critical_events=$(echo "$output" | grep "eventos críticos encontrados" | grep -o '[0-9]*' | head -1)
        if [[ "$critical_events" -ge "$ALERT_THRESHOLD_CRITICAL" ]]; then
            send_alert "🚨 ALERTA CRÍTICO: $critical_events eventos críticos detectados" "$output"
        fi
    fi
    
    if [[ "$high_count" -gt 0 ]]; then
        high_events=$(echo "$output" | grep "Eventos de alta severidade" | grep -o '[0-9]*' | head -1)
        if [[ "$high_events" -ge "$ALERT_THRESHOLD_HIGH" ]]; then
            send_alert "⚠️ ALERTA ALTO: $high_events eventos de alta severidade" "$output"
        fi
    fi
}

# Função para gerar relatório
generate_report() {
    local output="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "=== RELATÓRIO DE SEGURANÇA - $timestamp ===" >> "$LOG_FILE"
    echo "$output" >> "$LOG_FILE"
    echo "==========================================" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Função principal
main() {
    echo "🔍 Iniciando monitoramento de segurança em produção..."
    
    # Verificar se o diretório do projeto existe
    if [[ ! -d "$PROJECT_DIR" ]]; then
        echo "❌ Erro: Diretório do projeto não encontrado: $PROJECT_DIR"
        exit 1
    fi
    
    # Navegar para o diretório do projeto
    cd "$PROJECT_DIR" || exit 1
    
    # Verificar se a aplicação está rodando
    if ! pgrep -f "node.*next" > /dev/null; then
        echo "⚠️ Aviso: Aplicação não está rodando"
    fi
    
    # Executar monitoramento
    echo "📊 Executando análise de segurança..."
    output=$(npm run security:monitor 2>&1)
    
    # Gerar relatório
    generate_report "$output"
    
    # Verificar alertas se solicitado
    if [[ "$1" == "--alert" || "$2" == "--alert" ]]; then
        check_alerts "$output"
    fi
    
    # Mostrar resultado no console
    echo "$output"
    
    echo "✅ Monitoramento concluído. Log salvo em: $LOG_FILE"
}

# Verificar argumentos
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Uso: $0 [--alert] [--email]"
    echo "  --alert  : Enviar alertas por email se necessário"
    echo "  --email  : Forçar envio de email"
    echo "  --help   : Mostrar esta ajuda"
    exit 0
fi

# Configurar envio de email
if [[ "$1" == "--email" || "$2" == "--email" ]]; then
    SEND_EMAIL="true"
fi

# Executar função principal
main "$@"



