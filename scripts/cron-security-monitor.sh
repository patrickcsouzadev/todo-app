#!/bin/bash

# ===========================================
# SCRIPT DE MONITORAMENTO DE SEGURANÇA
# Para uso com CRON JOBS em produção
# ===========================================

# Configurações
PROJECT_DIR="/var/www/todoapp"
LOG_DIR="/var/log/todoapp"
LOG_FILE="$LOG_DIR/security-monitor.log"
ALERT_EMAIL="admin@seudominio.com"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Criar diretório de logs se não existir
mkdir -p "$LOG_DIR"

# Função para log
log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Função para enviar alertas
send_alert() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        log_message "ALERT: $subject sent to $ALERT_EMAIL"
    else
        log_message "WARNING: mail command not found, cannot send alert: $subject"
    fi
}

# Verificar se o diretório do projeto existe
if [[ ! -d "$PROJECT_DIR" ]]; then
    log_message "ERROR: Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Navegar para o diretório do projeto
cd "$PROJECT_DIR" || {
    log_message "ERROR: Cannot navigate to project directory"
    exit 1
}

# Verificar se Node.js está disponível
if ! command -v node >/dev/null 2>&1; then
    log_message "ERROR: Node.js not found"
    exit 1
fi

# Verificar se npm está disponível
if ! command -v npm >/dev/null 2>&1; then
    log_message "ERROR: npm not found"
    exit 1
fi

# Executar monitoramento de segurança
log_message "Starting security monitoring..."

# Capturar saída do comando
output=$(npm run security:monitor 2>&1)
exit_code=$?

# Log da saída
echo "$output" >> "$LOG_FILE"

# Verificar se houve eventos críticos
critical_events=$(echo "$output" | grep "eventos críticos encontrados" | grep -o '[0-9]*' | head -1 || echo "0")
high_events=$(echo "$output" | grep "Eventos de alta severidade" | grep -o '[0-9]*' | head -1 || echo "0")

# Enviar alertas se necessário
if [[ "$critical_events" -gt 0 ]]; then
    send_alert "🚨 CRITICAL: $critical_events critical security events detected" "$output"
fi

if [[ "$high_events" -ge 3 ]]; then
    send_alert "⚠️ HIGH: $high_events high severity events detected" "$output"
fi

# Verificar se o comando foi executado com sucesso
if [[ $exit_code -eq 0 ]]; then
    log_message "Security monitoring completed successfully"
else
    log_message "ERROR: Security monitoring failed with exit code $exit_code"
    send_alert "❌ Security monitoring script failed" "Exit code: $exit_code\nOutput: $output"
fi

# Limitar tamanho do arquivo de log (manter apenas últimas 1000 linhas)
if [[ -f "$LOG_FILE" ]]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log_message "Security monitoring job finished"



