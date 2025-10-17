# 🔐 Configuração de GitHub Actions Secrets

## 📋 O que são?

GitHub Actions Secrets são **variáveis de ambiente criptografadas** que os workflows do GitHub Actions usam para executar testes e deploys automaticamente.

---

## 🎯 Por que configurar?

Sem esses secrets, seus workflows **falham** porque não conseguem:
- ✅ Conectar no banco de dados para rodar testes
- ✅ Gerar tokens JWT nos testes
- ✅ Executar testes E2E do Playwright
- ✅ Fazer deploy automático no Vercel
- ✅ Inicializar sistemas de segurança após deploy

---

## 🔧 Secrets Necessários

### 1️⃣ **Secrets para Testes (Playwright workflow)**

Esses são usados pelo arquivo `.github/workflows/playwright.yml`:

```bash
DATABASE_URL           # URL do banco de dados de teste
JWT_SECRET            # Secret para gerar tokens JWT nos testes
NEXT_PUBLIC_APP_URL   # URL da aplicação (pode usar localhost)
```

### 2️⃣ **Secrets para Deploy (deploy-security workflow)**

Esses são usados pelo arquivo `.github/workflows/deploy-security.yml`:

```bash
VERCEL_TOKEN          # Token de autenticação da Vercel
ORG_ID                # ID da sua organização na Vercel
PROJECT_ID            # ID do projeto na Vercel
VERCEL_URL            # URL do seu app (https://app-list-ptk.vercel.app)
DEPLOY_SECRET         # Secret para webhook de deploy
CRON_SECRET           # Secret para rotas de segurança
```

---

## 📝 Passo a Passo - Como Configurar

### **Passo 1: Acessar GitHub Secrets**

1. Acesse seu repositório: https://github.com/patrickcsouzadev/todo-app
2. Clique em **Settings** (⚙️)
3. No menu lateral esquerdo, clique em **Secrets and variables** → **Actions**
4. Clique no botão verde **"New repository secret"**

---

### **Passo 2: Adicionar Secrets de Teste**

#### **DATABASE_URL**
- Nome: `DATABASE_URL`
- Valor: `postgresql://neondb_owner:npg_e0vNLbpr7aPc@ep-cool-river-acgn07qr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`
- ✅ Clique em **Add secret**

#### **JWT_SECRET**
- Nome: `JWT_SECRET`
- Valor: (copie o valor de `JWT_SECRET` das suas variáveis do Vercel)
- ✅ Clique em **Add secret**

#### **NEXT_PUBLIC_APP_URL**
- Nome: `NEXT_PUBLIC_APP_URL`
- Valor: `https://app-list-ptk.vercel.app`
- ✅ Clique em **Add secret**

---

### **Passo 3: Adicionar Secrets do Vercel (Deploy Automático)**

#### **Como Obter os Tokens da Vercel:**

1. **VERCEL_TOKEN:**
   - Acesse: https://vercel.com/account/tokens
   - Clique em **"Create Token"**
   - Nome: `GitHub Actions CI/CD`
   - Escopo: Full Account
   - Expiration: No Expiration (ou 1 ano)
   - Copie o token gerado

2. **ORG_ID e PROJECT_ID:**
   - Instale a CLI da Vercel localmente:
     ```bash
     npm i -g vercel
     vercel login
     vercel link
     ```
   - Isso criará um arquivo `.vercel/project.json` com:
     ```json
     {
       "orgId": "seu-org-id-aqui",
       "projectId": "seu-project-id-aqui"
     }
     ```

3. **VERCEL_URL:**
   - Nome: `VERCEL_URL`
   - Valor: `https://app-list-ptk.vercel.app`

4. **DEPLOY_SECRET e CRON_SECRET:**
   - Gere com:
     ```bash
     openssl rand -base64 32
     ```
   - Use o mesmo valor que você tem no Vercel

---

### **Passo 4: Adicionar Secrets de SMTP (Opcional)**

Se os testes usarem envio de email:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ptkbabayaga@gmail.com
SMTP_PASS=kbilqjfzwiwsekmn
SMTP_FROM=noreply@todoapp.com
```

---

## ✅ Lista de Verificação

Depois de configurar todos os secrets, você deve ter:

### **Secrets Essenciais (Mínimo):**
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`

### **Secrets de Deploy (Opcional - para deploy automático):**
- [ ] `VERCEL_TOKEN`
- [ ] `ORG_ID`
- [ ] `PROJECT_ID`
- [ ] `VERCEL_URL`
- [ ] `DEPLOY_SECRET`
- [ ] `CRON_SECRET`

### **Secrets de Email (Opcional):**
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`

---

## 🧪 Testar Configuração

Após adicionar os secrets:

1. **Faça um push qualquer:**
   ```bash
   git commit --allow-empty -m "test: trigger GitHub Actions"
   git push origin master
   ```

2. **Verifique os workflows:**
   - Acesse: https://github.com/patrickcsouzadev/todo-app/actions
   - Veja se os workflows estão passando ✅ (verde)

3. **Se falhar:**
   - Clique no workflow com erro
   - Veja os logs para identificar qual secret está faltando
   - Adicione o secret e tente novamente

---

## 🎯 Benefícios Após Configurar

Com os secrets configurados, você terá:

✅ **Testes automáticos** - Playwright testa cada push  
✅ **Deploy automático** - Vercel faz deploy quando passa nos testes  
✅ **CI/CD completo** - Pipeline totalmente automatizado  
✅ **Segurança** - Secrets nunca aparecem nos logs  
✅ **Qualidade** - Código testado antes de ir para produção  

---

## 📚 Referências

- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Vercel CLI: https://vercel.com/docs/cli
- Vercel Tokens: https://vercel.com/account/tokens

---

**Status Atual:**
- ⚠️ Workflows provavelmente estão falhando por falta de secrets
- ✅ Após configurar, terá CI/CD 100% funcional

**Última atualização:** 17 de outubro de 2025
