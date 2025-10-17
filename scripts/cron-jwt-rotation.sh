#!/bin/bash

# ===========================================
# SCRIPT DE ROTAÇÃO DE CHAVES JWT
# Para uso com CRON JOBS em produção
# ===========================================

# Configurações
PROJECT_DIR="/var/www/todoapp"
LOG_DIR="/var/log/todoapp"
LOG_FILE="$LOG_DIR/jwt-rotation.log"
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

log_message "Starting JWT key rotation..."

# Verificar chaves próximas do vencimento
output=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkKeys() {
    try {
        const expiringKeys = await prisma.jWTKey.findMany({
            where: {
                isActive: true,
                expiresAt: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            }
        });
        
        console.log('Expiring keys found:', expiringKeys.length);
        expiringKeys.forEach(key => {
            const daysLeft = Math.ceil((key.expiresAt - new Date()) / (24 * 60 * 60 * 1000));
            console.log('Key ID:', key.keyId, 'expires in', daysLeft, 'days');
        });
        
        if (expiringKeys.length > 0) {
            console.log('Rotating keys...');
            const { rotateJWTKey } = require('./src/lib/jwtRotation');
            await rotateJWTKey();
            console.log('Keys rotated successfully');
        }
        
        await prisma.\$disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkKeys();
" 2>&1)

exit_code=$?

# Log da saída
echo "$output" >> "$LOG_FILE"

# Verificar se houve erro
if [[ $exit_code -eq 0 ]]; then
    log_message "JWT key rotation completed successfully"
    echo "$output" | grep -q "Keys rotated successfully" && {
        send_alert "🔄 JWT Keys Rotated Successfully" "JWT keys have been rotated successfully.\n$output"
    }
else
    log_message "ERROR: JWT key rotation failed with exit code $exit_code"
    send_alert "❌ JWT Key Rotation Failed" "Exit code: $exit_code\nOutput: $output"
fi

# Limitar tamanho do arquivo de log
if [[ -f "$LOG_FILE" ]]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

log_message "JWT rotation job finished"



