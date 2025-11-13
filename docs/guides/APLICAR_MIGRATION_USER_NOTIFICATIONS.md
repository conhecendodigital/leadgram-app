# Como Aplicar a Migration de Notificações de Usuário

## 📌 Objetivo

Esta migration cria o sistema de notificações para usuários regulares (não admins), permitindo que eles recebam alertas sobre:
- Ideias aguardando gravação
- Vídeos prontos para publicar
- Metas alcançadas
- Sincronizações do Instagram
- Atualizações do sistema

## 🎯 Passo 1: Acessar o Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto **Leadgram**
3. Clique em **SQL Editor** no menu lateral esquerdo

## 📝 Passo 2: Executar a Migration

1. Clique em **New Query** (botão verde no canto superior direito)
2. Abra o arquivo: `supabase/migrations/20250113000000_user_notifications.sql`
3. Copie **TODO** o conteúdo do arquivo
4. Cole no editor SQL do Supabase
5. Clique em **Run** ou pressione `Ctrl+Enter`

## ✅ O que a migration vai criar:

### Tabela `notifications`
- ✅ Campo `id` - UUID único da notificação
- ✅ Campo `user_id` - Referência ao usuário
- ✅ Campo `type` - Tipo da notificação (content_idea, goal_achievement, instagram_sync, system_update)
- ✅ Campo `title` - Título da notificação
- ✅ Campo `message` - Mensagem detalhada
- ✅ Campo `read` - Se foi lida ou não (boolean)
- ✅ Campo `created_at` - Data de criação
- ✅ Campo `metadata` - Dados adicionais (JSON)

### Índices de Performance
- ✅ `idx_notifications_user_id` - Buscar por usuário
- ✅ `idx_notifications_read` - Filtrar por lidas/não lidas
- ✅ `idx_notifications_created_at` - Ordenar por data
- ✅ `idx_notifications_user_unread` - Contar não lidas por usuário

### Políticas de Segurança (RLS)
- ✅ Usuários veem apenas suas próprias notificações
- ✅ Usuários podem atualizar apenas suas próprias notificações
- ✅ Usuários podem deletar apenas suas próprias notificações
- ✅ Sistema pode criar notificações para qualquer usuário

## 🔍 Passo 3: Verificar se funcionou

Execute esta query no SQL Editor:

```sql
-- Verificar se a tabela foi criada
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'notifications';

-- Verificar as colunas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications';

-- Verificar os índices
SELECT indexname
FROM pg_indexes
WHERE tablename = 'notifications';
```

Você deve ver:
- 1 tabela chamada `notifications`
- 8 colunas (id, user_id, type, title, message, read, created_at, metadata)
- 4 índices

## 🧪 Passo 4: Testar criando uma notificação

Execute esta query para criar uma notificação de teste:

```sql
INSERT INTO public.notifications (user_id, type, title, message, read)
VALUES (
  auth.uid(),
  'system_update',
  'Bem-vindo ao Leadgram!',
  'Seu sistema de notificações está funcionando perfeitamente.',
  false
);
```

Depois, verifique se aparece no app:
1. Acesse o dashboard
2. Clique no sino (🔔) no header
3. Você deve ver a notificação de teste

## 🎨 Tipos de Notificação

| Tipo | Ícone | Cor | Quando usar |
|------|-------|-----|-------------|
| `content_idea` | 💡 | Amarelo-Laranja | Ideias aguardando gravação/postagem |
| `goal_achievement` | 🎯 | Verde | Metas alcançadas |
| `instagram_sync` | 🔄 | Azul | Sincronizações com Instagram |
| `system_update` | 🔔 | Roxo-Rosa | Atualizações do sistema |

## 🔧 Funções Disponíveis

Após aplicar a migration, as seguintes funções já estarão funcionando no app:

- ✅ `getNotifications(userId)` - Buscar notificações
- ✅ `getUnreadCount(userId)` - Contar não lidas
- ✅ `markAsRead(notificationId)` - Marcar como lida
- ✅ `markAllAsRead(userId)` - Marcar todas como lidas
- ✅ `deleteNotification(notificationId)` - Deletar notificação
- ✅ `createSmartNotifications(userId)` - Criar notificações inteligentes

## ⚠️ IMPORTANTE

**Execute esta migration ANTES de usar o sistema de notificações na aplicação!**

Se você tentar usar as notificações sem aplicar a migration, verá erros no console como:
```
Error fetching notifications: relation "public.notifications" does not exist
```

## 🚀 Próximos Passos

Após aplicar a migration:
1. ✅ Sistema de notificações estará 100% funcional
2. ✅ Notificações aparecerão em tempo real no header
3. ✅ Usuários podem marcar como lidas e deletar
4. ✅ Sistema pode criar notificações automáticas

---

**Criado em:** 2025-01-13
**Versão da Migration:** 20250113000000
