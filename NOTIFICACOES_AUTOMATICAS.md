# Sistema de Notificações Automáticas

Sistema completo de notificações em tempo real com captura automática de eventos e rastreamento de erros.

## 📋 Visão Geral

O sistema detecta automaticamente 4 tipos de eventos e cria notificações:
1. **Novos Usuários** - Quando alguém se registra
2. **Novos Pagamentos** - Quando há pagamento completado
3. **Cancelamentos** - Quando usuário cancela assinatura
4. **Erros Críticos** - Quando ocorrem erros críticos no sistema

## 🏗️ Arquitetura

### 1. Triggers do Banco de Dados (Automático)
Os triggers capturam eventos em tempo real:

```sql
-- Trigger: Novo Usuário
auth.users (INSERT) → notify_new_user() → admin_notifications

-- Trigger: Pagamento
payments (INSERT/UPDATE) → notify_new_payment() → admin_notifications

-- Trigger: Cancelamento
user_subscriptions (UPDATE) → notify_cancellation() → admin_notifications

-- Trigger: Erro Crítico
error_logs (INSERT) → notify_critical_error() → admin_notifications
```

### 2. Tabelas do Banco

#### `error_logs`
Registro de todos os erros do sistema:
- `severity`: info | warning | error | critical
- `error_type`: Tipo do erro
- `error_message`: Mensagem
- `stack_trace`: Stack trace completo
- `url`: URL onde ocorreu
- `user_id`: Usuário (se aplicável)
- `metadata`: Dados adicionais (JSON)

#### `admin_notifications`
Notificações para o admin (já existente):
- `type`: new_user | payment | cancellation | system_error
- `title`: Título da notificação
- `message`: Mensagem descritiva
- `is_read`: Status de leitura
- `user_id`: Usuário relacionado
- `link`: Link para ação
- `metadata`: Dados extras (JSON)

#### `admin_notification_settings`
Configurações de notificações (já existente):
- `notify_new_users`: Ativar/desativar
- `notify_payments`: Ativar/desativar
- `notify_cancellations`: Ativar/desativar
- `notify_system_errors`: Ativar/desativar
- `email_on_errors`: Enviar email em erros
- `admin_email`: Email do admin

### 3. Serviços TypeScript

#### `errorTracking` (`lib/services/error-tracking-service.ts`)
Serviço para registrar erros:

```typescript
// Registrar erro crítico (cria notificação via trigger)
await errorTracking.logCriticalError(error, 'Contexto');

// Registrar erro comum
await errorTracking.logError(error, 'error');

// Registrar warning
await errorTracking.logWarning('Mensagem', { dados: 'extras' });

// Registrar info
await errorTracking.logInfo('Mensagem', { dados: 'extras' });
```

#### `notificationService` (`lib/services/notification-service.ts`)
Métodos convenientes (uso opcional - triggers já fazem automaticamente):

```typescript
// Criar notificação manualmente (se necessário)
await notificationService.notifyNewUser(userId, email);
await notificationService.notifyPayment(userId, amount, plan);
await notificationService.notifyCancellation(userId, plan);
await notificationService.notifyError(message, type);
```

## 🎯 Componentes

### Error Boundary Global
Captura erros não tratados em React:
- Localização: `components/error-boundary.tsx`
- Integrado em: `app/layout.tsx`
- Ação: Registra erro crítico automaticamente

### API Error Handler
Handler para erros em API routes:

```typescript
import { handleApiError } from '@/lib/utils/api-error-handler';

export async function GET() {
  try {
    // código da API
  } catch (error) {
    return handleApiError(error, 'Nome da API');
  }
}
```

## 🧪 Como Testar

### Via API (Recomendado)
Use a API de testes para simular cada tipo de notificação:

```bash
# Testar novo usuário
POST /api/admin/test-notifications
{ "type": "new_user" }

# Testar pagamento
POST /api/admin/test-notifications
{ "type": "payment" }

# Testar cancelamento
POST /api/admin/test-notifications
{ "type": "cancellation" }

# Testar erro crítico
POST /api/admin/test-notifications
{ "type": "error" }

# Testar warning (não cria notificação)
POST /api/admin/test-notifications
{ "type": "error_warning" }

# Testar info (não cria notificação)
POST /api/admin/test-notifications
{ "type": "error_info" }
```

### Via Banco de Dados (Direto)
Execute no Supabase SQL Editor:

```sql
-- Simular novo usuário (precisa criar usuário real)
-- Acontece automaticamente no registro

-- Simular pagamento
INSERT INTO payments (user_id, amount, status, payment_method)
VALUES ('user-uuid-aqui', 99.90, 'completed', 'credit_card');

-- Simular cancelamento
UPDATE user_subscriptions
SET status = 'cancelled'
WHERE user_id = 'user-uuid-aqui';

-- Simular erro crítico
INSERT INTO error_logs (error_type, error_message, severity)
VALUES ('TestError', 'Erro de teste manual', 'critical');
```

