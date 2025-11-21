# 🚀 Guia de Deploy - Leadgram

**Última atualização:** 17 de Janeiro de 2025

---

## ✅ Pré-requisitos

Antes de fazer o deploy, certifique-se que:

- [x] Código commitado e na branch `main`
- [x] Todas as migrações do banco aplicadas
- [x] Testes locais funcionando
- [x] Variáveis de ambiente documentadas

---

## 📦 Deploy na Vercel

### 1. Conectar Repositório (Se ainda não conectou)

```bash
# Na pasta do projeto
vercel
```

Ou via Dashboard:
1. Acesse https://vercel.com
2. Click "Add New Project"
3. Importe o repositório `conhecendodigital/leadgram-app`
4. Configure as variáveis de ambiente

---

### 2. Configurar Variáveis de Ambiente

**⚠️ IMPORTANTE:** Adicione estas variáveis no Vercel Dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your_supabase_project_id
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# RapidAPI Instagram
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=instagram-scraper-20251.p.rapidapi.com

# Facebook/Instagram OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://formulareal.online/api/instagram/callback
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Google Drive OAuth ⬅️ NOVO!
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URL da aplicação
NEXT_PUBLIC_API_URL=https://formulareal.online
NEXT_PUBLIC_APP_URL=https://formulareal.online

# Cron Jobs
CRON_SECRET=seu_secret_aqui
```

---

### 3. Atualizar URIs de Redirecionamento

#### Google Cloud Console
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Edite as credenciais OAuth 2.0
3. **URIs de redirecionamento autorizados:**
   - `https://formulareal.online/api/google-drive/callback` ✅
   - `http://localhost:3000/api/google-drive/callback` (manter para dev)

#### Facebook Developers
1. Acesse: https://developers.facebook.com
2. Edite o app do Instagram
3. **URIs de redirecionamento OAuth válidos:**
   - `https://formulareal.online/api/instagram/callback` ✅

---

### 4. Fazer Deploy

**Via Git (Automático):**
```bash
git push origin main
```

Vercel detecta automaticamente e faz deploy!

**Via CLI Vercel:**
```bash
vercel --prod
```

---

### 5. Aplicar Migrações no Banco (Produção)

**Opção 1: Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/editor
2. Abra o SQL Editor
3. Execute a migração mais recente:

```sql
-- Cole o conteúdo de:
-- supabase/migrations/20250117000000_google_drive_integration.sql
```

**Opção 2: Supabase CLI**
```bash
npx supabase db push --db-url "postgresql://postgres:..."
```

---

## ✅ Checklist Pós-Deploy

Após o deploy, teste:

- [ ] Login/Registro funciona
- [ ] Conexão com Instagram funciona
- [ ] Conexão com Google Drive funciona
- [ ] Criar nova ideia funciona
- [ ] Upload de vídeo para Drive funciona
- [ ] Métricas são sincronizadas
- [ ] Links de posts funcionam

---

## 🔍 Monitoramento

### Vercel
- Logs: https://vercel.com/conhecendodigital/leadgram-app
- Analytics: https://vercel.com/conhecendodigital/leadgram-app/analytics

### Supabase
- Logs: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/logs
- Database: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/editor

### Google Cloud Console
- APIs & Services: https://console.cloud.google.com/apis/dashboard?project=leadgram
- Quotas: https://console.cloud.google.com/apis/api/drive.googleapis.com/quotas?project=leadgram

---

## 🐛 Troubleshooting

### Erro "Google Drive not connected"
- Verificar se variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configuradas
- Verificar se URI de redirecionamento está correto no Google Cloud

### Erro "Failed to create idea"
- Verificar se migração foi aplicada no banco de produção
- Verificar logs no Supabase

### Erro 500 nos endpoints
- Verificar todas as variáveis de ambiente
- Verificar logs no Vercel Dashboard

---

## 🔐 Segurança

### Secrets a NUNCA commitar:
- ❌ Tokens de API
- ❌ Client Secrets
- ❌ Service Role Keys
- ❌ Senhas do banco

Sempre use variáveis de ambiente!

---

## 📱 Domínios

**Produção:** https://formulareal.online
**Preview:** https://leadgram-app-git-{branch}.vercel.app

---

**🎉 Deploy concluído com sucesso!**
