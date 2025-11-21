# 🚀 Configuração do Upstash Redis (Rate Limiting)

## Por que Upstash Redis?

O Upstash Redis é necessário para implementar **rate limiting** (limite de requisições) nas rotas críticas da API, prevenindo abuso e ataques DDoS.

**Benefícios:**
- ✅ Tier **GRATUITO** - 10.000 comandos/dia
- ✅ Serverless (funciona perfeitamente com Vercel)
- ✅ Setup em 5 minutos
- ✅ REST API (não precisa de conexão TCP)

---

## 📋 Passo a Passo

### 1. Criar Conta no Upstash

1. Acesse: https://upstash.com
2. Clique em **Sign Up** (pode usar conta do GitHub)
3. Confirme seu email

### 2. Criar Database Redis

1. No dashboard, clique em **Create Database**
2. Preencha:
   - **Name:** `leadgram-rate-limit` (ou qualquer nome)
   - **Type:** Regional
   - **Region:** Escolha a região mais próxima (ex: `us-east-1` ou `sa-east-1` para Brasil)
   - **Primary Region:** Qualquer
   - **TLS:** Enabled ✅
3. Clique em **Create**

### 3. Copiar Credenciais

1. Após criar, você verá a página do database
2. Role até a seção **REST API**
3. Copie:
   - **UPSTASH_REDIS_REST_URL** (ex: `https://us1-xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (ex: `AXXXxxx...`)

### 4. Adicionar no .env.local

Abra o arquivo `.env.local` e substitua os valores:

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://sua-url-aqui.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu-token-aqui
```

### 5. Adicionar no Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Entre no projeto **leadgram-app**
3. Vá em **Settings** → **Environment Variables**
4. Adicione as mesmas variáveis:
   - **UPSTASH_REDIS_REST_URL**: Cole a URL
   - **UPSTASH_REDIS_REST_TOKEN**: Cole o token
5. Marque todos os ambientes: Production, Preview, Development
6. Clique em **Save**

### 6. Reiniciar Servidor Local

Se estiver rodando o servidor, reinicie para carregar as novas env vars:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

---

## ✅ Verificar se Funciona

### Teste Local

1. Faça uma requisição para qualquer rota protegida (ex: criar ideia)
2. Verifique os headers da resposta (use DevTools):
   ```
   X-RateLimit-Limit: 20
   X-RateLimit-Remaining: 19
   X-RateLimit-Reset: 2025-11-18T...
   ```
3. Se os headers aparecerem, **funcionou!** ✅

### Teste de Limite Excedido

1. Faça 21 requisições rápidas para `/api/ideas` (POST)
2. A 21ª requisição deve retornar:
   ```json
   {
     "error": "Too many requests",
     "message": "Você excedeu o limite de requisições...",
     "retryAfter": 60
   }
   ```
3. Status code: **429 Too Many Requests**

---

## 📊 Limites por Rota

As seguintes rotas estão protegidas:

| Rota | Limite | Janela | Motivo |
|------|--------|--------|--------|
| `/api/instagram/search` | 10 req/min | 60s | Economizar RapidAPI |
| `/api/instagram/sync` | 5 req/min | 60s | Operação pesada |
| `/api/google-drive/upload` | 10 req/min | 60s | Prevenir abuso |
| `/api/ideas` (POST) | 20 req/min | 60s | Criar ideias |
| `/api/checkout/create-preference` | 5 req/min | 60s | Prevenir fraude |

---

## 🔧 Modo de Desenvolvimento (Sem Redis)

Se você **não configurar** o Upstash, o rate limiting será **desabilitado automaticamente** em desenvolvimento.

Você verá este aviso nos logs:
```
⚠️ Rate limiting disabled - Upstash Redis not configured
```

**Isso é OK em desenvolvimento**, mas **OBRIGATÓRIO em produção**.

---

## 💰 Limites do Tier Gratuito

- **10.000 comandos/dia** (mais que suficiente para começar)
- **256 MB de armazenamento**
- **1 database**

**Quando crescer (100+ usuários ativos):**
- Upstash Pro: $10/mês (comandos ilimitados)

---

## 🐛 Troubleshooting

### Erro: "fetch failed" ou "connection refused"

**Causa:** URL ou Token incorretos

**Solução:**
1. Verifique se copiou corretamente (sem espaços)
2. Verifique se está usando REST API (não TCP)
3. Confirme que o database está **Active** no Upstash

### Headers X-RateLimit não aparecem

**Causa:** Rate limiting não está ativo

**Solução:**
1. Reinicie o servidor local
2. Verifique as env vars: `console.log(process.env.UPSTASH_REDIS_REST_URL)`
3. Confirme que a rota está usando `withRateLimit`

### Rate limiting não bloqueia requisições

**Causa:** Identificador inconsistente

**Solução:**
- Em desenvolvimento: Use usuário autenticado (não IP)
- Em produção: Vercel deve passar `x-forwarded-for` header

---

## 📞 Recursos

- **Upstash Dashboard:** https://console.upstash.com
- **Documentação:** https://upstash.com/docs/redis
- **Pricing:** https://upstash.com/pricing

---

**Criado em:** 18/11/2025
**Última atualização:** 18/11/2025
