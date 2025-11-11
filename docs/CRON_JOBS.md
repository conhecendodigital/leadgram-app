# 🤖 Cron Jobs - Automação do Leadgram

Este documento explica os cron jobs implementados para sincronização e manutenção automática.

---

## 📋 Cron Jobs Configurados

### 1. **Sincronização de Instagram** (`/api/cron/sync-instagram`)

**Frequência**: A cada 6 horas
**Schedule**: `0 */6 * * *` (00:00, 06:00, 12:00, 18:00 UTC)

**O que faz:**
- Busca todas as contas Instagram ativas
- Sincroniza últimos 50 posts de cada conta
- Atualiza curtidas e comentários de posts existentes
- Insere novos posts no banco
- Atualiza `last_sync_at` de cada conta

**Quando é útil:**
- Mantém métricas atualizadas automaticamente
- Usuários não precisam clicar em "Sincronizar" manualmente
- Dashboard sempre mostra dados recentes

---

### 2. **Renovação de Tokens** (`/api/cron/refresh-tokens`)

**Frequência**: Diariamente
**Schedule**: `0 2 * * *` (02:00 UTC / 23:00 BRT)

**O que faz:**
- Busca contas com tokens expirando em menos de 30 dias
- Verifica se token ainda é válido
- Desativa contas com token inválido
- Atualiza data de expiração para tokens válidos

**Quando é útil:**
- Detecta tokens expirados antes que falhem
- Notifica usuário para reconectar se necessário
- Mantém contas ativas funcionando

**Nota**: Page Access Tokens (que usamos) não expiram, mas verificamos validade mesmo assim.

---

## 🔐 Configuração no Vercel

### Passo 1: Gerar CRON_SECRET

```bash
# Gerar uma string aleatória segura
openssl rand -base64 32
# Ou use: https://generate-secret.vercel.app/32
```

### Passo 2: Adicionar Variáveis de Ambiente

No Vercel Dashboard → Settings → Environment Variables:

```
CRON_SECRET=sua_string_aleatoria_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### Passo 3: Verificar Configuração

O arquivo `vercel.json` já está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-instagram",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Passo 4: Deploy

```bash
git push
# Vercel faz deploy automático e ativa os crons
```

---

## 📊 Monitoramento

### Ver Logs no Vercel

1. Acesse: https://vercel.com/conhecendodigital/leadgram-app
2. Vá em **Logs**
3. Filtro por: "CRON"
4. Você verá:
   ```
   🤖 [CRON] Iniciando sincronização automática de Instagram
   📊 [CRON] Encontradas 5 contas ativas
   🔄 [CRON] Sincronizando @usuario1...
   ✅ [CRON] @usuario1: 3 novos, 15 atualizados
   ...
   ```

### Ver Execuções

1. Vercel Dashboard → Cron Jobs
2. Mostra:
   - Última execução
   - Status (success/error)
   - Duração
   - Logs

---

## 🧪 Testar Manualmente

### Via Vercel Dashboard

1. Vá em **Cron Jobs**
2. Clique em "..." do cron desejado
3. Clique em **"Trigger Now"**
4. Aguarde execução
5. Verifique logs

### Via cURL (Desenvolvimento)

```bash
# Sincronização
curl -X GET \
  http://localhost:3000/api/cron/sync-instagram \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Renovação de tokens
curl -X GET \
  http://localhost:3000/api/cron/refresh-tokens \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 📈 Exemplo de Resposta

### Sincronização bem-sucedida

```json
{
  "success": true,
  "timestamp": "2025-01-11T15:30:00.000Z",
  "total_accounts": 5,
  "accounts_synced": 5,
  "new_posts": 12,
  "updated_posts": 73
}
```

### Renovação de tokens

```json
{
  "success": true,
  "timestamp": "2025-01-11T02:00:00.000Z",
  "total_accounts_checked": 3,
  "tokens_renewed": 2,
  "errors": [
    {
      "username": "usuario_inativo",
      "error": "Token inválido - conta desativada. Usuário precisa reconectar."
    }
  ]
}
```

---

## 🔔 Notificações de Erro

Quando um token expira ou falha:
1. Conta é marcada como `is_active = false`
2. Sistema para de tentar sincronizar
3. **TODO**: Enviar notificação ao usuário para reconectar

---

## ⚙️ Schedules Explicados

### Formato Cron

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── dia do mês (1 - 31)
│ │ │ ┌───────────── mês (1 - 12)
│ │ │ │ ┌───────────── dia da semana (0 - 6) (0 = Domingo)
│ │ │ │ │
* * * * *
```

### Nossas Configurações

**Sincronização**: `0 */6 * * *`
- `0` = minuto 0
- `*/6` = a cada 6 horas
- `*` = todos os dias
- `*` = todos os meses
- `*` = todos os dias da semana

**Renovação**: `0 2 * * *`
- `0` = minuto 0
- `2` = hora 2 (02:00 UTC)
- `*` = todos os dias
- `*` = todos os meses
- `*` = todos os dias da semana

---

## 🚀 Escalabilidade

### Limites

Vercel Free Tier:
- Máximo 1 execução simultânea
- Timeout de 10 segundos (Free) / 60 segundos (Pro)
- Rate limiting se executar muito

### Otimizações Implementadas

1. **Processamento em lote**
   - Processa todas as contas em uma execução
   - Mais eficiente que crons separados por conta

2. **Error handling robusto**
   - Erros em uma conta não afetam outras
   - Logs detalhados para debug

3. **Bypass RLS**
   - Usa Service Role Key
   - Não depende de sessão de usuário

---

## 🐛 Troubleshooting

### Cron não está executando

**Verifique:**
1. `CRON_SECRET` configurado na Vercel?
2. Deploy foi feito após adicionar `vercel.json`?
3. Plano da Vercel suporta cron jobs?

### Erro "Unauthorized"

**Solução:**
- Verifique se `CRON_SECRET` está igual no código e na Vercel

### Cron executa mas nada sincroniza

**Verifique:**
1. Existem contas ativas no banco?
2. Tokens ainda válidos?
3. Logs da execução mostram algum erro?

### Performance lenta

**Se tiver muitas contas (>100):**
- Considere dividir em múltiplos crons
- Ou processar em chunks menores
- Aumentar timeout (Vercel Pro)

---

## 📚 Referências

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Cron Schedule Syntax](https://crontab.guru/)

---

**Última atualização**: 2025-01-11
**Autor**: Claude Code + Guilherme
