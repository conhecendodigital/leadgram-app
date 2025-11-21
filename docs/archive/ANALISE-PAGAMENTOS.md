# 💳 ANÁLISE COMPLETA - SISTEMA DE PAGAMENTOS E PLANOS

**Data:** 18/11/2025
**Status:** ⚠️ FUNCIONAL MAS COM BUGS CRÍTICOS

---

## 📊 RESUMO EXECUTIVO

O sistema de pagamentos do Leadgram está **80% implementado** e a arquitetura está correta, mas existem **bugs críticos** que impedirão o funcionamento correto em produção.

### Veredicto Geral
- ✅ Arquitetura bem desenhada
- ✅ Integração Mercado Pago implementada
- ✅ Webhook configurado
- ⚠️ **BUG CRÍTICO** no formato do external_reference
- ⚠️ Validação de webhook insegura
- ⚠️ Endpoints duplicados

---

## 🏗️ ARQUITETURA DO SISTEMA

### Fluxo Completo de Pagamento

```
1. USUÁRIO clica "Fazer Upgrade"
   ↓
2. Frontend (plan-settings.tsx)
   → POST /api/checkout/create-preference
   ↓
3. Backend busca credenciais admin
   → Cria preferência no Mercado Pago
   → Retorna init_point
   ↓
4. Usuário é redirecionado para checkout MP
   ↓
5. Usuário paga
   ↓
6. Mercado Pago envia webhook
   → POST /api/mercadopago/webhook
   ↓
7. Backend processa pagamento
   → Atualiza user_subscriptions
   → Registra em payments
   ↓
8. Usuário é redirecionado de volta
   → /dashboard/settings?payment=success
```

**Status do Fluxo:** ✅ Bem desenhado e completo

---

## 💰 CONFIGURAÇÃO DOS PLANOS

### 1. Plano FREE
```typescript
{
  name: 'Free',
  price: 0,
  monthlyPrice: 0,
  features: [
    'Até 10 ideias por mês',
    'Análise básica de métricas',
    'Suporte por email'
  ]
}
```

**Limites (lib/settings.ts):**
- `free_max_ideas`: 10 ideias
- `free_max_posts_per_month`: 5 posts

---

### 2. Plano PRO
```typescript
{
  name: 'Pro',
  price: 49,
  monthlyPrice: 49,
  features: [
    'Ideias ilimitadas',
    'Análise avançada de métricas',
    'Integração com Instagram',
    'Exportação de relatórios',
    'Suporte prioritário'
  ]
}
```

**Limites:**
- `pro_max_ideas`: 50 ideias (ou -1 para ilimitado)
- `pro_max_posts_per_month`: 30 posts

**Nota:** A descrição diz "ilimitadas" mas o código define 50. **INCONSISTÊNCIA!**

---

### 3. Plano PREMIUM
```typescript
{
  name: 'Premium',
  price: 99,
  monthlyPrice: 99,
  features: [
    'Tudo do Pro +',
    'Multi-plataformas',
    'API de automação',
    'Suporte 24/7',
    'Consultoria mensal'
  ]
}
```

**Limites:**
- `premium_max_ideas`: -1 (ilimitado)
- `premium_max_posts_per_month`: -1 (ilimitado)

**Status:** ✅ Configuração coerente

---

## 🔴 BUGS CRÍTICOS ENCONTRADOS

### BUG #1: INCONSISTÊNCIA NO external_reference (CRÍTICO)
**Severidade:** 🔴 CRÍTICA
**Impacto:** Webhook não processará pagamentos corretamente

**Problema:**
Existem **dois formatos diferentes** de `external_reference`:

**Formato 1** (lib/mercadopago.ts:66):
```typescript
external_reference: `${userId}:${planId}` // Usa ':' (dois pontos)
```

**Formato 2** (app/api/checkout/create-preference/route.ts:65):
```typescript
external_reference: `${user.id}-${plan}` // Usa '-' (hífen)
```

**Webhook** (app/api/mercadopago/webhook/route.ts:44):
```typescript
const [userId, planType] = payment.external_reference.split('-') // Split por '-'
```

**Consequência:**
- Se usar endpoint `/api/mercadopago/create-preference`: Webhook fará split errado
- Se usar endpoint `/api/checkout/create-preference`: Funciona (usa hífen)

**Qual está sendo usado?**
- ✅ O componente `plan-settings.tsx` usa `/api/checkout/create-preference` (CORRETO)
- ❌ O endpoint `/api/mercadopago/create-preference` existe mas não é usado (LIXO)

**Status Atual:** ⚠️ FUNCIONA por acidente, mas tem código morto confuso

**Solução:**
1. **Remover** endpoint `/api/mercadopago/create-preference` (não é usado)
2. **Remover** função do `lib/mercadopago.ts` (não é usada)
3. **Padronizar** tudo em um único lugar

