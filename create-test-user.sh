#!/bin/bash

# Script para criar usuário de teste no banco Neon

export DATABASE_URL="postgresql://neondb_owner:npg_e0vNLbpr7aPc@ep-cool-river-acgn07qr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

echo "🔧 Criando usuário de teste..."

# Registrar usuário via API da Vercel
curl -X POST https://app-list-ptk.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Teste@123456",
    "name": "Usuario Teste"
  }' \
  | jq '.'

echo ""
echo "✅ Se deu erro 500, o problema está no backend"
echo "✅ Se funcionou, tente fazer login com:"
echo "   Email: teste@example.com"
echo "   Senha: Teste@123456"
