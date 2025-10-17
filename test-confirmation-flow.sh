#!/bin/bash

# Script de teste para verificar o fluxo de confirmação de email
# Este script simula o processo completo de confirmação

echo "🧪 Testando fluxo de confirmação de email..."
echo "=============================================="

# Verificar se o servidor está rodando
echo "1. Verificando se o servidor está rodando..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Servidor está rodando em http://localhost:3000"
else
    echo "❌ Servidor não está rodando. Execute 'npm run dev' primeiro."
    exit 1
fi

# Testar endpoint de confirmação GET (simulando clique no email)
echo ""
echo "2. Testando endpoint GET /api/auth/confirm..."
echo "   Simulando: usuário clica no link do email"

# Simular token válido (você pode substituir por um token real do banco)
TEST_TOKEN="test_token_123"
GET_URL="http://localhost:3000/api/auth/confirm?token=$TEST_TOKEN"

echo "   URL: $GET_URL"
echo "   Fazendo requisição GET..."

# Fazer requisição GET e capturar o código de status
GET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$GET_URL")
echo "   Status HTTP: $GET_STATUS"

if [ "$GET_STATUS" = "307" ] || [ "$GET_STATUS" = "302" ]; then
    echo "   ✅ Redirecionamento funcionando (esperado)"
else
    echo "   ⚠️  Status inesperado: $GET_STATUS"
fi

# Testar endpoint de confirmação POST (simulando componente React)
echo ""
echo "3. Testando endpoint POST /api/auth/confirm..."
echo "   Simulando: componente React fazendo POST"

POST_URL="http://localhost:3000/api/auth/confirm"
POST_DATA='{"token":"'$TEST_TOKEN'"}'

echo "   URL: $POST_URL"
echo "   Data: $POST_DATA"
echo "   Fazendo requisição POST..."

# Fazer requisição POST e capturar resposta
POST_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$POST_DATA" \
  "$POST_URL")

echo "   Resposta: $POST_RESPONSE"

# Verificar se a resposta contém 'ok'
if echo "$POST_RESPONSE" | grep -q '"ok"'; then
    echo "   ✅ Resposta contém campo 'ok' (esperado)"
else
    echo "   ⚠️  Resposta não contém campo 'ok'"
fi

echo ""
echo "4. Testando página de confirmação..."
echo "   Simulando: acesso direto à página /auth/confirm"

CONFIRM_PAGE_URL="http://localhost:3000/auth/confirm?token=$TEST_TOKEN"
CONFIRM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CONFIRM_PAGE_URL")

echo "   URL: $CONFIRM_PAGE_URL"
echo "   Status HTTP: $CONFIRM_STATUS"

if [ "$CONFIRM_STATUS" = "200" ]; then
    echo "   ✅ Página de confirmação carregando corretamente"
else
    echo "   ⚠️  Status inesperado: $CONFIRM_STATUS"
fi

echo ""
echo "=============================================="
echo "🎯 Resumo dos testes:"
echo "   - GET /api/auth/confirm: $GET_STATUS"
echo "   - POST /api/auth/confirm: $(echo $POST_RESPONSE | jq -r '.ok // "N/A"')"
echo "   - GET /auth/confirm: $CONFIRM_STATUS"
echo ""
echo "💡 Para teste completo:"
echo "   1. Registre um novo usuário"
echo "   2. Verifique o email recebido"
echo "   3. Clique no link de confirmação"
echo "   4. Verifique se a confirmação funciona sem loop infinito"