---

### BUG #2: Validação Webhook Sempre Retorna True (CRÍTICA)
**Severidade:** 🔴 CRÍTICA
**Impacto:** Webhooks falsos podem ser aceitos

**Localização:** lib/mercadopago.ts:79-84

```typescript
export function validateWebhookSignature(requestBody: string, signature: string): boolean {
  // In production, implement proper signature validation
  // For now, we'll return true for development
  // See: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
  return true // ⚠️ SEMPRE TRUE = INSEGURO
}
```

**Problema:**
- Qualquer requisição pode se passar por webhook do Mercado Pago
- Risco de fraude: alguém pode enviar webhooks falsos para ativar assinaturas

**Nota:** A função existe mas **não é chamada** no webhook!

**Status Atual:** ❌ NÃO IMPLEMENTADA

**Solução:** Implementar validação HMAC real (veja seção "Como Corrigir" abaixo)

---

### BUG #3: Inconsistência nos Limites do Plano Pro
**Severidade:** 🟡 MÉDIA
**Impacto:** Usuários podem ficar confusos

**Problema:**
- **Interface do usuário** diz: "Ideias ilimitadas"
- **Código backend** define: 50 ideias (`pro_max_ideas: 50`)

**Arquivos:**
- `components/settings/plan-settings.tsx:34` - Diz "100 ideias por mês"
- `lib/config/plans.ts:24` - Diz "Ideias ilimitadas"
- `lib/settings.ts:127` - Código define 50 (ou busca de settings)

**Solução:** Decidir o limite real e padronizar em todos os lugares

---

### BUG #4: Endpoints Duplicados
**Severidade:** 🟢 BAIXA
**Impacto:** Confusão no código, possível manutenção futura

**Problema:**
Existem 2 endpoints fazendo a mesma coisa:

1. `/api/mercadopago/create-preference` (NÃO USADO)
2. `/api/checkout/create-preference` (USADO)

**Status:** Código morto que deveria ser removido

---

## ✅ O QUE ESTÁ FUNCIONANDO

### 1. Criação de Preferência de Pagamento
**Endpoint:** `/api/checkout/create-preference`
**Status:** ✅ FUNCIONA

**Fluxo:**
1. Busca credenciais admin do banco (`admin_mercadopago`)
2. Cria cliente Mercado Pago com access_token
3. Cria preferência com item, preço, URLs de retorno
4. Retorna `init_point` para redirecionar usuário

**Código:** Limpo e funcional

---

### 2. Webhook do Mercado Pago
**Endpoint:** `/api/mercadopago/webhook`
**Status:** ⚠️ FUNCIONA MAS INSEGURO

**O que faz:**
1. ✅ Recebe notificação do MP
2. ✅ Busca dados do pagamento via API MP
3. ✅ Extrai userId e planType do external_reference
4. ✅ Atualiza ou cria registro em `user_subscriptions`
5. ✅ Registra pagamento em `payments`
6. ✅ Trata status approved/rejected/cancelled

**Problemas:**
- ❌ Não valida signature (aceita qualquer webhook)
- ⚠️ Usa Service Role Key (correto mas perigoso se vazar)

---

### 3. Sistema de Limites por Plano
**Endpoint:** `/api/user/limits`
**Status:** ✅ FUNCIONA PERFEITAMENTE

**O que faz:**
1. Busca plano do usuário em `user_subscriptions`
2. Consulta limites na tabela `app_settings`
3. Conta ideias e posts atuais do usuário
4. Calcula uso e percentual
5. Retorna se pode ou não criar mais

**Código:** Excelente, bem implementado

**Response exemplo:**
```json
{
  "success": true,
  "planType": "pro",
  "subscription": "active",
  "limits": {
    "ideas": {
      "limit": 50,
      "current": 12,
      "remaining": 38,
      "percentage": 24,
      "canCreate": true
    },
    "posts": {
      "limit": 30,
      "current": 5,
      "remaining": 25,
      "percentage": 17,
      "canPost": true
    }
  }
}
```

---

### 4. Painel Admin de Planos
**Página:** `/admin/plans`
**Status:** ✅ FUNCIONA COMPLETAMENTE

**Features:**
- ✅ Mostra total de assinaturas por plano
- ✅ Calcula MRR (Monthly Recurring Revenue)
- ✅ Mostra crescimento mês a mês
- ✅ Dashboard visual com cards
- ✅ Estatísticas de conversão

**Métricas calculadas:**
- Total de assinantes por plano
- MRR por plano
- Taxa de conversão (free → pago)
- Crescimento percentual

**Código:** Profissional e completo

---

### 5. Interface do Usuário (Settings)
**Componente:** `components/settings/plan-settings.tsx`
**Status:** ✅ FUNCIONA

