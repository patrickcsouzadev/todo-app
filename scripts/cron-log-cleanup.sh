#!/bin/bash

# ===========================================
# SCRIPT DE LIMPEZA DE LOGS
# Para uso com CRON JOBS em produção
# ===========================================

# Configurações
PROJECT_DIR="/var/www/todoapp"
LOG_DIR="/var/log/todoapp"
LOG_FILE="$LOG_DIR/log-cleanup.log"
ALERT_EMAIL="admin@seudominio.com"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
DAYS_TO_KEEP=90

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

log_message "Starting log cleanup (keeping $DAYS_TO_KEEP days)..."

# Executar limpeza de logs
output=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupLogs() {
    try {
        const cutoffDate = new Date(Date.now() - $DAYS_TO_KEEP * 24 * 60 * 60 * 1000);
        
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
        ]);
        
        console.log('Cleanup completed:');
        console.log('Audit logs deleted:', auditLogsDeleted.count);
        console.log('Security events deleted:', securityEventsDeleted.count);
        console.log('Login attempts deleted:', loginAttemptsDeleted.count);
        
        await prisma.\$disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

cleanupLogs();
" 2>&1)

exit_code=$?

# Log da saída
echo "$output" >> "$LOG_FILE"

# Verificar se houve erro
if [[ $exit_code -eq 0 ]]; then
    log_message "Log cleanup completed successfully"
    echo "$output" | grep -E "Audit logs deleted:|Security events deleted:|Login attempts deleted:" >> "$LOG_FILE"
else
    log_message "ERROR: Log cleanup failed with exit code $exit_code"
    send_alert "❌ Log Cleanup Failed" "Exit code: $exit_code\nOutput: $output"
fi

# Limpeza de arquivos de log do sistema (opcional)
if [[ -d "$LOG_DIR" ]]; then
    # Remover arquivos de log antigos (mais de 30 dias)
    find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null
    log_message "System log files older than 30 days cleaned up"
fi

# Limitar tamanho do arquivo de log
if [[ -f "$LOG_FILE" ]]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log_message "Log cleanup job finished"



