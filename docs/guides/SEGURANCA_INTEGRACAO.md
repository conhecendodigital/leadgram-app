# 🔒 Sistema de Segurança - Integração Completa

Este documento descreve a integração completa do sistema de segurança do Leadgram, incluindo autenticação, rate limiting, bloqueio de IPs, e auditoria.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Como Usar](#como-usar)
- [Configuração](#configuração)
- [Cron Jobs](#cron-jobs)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de segurança implementa **6 funcionalidades principais**:

1. ✅ **Autenticação 2FA** - TOTP com QR codes e backup codes
2. ✅ **Registro de Login Attempts** - Todas tentativas registradas
3. ✅ **Bloqueio Automático de IPs** - Após tentativas falhas
4. ✅ **Sessões Ativas** - Rastreamento de sessões por dispositivo
5. ✅ **Audit Logs** - Log de todas ações administrativas
6. ✅ **Rate Limiting** - Proteção contra brute force

---

## ⚙️ Funcionalidades

### 1. Rate Limiting

**Proteção:** Limita requisições por IP ou usuário em janela de tempo.

**Configuração padrão:**
- Login: 5 tentativas por minuto
- APIs gerais: Configurável por endpoint

**Como funciona:**
```typescript
const rateLimitCheck = await rateLimit({
  max: 5,              // Máximo de requisições
  windowSeconds: 60,   // Janela de tempo (segundos)
  message: 'Aguarde...' // Mensagem customizada
});

if (rateLimitCheck.limited) {
  return rateLimitCheck.response; // 429 Too Many Requests
}
```

### 2. Bloqueio Automático de IP

**Proteção:** Bloqueia IPs após múltiplas tentativas falhas.

**Fluxo:**
1. Usuário erra senha → Registra tentativa falha
2. Após X tentativas (padrão: 5) em Y minutos (padrão: 15) → IP bloqueado
3. IP bloqueado por Z minutos (padrão: 15)
4. Após Z minutos → Cron job desbloqueia automaticamente

**Configuração:**
- Acesse `/admin/settings` → Segurança → General
- Ajuste `max_login_attempts` e `lockout_duration`

### 3. Registro de Tentativas de Login

**Rastreamento:** Todas tentativas (sucesso e falha) são registradas.

**Informações capturadas:**
- Email
- IP address
- User Agent (browser, device, OS)
- Localização (país, cidade) - se disponível
- Sucesso/Falha
- Motivo da falha
- Timestamp

**Visualização:** `/admin/settings` → Segurança → Access

### 4. Sessões Ativas

**Rastreamento:** Todas sessões ativas dos usuários.

**Informações:**
- Dispositivo (desktop, mobile, tablet)
- Browser (Chrome, Safari, Firefox, etc)
- Sistema Operacional
- IP e localização
- Última atividade
- Data de criação

**Ações:**
- Terminar sessão individual
- Terminar todas as outras sessões

**Visualização:** `/admin/settings` → Segurança → Sessions

### 5. Logs de Auditoria

**Registro:** Todas ações administrativas importantes.

**Ações registradas:**
- Login/Logout
- Alterações de configurações
- Criação/edição/exclusão de recursos
- Bloqueio/desbloqueio de IPs
- Terminação de sessões

**Visualização:** `/admin/settings` → Segurança → Audit

### 6. Autenticação 2FA

**Proteção:** Camada extra de segurança com TOTP.

**Funcionalidades:**
- Geração de QR Code para apps autenticadores
- 10 backup codes (uso único)
- Ativação/desativação via interface
- Verificação em 6 dígitos

**Como ativar:** `/admin/settings` → Segurança → General → Ativar 2FA

---

## 🏗️ Arquitetura

### Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    API ROUTE                             │
│  /api/auth/login                                         │
│                                                           │
│  1. Rate Limiting ────► rateLimit()                      │
│  2. Security Check ───► securityMiddleware()             │
│  3. Authentication ───► supabase.auth.signInWithPassword │
│  4. Success ──────────► recordSuccessfulLogin()          │
│  5. Failure ──────────► recordFailedLogin()              │
└─────────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐
│ SecurityService  │    │ Supabase Database    │
│                  │    │                      │
│ - recordLogin    │◄───┤ login_attempts       │
│ - blockIP        │◄───┤ blocked_ips          │
│ - createSession  │◄───┤ active_sessions      │
│ - logAction      │◄───┤ audit_logs           │
└──────────────────┘    └──────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Cron Jobs     │
                        │                 │
                        │ • Cleanup (1h)  │
                        │ • Unblock (5m)  │
                        └─────────────────┘
```

### Fluxo de Login com Segurança

```
┌───────────┐
│  Cliente  │
└─────┬─────┘
      │ POST /api/auth/login
      ▼
┌─────────────────────────────────────────┐
│ 1. RATE LIMITING                        │
│    • Max 5 req/min                      │
│    • Se exceder → 429 Too Many Requests │
└─────┬───────────────────────────────────┘
      │ OK
      ▼
┌─────────────────────────────────────────┐
│ 2. VERIFICAR IP BLOQUEADO               │
│    • Consulta blocked_ips               │
│    • Se bloqueado → 429 IP Blocked      │
└─────┬───────────────────────────────────┘
      │ OK
      ▼
┌─────────────────────────────────────────┐
│ 3. AUTENTICAÇÃO SUPABASE                │
│    • signInWithPassword()               │
└─────┬────────────────┬──────────────────┘
      │ Sucesso        │ Falha
      ▼                ▼
┌───────────────┐   ┌──────────────────────┐
│ 4. SUCESSO    │   │ 5. FALHA             │
│               │   │                      │
│ • Registra    │   │ • Registra tentativa │
│ • Cria sessão │   │ • Conta falhas       │
│ • Log audit   │   │ • Se >= 5 → Bloqueia │
│ • Return 200  │   │ • Return 401/429     │
└───────────────┘   └──────────────────────┘
```

---

## 🚀 Como Usar

### Integrar em uma API Route

```typescript
import { rateLimit } from '@/lib/middleware/rate-limit';
import { securityMiddleware, recordFailedLogin } from '@/lib/middleware/security-middleware';

export async function POST(request: Request) {
  // 1. Rate limiting
  const rateLimitCheck = await rateLimit({ max: 10, windowSeconds: 60 });
  if (rateLimitCheck.limited) return rateLimitCheck.response;

  // 2. Verificar IP bloqueado
  const securityCheck = await securityMiddleware(email);
  if (securityCheck.blocked) return securityCheck.response;

  // 3. Sua lógica aqui...
}
```

### Registrar Ação de Auditoria

```typescript
import { SecurityService } from '@/lib/services/security-service';
import { createServerClient } from '@/lib/supabase/server';

const supabase = await createServerClient();
const securityService = new SecurityService(supabase);

await securityService.logAction(
  'delete_user',      // Ação
  'users',            // Tipo de recurso
  userId,             // ID do recurso
  'Usuário excluído'  // Descrição
);
```

### Criar Sessão Manualmente

```typescript
await securityService.createSession(
  userId,
  sessionToken,
  ipAddress,
  userAgent,
  deviceType,
  browser,
  os,
  country,
  city
);
```

---

## ⚙️ Configuração

### Ajustar Configurações de Segurança

1. Acesse: `/admin/settings` → **Segurança** → **General**
2. Ajuste:
   - **2FA obrigatório para admins:** `require_2fa_admin`
   - **Máximo de tentativas:** `max_login_attempts` (padrão: 5)
   - **Duração do bloqueio:** `lockout_duration` (minutos, padrão: 15)
   - **Habilitar audit log:** `enable_audit_log`

### Configurações Disponíveis

| Campo                  | Tipo    | Padrão | Descrição                        |
|------------------------|---------|--------|----------------------------------|
| `require_2fa_admin`    | boolean | false  | 2FA obrigatório para admins      |
| `max_login_attempts`   | integer | 5      | Tentativas antes de bloquear     |
| `lockout_duration`     | integer | 15     | Minutos de bloqueio              |
| `enable_audit_log`     | boolean | true   | Habilitar logs de auditoria      |

---

## ⏰ Cron Jobs

O sistema usa **pg_cron** para executar tarefas automáticas.

### Jobs Configurados

| Job                          | Frequência      | Descrição                             |
|------------------------------|-----------------|---------------------------------------|
| `cleanup-expired-sessions`   | A cada 1 hora   | Remove sessões expiradas/inativas     |
| `unblock-expired-ips`        | A cada 5 minutos| Desbloqueia IPs temporários           |
| `cleanup-old-login-attempts` | Diariamente     | Remove tentativas > 30 dias           |
| `cleanup-old-audit-logs`     | Semanalmente    | Remove logs de auditoria > 90 dias    |

### Verificar Cron Jobs

Execute no SQL Editor do Supabase:

```sql
-- Ver jobs ativos
SELECT * FROM cron.job;

-- Ver logs de execução
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 100;

-- Desabilitar um job
SELECT cron.unschedule('nome-do-job');
```

### Executar Manualmente

```sql
-- Limpar sessões
SELECT cleanup_expired_sessions();

-- Desbloquear IPs
SELECT unblock_expired_ips();
```

---

## 🔍 Troubleshooting

### Problema: Cron jobs não executam

**Causa:** Extensão `pg_cron` não habilitada no Supabase.

**Solução:**
1. Acesse Supabase Dashboard → Database → Extensions
2. Procure por `pg_cron` e habilite
3. Execute a migration: `20250107020000_security_cron_jobs.sql`

### Problema: IPs não desbloqueiam automaticamente

**Verificar:**
```sql
-- Ver cron job de unblock
SELECT * FROM cron.job WHERE jobname = 'unblock-expired-ips';

-- Ver IPs bloqueados
SELECT * FROM blocked_ips WHERE blocked_until < NOW();

-- Desbloquear manualmente
SELECT unblock_expired_ips();
```

### Problema: Sessões não são registradas

**Causa:** Middleware não integrado no sistema de login.

**Solução:** Usar a API `/api/auth/login` ao invés do método direto do Supabase.

### Problema: Rate limiting muito restritivo

**Ajuste:** Modifique os parâmetros na API route:

```typescript
const rateLimitCheck = await rateLimit({
  max: 10,            // Aumentar limite
  windowSeconds: 120  // Aumentar janela
});
```

---

## 📊 Monitoramento

### Métricas Disponíveis

Acesse `/admin/settings` → Segurança para ver:

- Total de tentativas de login (últimas 24h)
- Taxa de sucesso/falha
- IPs atualmente bloqueados
- Sessões ativas
- Logs de auditoria recentes

### Alertas Recomendados

1. **Muitas tentativas falhas:** > 50 em 1 hora
2. **IPs bloqueados:** > 10 simultâneos
3. **Sessões suspeitas:** Múltiplos países/dispositivos
4. **Ações críticas:** Exclusões, alterações de permissões

---

## 🎓 Boas Práticas

1. ✅ **Revisar logs semanalmente** - Audit logs e login attempts
2. ✅ **Habilitar 2FA para admins** - Configuração obrigatória
3. ✅ **Monitorar IPs bloqueados** - Investigar bloqueios frequentes
4. ✅ **Ajustar rate limiting** - Conforme padrão de uso
5. ✅ **Limpar dados antigos** - Manter performance do banco
6. ✅ **Backup dos backup codes** - Guardar em local seguro

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este documento
2. Verifique os logs no Supabase Dashboard
3. Execute queries de diagnóstico (acima)
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** 2025-01-07
**Versão:** 1.0.0