### Via Interface Admin
1. Acesse **Configurações → Notificações**
2. Ative/desative cada tipo de notificação
3. Faça ações reais no sistema (criar usuário, simular pagamento, etc.)

## 📊 Monitoramento

### Ver Logs de Erros
```typescript
import { errorTracking } from '@/lib/services/error-tracking-service';

// Buscar últimos 50 erros
const logs = await errorTracking.getLogs(50);

// Buscar apenas críticos
const critical = await errorTracking.getLogs(50, 'critical');
```

### Limpar Logs Antigos
```typescript
// Remover logs com mais de 90 dias
const removed = await errorTracking.cleanupOldLogs(90);
```

## ⚙️ Configuração

### Aplicar Migration
```bash
# Via Supabase CLI
supabase db reset

# Ou aplicar apenas a nova migration
supabase migration up
```

### Verificar Triggers
```sql
-- Ver triggers criados
SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';

-- Ver funções criadas
SELECT * FROM pg_proc WHERE proname LIKE '%notify%';
```

## 🔄 Fluxo Completo

### Exemplo: Novo Usuário
1. Usuário se registra via interface
2. Supabase Auth cria registro em `auth.users`
3. Trigger `on_user_created` dispara
4. Função `notify_new_user()` executa
5. Verifica se `notify_new_users` está ativo
6. Insere registro em `admin_notifications`
7. Admin vê notificação em tempo real

### Exemplo: Erro Crítico
1. Erro ocorre na aplicação
2. Error Boundary ou API handler captura
3. Chama `errorTracking.logCriticalError()`
4. Insere registro em `error_logs` com `severity='critical'`
5. Trigger `on_critical_error` dispara
6. Função `notify_critical_error()` executa
7. Verifica se `notify_system_errors` está ativo
8. Insere registro em `admin_notifications`
9. Admin vê notificação do erro

## 📝 Adicionar Novos Tipos de Notificação

### 1. Adicionar Tipo ao Banco
```sql
-- Alterar constraint da tabela admin_notifications
ALTER TABLE admin_notifications
DROP CONSTRAINT admin_notifications_type_check;

ALTER TABLE admin_notifications
ADD CONSTRAINT admin_notifications_type_check
CHECK (type IN ('new_user', 'payment', 'cancellation', 'system_error', 'novo_tipo'));
```

### 2. Adicionar Campo nas Settings (se necessário)
```sql
ALTER TABLE admin_notification_settings
ADD COLUMN notify_novo_tipo BOOLEAN DEFAULT true;
```

### 3. Criar Trigger
```sql
CREATE OR REPLACE FUNCTION notify_novo_tipo()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
BEGIN
  SELECT notify_novo_tipo INTO settings_enabled
  FROM admin_notification_settings
  LIMIT 1;

  IF settings_enabled THEN
    INSERT INTO admin_notifications (type, title, message)
    VALUES ('novo_tipo', 'Título', 'Mensagem');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_novo_evento
  AFTER INSERT ON tabela_alvo
  FOR EACH ROW
  EXECUTE FUNCTION notify_novo_tipo();
```

### 4. Atualizar Types TypeScript
```typescript
// lib/types/notifications.ts
export type NotificationType =
  | 'new_user'
  | 'payment'
  | 'cancellation'
  | 'system_error'
  | 'novo_tipo'; // <-- adicionar aqui
```

## 🚨 Importante

1. **Triggers são automáticos** - Não precisa chamar manualmente
2. **Respeita configurações** - Verifica `admin_notification_settings`
3. **Severidade de erros**:
   - `critical` → Cria notificação
   - `error` → Apenas registra
   - `warning` → Apenas registra
   - `info` → Apenas registra
4. **Performance** - Triggers são rápidos, executam em poucos ms
5. **Segurança** - Todas as tabelas têm RLS ativado

## 🐛 Troubleshooting

### Notificações não aparecem
1. Verificar se trigger existe: `SELECT * FROM pg_trigger`
2. Verificar configurações: `SELECT * FROM admin_notification_settings`
3. Verificar RLS policies: `SELECT * FROM pg_policies`

### Erros não são registrados
1. Verificar se tabela `error_logs` existe
2. Verificar se ErrorBoundary está no layout
3. Verificar console do navegador para erros

### Trigger não dispara
1. Verificar se função existe: `SELECT * FROM pg_proc`
2. Testar função manualmente via SQL
3. Verificar logs do Supabase

## 📚 Referências

- Migration: `supabase/migrations/20250107000000_notification_triggers.sql`
- Error Tracking: `lib/services/error-tracking-service.ts`
- Notification Service: `lib/services/notification-service.ts`
- Error Boundary: `components/error-boundary.tsx`
- API Handler: `lib/utils/api-error-handler.ts`
- API de Testes: `app/api/admin/test-notifications/route.ts`
