# Correção: Limite de Cron Jobs na Vercel

## Problema Identificado

**Erro no Deploy:**
```
Error: Your plan allows your team to create up to 2 Cron Jobs.
Your team currently has 2, and this project is attempting to create 2 more,
exceeding your team's limit.
```

## Causa

- Plano Vercel Hobby (gratuito) permite **máximo 2 cron jobs no total** (não por projeto)
- Você já tinha 2 cron jobs em outros projetos
- Leadgram estava tentando adicionar mais 2 (sync-instagram + refresh-tokens)
- Total: 4 cron jobs → **Excede o limite**

## Solução Implementada ✅

### Unificação dos Cron Jobs

Mesclamos os 2 cron jobs do Leadgram em **1 único endpoint**:

**ANTES:**
- `/api/cron/sync-instagram` - Executa ao meio-dia (12:00 UTC)
- `/api/cron/refresh-tokens` - Executa às 3h da manhã (03:00 UTC)

**DEPOIS:**
- `/api/cron/daily-tasks` - Executa **ambas as tarefas** às 3h da manhã (03:00 UTC)

### Mudanças Realizadas

1. **Novo endpoint criado:** `app/api/cron/daily-tasks/route.ts`
   - Executa renovação de tokens Instagram (Task 1)
   - Executa sincronização de posts Instagram (Task 2)
   - Retorna métricas de execução (sucessos/erros)
   - Protegido com autenticação via `CRON_SECRET`

2. **`vercel.json` atualizado:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/daily-tasks",
         "schedule": "0 3 * * *"
       }
     ]
   }
   ```

3. **Arquivos antigos mantidos** (para backup):
   - `app/api/cron/sync-instagram/route.ts` _(não usado)_
   - `app/api/cron/refresh-tokens/route.ts` _(não usado)_

## Próximas Etapas

### ⚠️ IMPORTANTE: Verificar Cron Jobs em Outros Projetos

Você ainda precisa de **1 slot livre** para o Leadgram:

1. **Acesse o Dashboard da Vercel:** https://vercel.com/dashboard
2. **Verifique seus projetos** e encontre quais têm cron jobs ativos
3. **Escolha uma das opções:**

   **Opção A - Deletar Cron Jobs Não Utilizados** (Recomendado)
   - Se os 2 cron jobs em outros projetos não são mais necessários, delete-os
   - Isso libera espaço para o 1 cron job do Leadgram
   - Total: 1 cron job ativo

   **Opção B - Deletar Apenas 1 Cron Job**
   - Delete 1 cron job de outro projeto
   - Total: 1 (outro projeto) + 1 (Leadgram) = 2 cron jobs ✅

   **Opção C - Fazer Upgrade** (Não recomendado para produção gratuita)
   - Upgrade para Vercel Pro ($20/mês)
   - Cron jobs ilimitados

### Configuração na Vercel

1. **Adicione a variável de ambiente `CRON_SECRET`:**
   - Acesse: Projeto → Settings → Environment Variables
   - Nome: `CRON_SECRET`
   - Valor: Gere um secret seguro (ex: `openssl rand -base64 32`)
   - Selecione: Production, Preview, Development

2. **Faça o Deploy:**
   ```bash
   git add .
   git commit -m "fix: Merge cron jobs to respect Vercel Hobby plan limit (2 max)"
   git push origin main
   ```

3. **Verifique o Deploy:**
   - O build deve completar com sucesso
   - Verifique em "Deployment Details" que apenas 1 cron job foi criado

## Benefícios da Solução

✅ **Gratuito** - Permanece no plano Hobby da Vercel
✅ **Eficiente** - Ambas tarefas executam juntas (menos overhead)
✅ **Lógico** - Tokens são renovados antes do sync de posts
✅ **Escalável** - Fácil adicionar novas tarefas diárias ao endpoint
✅ **Protegido** - Autenticação via `CRON_SECRET` previne acesso não autorizado

## Logs e Monitoramento

Para verificar a execução dos cron jobs:

1. **Vercel Dashboard** → Projeto → Deployments → Function Logs
2. Procure por `[CRON]` nos logs
3. Métricas retornadas:
   ```json
   {
     "tokensRefreshed": 5,
     "tokenErrors": 0,
     "instagramSynced": 5,
     "instagramErrors": 0,
     "timestamp": "2025-11-18T03:00:00.000Z"
   }
   ```

## Testes Locais

Para testar o endpoint unificado localmente:

```bash
# Configure o CRON_SECRET no .env.local primeiro
curl -X GET http://localhost:3000/api/cron/daily-tasks \
  -H "Authorization: Bearer SEU_CRON_SECRET_AQUI"
```

## Alternativas Futuras (Opcional)

Se precisar de mais cron jobs no futuro sem custo:

1. **Upstash QStash** (Free tier: 500 requests/dia)
2. **GitHub Actions** (Free tier: ilimitado para repos públicos)
3. **Cloudflare Workers Cron Triggers** (Free tier: 100k requests/dia)
4. **External CRON-job.org** (Grátis, mas menos confiável)

---

**Status:** ✅ Correção implementada - Aguardando remoção de cron jobs de outros projetos e deploy
