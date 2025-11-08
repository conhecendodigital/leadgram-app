# Como Aplicar a Migration de Notificações

## Passo 1: Acessar o Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto Leadgram
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Executar a Migration

1. Clique em "New Query"
2. Copie todo o conteúdo do arquivo: `supabase/migrations/20250106000000_admin_notifications.sql`
3. Cole no editor SQL
4. Clique em "Run" ou pressione Ctrl+Enter

## O que a migration vai criar:

- ✅ Tabela `admin_notifications` - Armazena todas as notificações do admin
- ✅ Tabela `admin_notification_settings` - Configurações de notificações
- ✅ Índices para performance
- ✅ Políticas de segurança (RLS) - Apenas admins podem acessar
- ✅ Um registro padrão de configurações

## Verificar se funcionou:

Execute esta query após aplicar a migration:

```sql
SELECT * FROM admin_notification_settings;
```

Deve retornar 1 linha com as configurações padrão.

---

**IMPORTANTE:** Execute esta migration ANTES de testar o sistema de notificações na aplicação!
