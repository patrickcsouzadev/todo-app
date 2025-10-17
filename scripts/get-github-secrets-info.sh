#!/bin/bash

# Script para ajudar a coletar informações para GitHub Actions Secrets
# Execute: bash scripts/get-github-secrets-info.sh

echo "🔐 Coletando informações para GitHub Actions Secrets..."
echo ""

echo "📋 SECRETS BÁSICOS (copie esses valores):"
echo "=========================================="
echo ""

echo "1️⃣ DATABASE_URL (do Vercel):"
echo "postgresql://neondb_owner:npg_e0vNLbpr7aPc@ep-cool-river-acgn07qr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
echo ""

echo "2️⃣ JWT_SECRET (gere um novo):"
openssl rand -base64 32
echo ""

echo "3️⃣ NEXT_PUBLIC_APP_URL:"
echo "https://app-list-ptk.vercel.app"
echo ""

echo "4️⃣ DEPLOY_SECRET (gere um novo):"
openssl rand -base64 32
echo ""

echo "5️⃣ CRON_SECRET (gere um novo):"
openssl rand -base64 32
echo ""

echo "=========================================="
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "1. Acesse: https://github.com/patrickcsouzadev/todo-app/settings/secrets/actions"
echo "2. Clique em 'New repository secret'"
echo "3. Adicione cada secret acima com seu respectivo valor"
echo ""
echo "🔑 SECRETS DO VERCEL (precisam ser obtidos manualmente):"
echo ""
echo "VERCEL_TOKEN:"
echo "  - Acesse: https://vercel.com/account/tokens"
echo "  - Crie um token e copie o valor"
echo ""
echo "ORG_ID e PROJECT_ID:"
echo "  - Execute: npx vercel link"
echo "  - Os IDs estarão em .vercel/project.json"
echo ""
echo "✅ Após adicionar todos, teste com:"
echo "   git commit --allow-empty -m 'test: trigger CI/CD'"
echo "   git push origin master"
echo ""