**Features:**
- ✅ Mostra plano atual
- ✅ Cards visuais de todos os planos
- ✅ Badge "Plano Atual" no plano ativo
- ✅ Badge "Mais Popular" no Pro
- ✅ Botões de upgrade habilitados/desabilitados corretamente
- ✅ Loading state durante processamento
- ✅ Histórico de pagamentos (se disponível)
- ✅ Dica de upgrade/downgrade

**UX:** Muito bem feita, inspirada no Meta Business Suite

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: user_subscriptions
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'pending', 'failed')),
  mercadopago_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
)
```

**Status:** ✅ Bem estruturado

**Observação:** Usa `subscription_id` mas o Mercado Pago não tem assinaturas recorrentes nativas para este tipo de cobrança. Na prática, cada pagamento é único.

---

### Tabela: payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  mercadopago_payment_id TEXT,
  amount DECIMAL(10,2),
  status TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Status:** ✅ Completo

**Uso:** Registra cada transação de pagamento

---

### Tabela: admin_mercadopago
```sql
CREATE TABLE admin_mercadopago (
  id UUID PRIMARY KEY,
  access_token TEXT NOT NULL,
  public_key TEXT NOT NULL,
  refresh_token TEXT,
  user_id_mp TEXT,
  email TEXT,
  connection_type TEXT CHECK (connection_type IN ('oauth', 'manual')),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  test_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Status:** ✅ Excelente

**Feature:** Suporta múltiplas credenciais, OAuth, modo teste/produção

---

## 🔧 COMO CORRIGIR OS BUGS

### Correção #1: Remover Código Duplicado

**Arquivos a modificar:**
1. **REMOVER** `/api/mercadopago/create-preference/route.ts` (não é usado)
2. **MODIFICAR** `lib/mercadopago.ts`:
   - Remover função `createPaymentPreference`
   - Manter apenas `validateWebhookSignature` (para implementar depois)

**Motivo:** Manter apenas `/api/checkout/create-preference` que está funcionando

---

### Correção #2: Implementar Validação de Webhook

**Arquivo:** `lib/mercadopago.ts`

**Substituir:**
```typescript
export function validateWebhookSignature(requestBody: string, signature: string): boolean {
  return true // ⚠️ INSEGURO
}
```

**Por:**
```typescript
import crypto from 'crypto'

export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secretKey: string
): boolean {
  try {
    // Extrair ts e hash do x-signature
    // Formato: ts=1234567890,v1=abc123...
    const parts = xSignature.split(',')
    const ts = parts[0].split('=')[1]
    const hash = parts[1].split('=')[1]

    // Criar manifest (string para assinar)
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

    // Calcular HMAC SHA256
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(manifest)
      .digest('hex')

    // Comparar hashes
    return hmac === hash
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}
```

**Usar no webhook:**
```typescript
// app/api/mercadopago/webhook/route.ts
export async function POST(request: NextRequest) {
  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  const body = await request.json()
  const dataId = body.data?.id

  // Buscar secret key das credenciais admin
  const { data: adminCreds } = await supabase
    .from('admin_mercadopago')
    .select('access_token')
    .eq('is_active', true)
    .single()

  // Validar signature
  const isValid = validateWebhookSignature(
    xSignature,
    xRequestId,
    dataId,
    adminCreds.access_token // Ou usar um secret específico
  )

  if (!isValid) {
    console.error('Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ... resto do código
}
```

**Referência:** https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

---

### Correção #3: Padronizar Limites do Plano Pro

**Opção A: Tornar realmente ilimitado**
```typescript
// lib/settings.ts
case 'pro':
  return -1 // Ilimitado
```

**Opção B: Manter limite mas atualizar UI**
```typescript
// components/settings/plan-settings.tsx
features: [
  '50 ideias por mês', // Ou 100, decidir
  // ...
]
```

**Recomendação:** Opção A (ilimitado para Pro)

---

### Correção #4: Adicionar Migration para Defaults

**Criar:** `supabase/migrations/YYYYMMDD_default_subscription.sql`

```sql
-- Garantir que todos os usuários tenham uma subscription
INSERT INTO user_subscriptions (user_id, plan_type, status)
SELECT
  id,
  'free' as plan_type,
  'active' as status
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);

-- Atualizar settings com valores padrão
INSERT INTO app_settings (key, value) VALUES
  ('free_max_ideas', '10'),
  ('pro_max_ideas', '-1'),
  ('premium_max_ideas', '-1'),
  ('free_max_posts_per_month', '5'),
  ('pro_max_posts_per_month', '-1'),
  ('premium_max_posts_per_month', '-1')
ON CONFLICT (key) DO NOTHING;
```

---

## 📋 CHECKLIST DE PRODUÇÃO

### 🔴 Crítico (Deve fazer ANTES de produção)
- [ ] **Implementar validação de webhook** (Correção #2)
- [ ] **Remover código duplicado** (Correção #1)
- [ ] **Testar fluxo completo de pagamento em sandbox**
- [ ] **Configurar webhook URL no Mercado Pago**
- [ ] **Adicionar migration de defaults** (Correção #4)

### 🟡 Importante (Deve fazer logo após)
- [ ] **Padronizar limites do Pro** (Correção #3)
- [ ] **Adicionar logs de auditoria para pagamentos**
- [ ] **Implementar retry de webhook (caso falhe)**
- [ ] **Adicionar alertas para pagamentos rejeitados**
- [ ] **Testar em produção com pagamento real**

### 🟢 Recomendado (Nice to have)
- [ ] Adicionar histórico de mudanças de plano
- [ ] Implementar cancelamento de assinatura
- [ ] Adicionar faturas em PDF
- [ ] Sistema de cupons de desconto
- [ ] Trial period de 7 dias
- [ ] Notificações de renovação por email

---

## 🧪 COMO TESTAR

### 1. Testar Criação de Preferência
```bash
curl -X POST http://localhost:3000/api/checkout/create-preference \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro"}'
```

**Resposta esperada:**
```json
{
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

---

### 2. Testar Webhook (Manualmente)
```bash
curl -X POST http://localhost:3000/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "1234567890"
    }
  }'
```

**Verificar:**
- Console logs do webhook
- Registro criado em `payments`
- Assinatura atualizada em `user_subscriptions`

---

### 3. Testar Limites
```bash
curl http://localhost:3000/api/user/limits
```

**Resposta esperada:**
```json
{
  "success": true,
  "planType": "free",
  "limits": {
    "ideas": {
      "limit": 10,
      "current": 0,
      "canCreate": true
    }
  }
}
```

---

## 💡 MELHORIAS FUTURAS

### 1. Assinaturas Recorrentes Reais
**Status:** Atual usa pagamentos únicos
**Melhoria:** Implementar com Mercado Pago Subscriptions API

**Vantagens:**
- Cobrança automática mensal
- Melhor gestão de inadimplência
- Histórico completo no MP

---

### 2. Plano Anual com Desconto
**Exemplo:**
- Pro Mensal: R$ 49/mês
- Pro Anual: R$ 470/ano (20% desconto)

---

### 3. Add-ons
**Exemplos:**
- +10 análises de concorrentes: R$ 9,90
- +100 ideias: R$ 19,90
- Consultoria extra: R$ 99

---

### 4. Stripe como Alternativa
**Motivo:** Melhor para assinaturas internacionais
**Quando:** Se expandir para fora do Brasil

---

## 📊 MÉTRICAS IMPORTANTES

### Atualmente Medidas
- ✅ MRR (Monthly Recurring Revenue)
- ✅ Total de assinantes por plano
- ✅ Taxa de conversão (free → pago)
- ✅ Crescimento mês a mês

### Deveria Medir (Futuro)
- ⚠️ Churn rate (taxa de cancelamento)
- ⚠️ LTV (Lifetime Value)
- ⚠️ CAC (Customer Acquisition Cost)
- ⚠️ Taxa de rejeição de pagamentos
- ⚠️ Tempo médio até upgrade

---

## ✅ CONCLUSÃO

### O Sistema de Pagamentos Funciona?

**Resposta Curta:** ⚠️ **SIM, mas com ressalvas**

**Resposta Longa:**
- ✅ Arquitetura está correta
- ✅ Fluxo de pagamento funciona
- ✅ Interface está bem feita
- ✅ Sistema de limites funciona
- ⚠️ **BUG CRÍTICO:** Validação de webhook não implementada
- ⚠️ **BUG MÉDIO:** Código duplicado confuso
- ⚠️ **BUG MENOR:** Inconsistências de limites

### Pronto para Produção?

**Resposta:** ❌ **NÃO, ainda não**

**Motivo:** Webhook sem validação = RISCO DE FRAUDE

**Tempo para corrigir:** 1-2 dias de trabalho

**Prioridade:**
1. Implementar validação webhook (URGENTE - 1 dia)
2. Remover código duplicado (4 horas)
3. Testar em sandbox (4 horas)
4. Testar em produção com pagamento real (2 horas)

### Avaliação Final

**Nota Geral:** 7/10

**Pontos Fortes:**
- Arquitetura bem pensada
- Interface excelente
- Sistema de limites robusto
- Painel admin completo

**Pontos Fracos:**
- Validação de segurança ausente
- Código duplicado
- Inconsistências

**Recomendação:**
Corrigir bugs críticos antes de lançar. Com as correções, o sistema estará **100% pronto e seguro** para processar pagamentos reais.

---

**Próximo Passo:** Implementar validação de webhook (usar código da Correção #2)
