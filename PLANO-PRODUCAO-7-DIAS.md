# 🚀 PLANO DE PRODUÇÃO - LEADGRAM (7 DIAS)

**Objetivo:** Colocar app em produção, funcional, gratuito, sem bugs críticos
**Prazo:** 7 dias (~50 horas de trabalho)
**Custo:** R$ 0 (usando tiers gratuitos)

---

## 📅 CRONOGRAMA COMPLETO

### **DIA 1: BUGS BLOQUEADORES DE SEGURANÇA** 🔴

#### MANHÃ (4h): Rate Limiting
- [ ] Criar conta Upstash Redis (https://upstash.com) - FREE
- [ ] Pegar credenciais (UPSTASH_REDIS_REST_URL e TOKEN)
- [ ] Adicionar env vars no Vercel e .env.local
- [ ] Implementar rate limit em rotas críticas:
  - `/api/instagram/search` → 10 req/min
  - `/api/instagram/sync` → 5 req/min
  - `/api/google-drive/upload` → 10 req/min
  - `/api/ideas` (POST) → 20 req/min
  - `/api/checkout/create-preference` → 5 req/min
- [ ] Testar rate limiting funcionando

#### TARDE (4h): Webhook + CSRF
- [ ] Implementar validação webhook Mercado Pago (código em ANALISE-PAGAMENTOS.md)
- [ ] Corrigir CSRF OAuth Instagram:
  - Gerar state aleatório no `/api/instagram/auth`
  - Salvar state no banco
  - Validar no `/api/instagram/callback`
- [ ] Testar fluxo completo de pagamento sandbox

**RESULTADO DIA 1:** App seguro contra fraude e abuso

---

### **DIA 2: BUGS DE PERFORMANCE** ⚡

#### MANHÃ (4h): N+1 Queries
- [ ] Corrigir Bug #4: `/api/instagram/sync/route.ts`
  - Buscar todos posts existentes de uma vez
  - Usar Map para lookup O(1)
  - Eliminar loop de queries
- [ ] Corrigir Bug #5: `/api/cron/sync-instagram/route.ts`
  - Mesmo fix do Bug #4
- [ ] Testar sincronização com 50 posts (deve ser < 1 segundo)

#### TARDE (4h): Bugs Críticos de Dados
- [ ] Corrigir Bug #7: `/api/ideas/[id]/route.ts`
  - PATCH não deve deletar platforms antigas
  - Fazer UPSERT ou comparação inteligente
- [ ] Corrigir Bug #14: `/api/cron/sync-instagram/route.ts:112`
  - Mudar `instagram_post_id` para `instagram_media_id`
- [ ] Adicionar validações:
  - Tamanho máximo arquivo: 100MB
  - MIME types permitidos: video/mp4, video/quicktime, image/jpeg, image/png

**RESULTADO DIA 2:** App performático e não perde dados

---

### **DIA 3: SISTEMA DE PAGAMENTOS** 💰

#### MANHÃ (3h): Validar Fluxo Completo
- [ ] Teste sandbox Mercado Pago:
  - Criar preferência de pagamento
  - Fazer pagamento teste
  - Receber webhook
  - Verificar subscription ativada
- [ ] Teste atualização de assinatura no banco
- [ ] Verificar limites por plano funcionam (`/api/user/limits`)

#### TARDE (5h): Definir Regras de Negócio

**DECISÕES NECESSÁRIAS:**

**1. Preços dos Planos:**
```
Free: R$ 0
Pro: R$ ____ (sugestão: R$ 47/mês)
Premium: R$ ____ (sugestão: R$ 97/mês)
```

**2. Limites por Plano:**
```
Free:
  - Ideias: ____ (sugestão: 10 total)
  - Posts: Ilimitado
  - Contas Instagram: 1

Pro:
  - Ideias: Ilimitado
  - Posts: Ilimitado
  - Contas Instagram: 3
  - Features: Instagram + Google Drive + Analytics

Premium:
  - Ideias: Ilimitado
  - Posts: Ilimitado
  - Contas Instagram: 10
  - Features: Tudo + Automations + Suporte prioritário
```

**3. Tipo de Renovação:**
- [ ] MANUAL (recomendado para início - usuário paga 1x, renova manualmente)
- [ ] AUTOMÁTICA (mais complexo - precisa implementar cobrança recorrente)

**IMPLEMENTAR:**
- [ ] Atualizar `lib/config/plans.ts` com valores finais
- [ ] Atualizar `lib/settings.ts` com limites corretos
- [ ] Atualizar UI `components/settings/plan-settings.tsx` com features
- [ ] Testar upgrade Free → Pro
- [ ] Testar downgrade Pro → Free
- [ ] Testar limites sendo respeitados

**RESULTADO DIA 3:** Sistema de pagamento 100% funcional e testado

---

### **DIA 4: PÁGINA AUTOMATIONS (MVP)** 🤖

**DECISÃO:** O que Automations vai fazer?

**MVP RECOMENDADO:**
```
Automations = Controle de Sincronização Automática

Features:
1. Toggle ON/OFF para auto-sync Instagram
2. Histórico de sincronizações (últimas 10)
3. Botão "Sincronizar Agora" manual
4. Card mostrando última sincronização
```

#### MANHÃ (4h): Backend

**Criar migration:**
```sql
-- supabase/migrations/YYYYMMDD_automation_settings.sql
CREATE TABLE automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT, -- 'manual' ou 'auto'
  status TEXT, -- 'success', 'error'
  new_posts INT DEFAULT 0,
  updated_posts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API endpoints:**
- [ ] `GET /api/automations/settings` - Buscar configuração
- [ ] `POST /api/automations/settings` - Atualizar toggle
- [ ] `GET /api/automations/history` - Buscar histórico

#### TARDE (4h): Frontend

**Criar página:**
- [ ] Arquivo: `app/(dashboard)/dashboard/automations/page.tsx`
- [ ] Implementar UI com:
  - Toggle "Auto-sync Instagram"
  - Card "Última sincronização"
  - Botão "Sincronizar Agora"
  - Lista de histórico

**Template fornecido no relatório anterior pode ser usado.**

**RESULTADO DIA 4:** Automations funcional (MVP) - promessa cumprida!

---

### **DIA 5: COMPLIANCE MÍNIMO** 📄

#### MANHÃ (3h): Páginas Legais (OPÇÃO GRATUITA)

**Gerar políticas em:**
- Privacy Policy: https://www.freeprivacypolicy.com/
- Terms of Service: https://www.termsofservicegenerator.net/
- Cookie Policy: https://www.cookiepolicygenerator.com/

**Implementar:**
- [ ] Criar pasta `app/(legal)/legal/`
- [ ] Criar `app/(legal)/legal/privacy/page.tsx`
- [ ] Criar `app/(legal)/legal/terms/page.tsx`
- [ ] Criar `app/(legal)/legal/cookies/page.tsx`
- [ ] Adicionar links no footer de todas as páginas
- [ ] Instalar react-cookie-consent: `npm install react-cookie-consent`
- [ ] Adicionar cookie banner no layout

#### TARDE (4h): Google OAuth - Decisão

**OPÇÃO RECOMENDADA:** Manter em modo TESTE
- ✅ Permite até 100 usuários
- ✅ Suficiente para soft launch
- ✅ Evita burocracia do Google
- ⏰ Submete para verificação DEPOIS (quando tiver tração)

**Alternativa:** Submeter verificação agora
- ⚠️ Demora 2-4 semanas
- ⚠️ Requer vídeo demo, documentação extensiva
- ⚠️ Pode ser rejeitado

**Implementar:**
- [ ] Adicionar aviso na página Google Drive: "Em modo beta - máx 100 usuários"
- [ ] Preparar documentação para submissão futura (se optar por submeter)

**RESULTADO DIA 5:** Compliance básico OK, pode lançar

---

### **DIA 6: TESTES + AJUSTES** 🧪

#### MANHÃ (4h): Testes E2E

**Testar TODOS os fluxos críticos:**

**Fluxo 1: Onboarding**
- [ ] Criar conta nova
- [ ] Ver dashboard vazio
- [ ] Ver plano Free ativo

**Fluxo 2: Instagram**
- [ ] Conectar Instagram
- [ ] Sincronizar posts
- [ ] Ver posts no dashboard
- [ ] Ver métricas

**Fluxo 3: Ideias**
- [ ] Criar ideia
- [ ] Editar ideia
- [ ] Verificar que não perde dados
- [ ] Deletar ideia

**Fluxo 4: Google Drive**
- [ ] Conectar Google Drive
- [ ] Criar ideia (pasta deve ser criada automaticamente)
- [ ] Upload de vídeo
- [ ] Verificar arquivo no Drive

**Fluxo 5: Pagamento**
- [ ] Tentar criar 11ª ideia no Free (deve bloquear)
- [ ] Fazer upgrade para Pro
- [ ] Pagar no sandbox Mercado Pago
- [ ] Verificar subscription ativada
- [ ] Criar ideia ilimitadas

**Fluxo 6: Analytics**
- [ ] Ver gráficos carregando
- [ ] Dados aparecem

**Fluxo 7: Explore**
- [ ] Buscar perfil público
- [ ] Ver top posts

**Fluxo 8: Automations**
- [ ] Desabilitar auto-sync
- [ ] Sincronizar manualmente
- [ ] Ver histórico

#### TARDE (4h): Ajustes Finais

- [ ] Corrigir bugs encontrados nos testes
- [ ] Revisar todos os textos (typos, erros)
- [ ] Testar responsividade mobile (iPhone, Android)
- [ ] Setup Sentry (https://sentry.io - FREE tier)
- [ ] Configurar env vars SENTRY_DSN
- [ ] Testar build de produção local: `npm run build && npm start`

**RESULTADO DIA 6:** App 100% testado e ajustado

---

### **DIA 7: DEPLOY + LANÇAMENTO** 🚀

#### MANHÃ (2h): Preparar Deploy

**Stack 100% GRATUITA:**
- ✅ Hosting: Vercel (já configurado) - FREE
- ✅ Banco: Supabase (já configurado) - FREE
- ✅ Redis: Upstash (10k commands/day) - FREE
- ✅ Error Tracking: Sentry (5k events/mês) - FREE
- ✅ Analytics: PostHog self-hosted - FREE
- ✅ Email: Resend (100 emails/dia) - FREE

**Checklist Pre-Deploy:**
- [ ] Todas env vars configuradas no Vercel:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_FACEBOOK_APP_ID
  - FACEBOOK_APP_SECRET
  - NEXT_PUBLIC_GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - MERCADOPAGO_ACCESS_TOKEN (PRODUÇÃO!)
  - CRON_SECRET
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN
  - SENTRY_DSN

- [ ] Verificar vercel.json tem cron jobs configurados
- [ ] Webhook URLs apontando para domínio de produção
- [ ] Mercado Pago em modo PRODUÇÃO (não sandbox)
- [ ] Instagram App em modo PRODUÇÃO
- [ ] Google Drive App em modo TESTE (100 users OK)

#### TARDE (2h): Deploy

- [ ] `git add .`
- [ ] `git commit -m "feat: Preparação para produção"`
- [ ] `git push origin main` (deploy automático no Vercel)
- [ ] Acompanhar build no dashboard Vercel
- [ ] Verificar que build passou sem erros
- [ ] Abrir app em produção

#### NOITE (2h): Smoke Tests + Soft Launch

**Smoke tests em produção:**
- [ ] Criar conta teste
- [ ] Conectar Instagram (sua conta)
- [ ] Criar ideia
- [ ] **IMPORTANTE:** Testar pagamento REAL (R$ 47)
  - Pagar com seu próprio cartão
  - Verificar que subscription ativa
  - Verificar que Mercado Pago recebeu
  - **SE FUNCIONAR:** Estornar/cancelar pagamento
- [ ] Verificar Sentry recebendo eventos

**Soft Launch:**
- [ ] Convidar 5-10 amigos/beta testers
- [ ] Criar grupo WhatsApp ou Discord para feedback
- [ ] Dar acesso
- [ ] Monitorar Sentry por erros
- [ ] Responder feedback em tempo real

**RESULTADO DIA 7:** 🎉 **APP EM PRODUÇÃO!**

---

## ✅ CHECKLIST FINAL DE PRODUÇÃO

### Segurança ✓
- [ ] Rate limiting funcionando (Redis)
- [ ] Webhook validation implementada
- [ ] CSRF OAuth protegido
- [ ] RLS habilitado no Supabase
- [ ] Env vars seguras (não commitadas)
- [ ] HTTPS enforced

### Funcionalidades ✓
- [ ] Sistema de ideias completo (criar, editar, deletar)
- [ ] Instagram sincroniza posts
- [ ] Instagram OAuth funciona
- [ ] Google Drive upload funciona
- [ ] Google Drive OAuth funciona
- [ ] Pagamentos processam corretamente
- [ ] Webhook recebe e atualiza subscription
- [ ] Limites por plano funcionam
- [ ] Automations existe e funciona (MVP)
- [ ] Analytics mostra dados
- [ ] Explore busca perfis (RapidAPI)
- [ ] Upload de mídia funciona

### Compliance ✓
- [ ] Privacy Policy publicada
- [ ] Terms of Service publicados
- [ ] Cookie Policy publicada
- [ ] Cookie consent banner implementado
- [ ] Links no footer de todas as páginas

### Performance ✓
- [ ] N+1 queries corrigidos (sync + cron)
- [ ] Paginação Instagram (se necessário)
- [ ] Bundle otimizado
- [ ] Images otimizadas

### Monitoring ✓
- [ ] Sentry configurado
- [ ] Error tracking funcionando
- [ ] Console.logs em produção (verificar)
- [ ] Analytics tracking (se implementado)

### UX ✓
- [ ] Responsivo mobile
- [ ] Loading states
- [ ] Error messages claras
- [ ] Success messages
- [ ] Onboarding intuitivo

---

## 💰 CUSTO TOTAL: R$ 0

**Tudo usando tiers gratuitos:**
- **Vercel:** FREE (100GB bandwidth, unlimited requests)
- **Supabase:** FREE (500MB storage, 50k users)
- **Upstash Redis:** FREE (10k commands/day)
- **Sentry:** FREE (5k events/mês)
- **Resend:** FREE (100 emails/dia)

**Quando crescer (100+ usuários ativos):**
- Supabase Pro: $25/mês (8GB storage, 100k users)
- Upstash Pro: $10/mês (unlimited)
- **Total:** ~$35/mês (quando necessário, não agora)

---

## 🎯 DECISÕES NECESSÁRIAS (PREENCHER ANTES DE COMEÇAR)

### 1. Preços dos Planos
```
Free: R$ 0
Pro: R$ _____ (sugestão: R$ 47/mês)
Premium: R$ _____ (sugestão: R$ 97/mês)
```

### 2. Limites do Plano Free
```
Ideias: _____ (sugestão: 10 total)
Posts: _____ (sugestão: Ilimitado)
Contas Instagram: _____ (sugestão: 1)
```

### 3. Renovação de Assinaturas
- [ ] MANUAL (recomendado - mais simples)
- [ ] AUTOMÁTICA (mais complexo - cobrança recorrente)

### 4. Automations MVP
- [ ] Toggle auto-sync Instagram
- [ ] Histórico de sincronizações
- [ ] Botão manual sync
- [ ] Outro: _____

### 5. Google OAuth
- [ ] Manter em modo TESTE (100 users) - RECOMENDADO
- [ ] Submeter verificação agora (2-4 semanas delay)

---

## 🔧 BUGS A CORRIGIR (REFERÊNCIA)

**CRÍTICOS (P0):**
- [ ] Bug #1: Webhook sem validação
- [ ] Bug #2: Rate limit não funciona
- [ ] Bug #3: CSRF OAuth
- [ ] Bug #4: N+1 queries sync
- [ ] Bug #5: N+1 queries cron
- [ ] Bug #7: Perda dados ao editar

**ALTOS (P1):**
- [ ] Bug #12: Validação tamanho arquivo
- [ ] Bug #14: Campo errado cron
- [ ] Bug #11: Token Google não renova (pode deixar pra depois)

**Referência completa:** Ver `BUGS-E-MELHORIAS-DETALHADO.md`

---

## 📞 RECURSOS E LINKS

**Documentação:**
- Upstash Redis: https://upstash.com/docs/redis
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Mercado Pago Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

**Ferramentas:**
- Privacy Policy Generator: https://www.freeprivacypolicy.com/
- Terms Generator: https://www.termsofservicegenerator.net/
- Cookie Policy: https://www.cookiepolicygenerator.com/

**Testes:**
- Mercado Pago Sandbox: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test
- Instagram Test Users: https://developers.facebook.com/docs/development/build-and-test/test-users

---

## 📊 CRONOGRAMA VISUAL

```
Semana 1:
SEG | TER | QUA | QUI | SEX | SAB | DOM
D1  | D2  | D3  | D4  | D5  | D6  | D7
🔒  | ⚡  | 💰  | 🤖  | 📄  | 🧪  | 🚀

D1: Segurança
D2: Performance
D3: Pagamentos
D4: Automations
D5: Compliance
D6: Testes
D7: Deploy + Launch
```

**Total:** ~50 horas de trabalho focado

---

## ✨ APÓS LANÇAMENTO

**Primeiros 7 dias:**
- [ ] Monitorar Sentry diariamente
- [ ] Responder feedback beta testers
- [ ] Corrigir bugs urgentes
- [ ] Iterar em UX

**Primeiras 2-4 semanas:**
- [ ] Adicionar primeiros 50-100 usuários
- [ ] Coletar testimonials
- [ ] Ajustar pricing se necessário
- [ ] Preparar marketing

**Mês 2:**
- [ ] Submeter Google OAuth para verificação
- [ ] Public launch (Product Hunt, etc)
- [ ] Marketing orgânico
- [ ] Melhorias baseadas em dados

---

## 🎯 META FINAL

**Ao final dos 7 dias:**
✅ App funcionando 100% em produção
✅ Sem bugs críticos de segurança
✅ Pagamentos processando
✅ Todas as features prometidas entregando
✅ Compliance básico OK
✅ 5-10 beta testers usando
✅ Pronto para soft launch

**Boa sorte! 🚀**

---

**Criado em:** 18/11/2025
**Última atualização:** 18/11/2025
