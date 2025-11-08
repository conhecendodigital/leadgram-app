# Como Aplicar a Migration de Gestão de Banco de Dados

## Passo 1: Acessar o Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto Leadgram
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Executar a Migration

1. Clique em "New Query"
2. Copie todo o conteúdo do arquivo: `supabase/migrations/20250106010000_database_management.sql`
3. Cole no editor SQL
4. Clique em "Run" ou pressione Ctrl+Enter

## O que a migration vai criar:

- ✅ Tabela `database_backups` - Histórico de backups
- ✅ Tabela `database_backup_config` - Configuração de backup automático
- ✅ Índices para performance
- ✅ Políticas de segurança (RLS) - Apenas admins podem acessar
- ✅ Um registro padrão de configuração

## Verificar se funcionou:

Execute esta query após aplicar a migration:

```sql
SELECT * FROM database_backup_config;
```

Deve retornar 1 linha com as configurações padrão (enabled=false, frequency='daily', time='02:00').

---

## Funcionalidades Implementadas:

### 1. **Estatísticas do Banco**
- 4 cards visuais mostrando:
  - Total de usuários
  - Total de ideias
  - Total de notificações
  - Tamanho estimado do banco

### 2. **Backup Manual**
- Botão "Criar Backup Agora"
- Cria backup simulado (~40-50MB)
- Gera notificação quando criado

### 3. **Backup Automático**
- Toggle para ativar/desativar
- Seleção de frequência (Diário, Semanal, Mensal)
- Configuração de horário
- Mostra próximo backup agendado

### 4. **Histórico de Backups**
- Lista dos últimos 5 backups
- Mostra data, hora e tamanho
- Botão para excluir cada backup

### 5. **Limpeza de Dados**
- Remove notificações antigas (90+ dias)
- Mostra quantidade de itens para limpar
- Confirmação antes de executar

### 6. **Otimização**
- Botão para solicitar otimização do banco
- Cria notificação quando solicitado

---

## Como Testar:

1. **Aplicar a migration** (acima)
2. Acesse: `/admin/settings` → Aba "Banco de Dados"
3. Verifique se:
   - ✅ Estatísticas estão sendo carregadas
   - ✅ Backup automático pode ser configurado
   - ✅ Backup manual pode ser criado
   - ✅ Histórico de backups é exibido
   - ✅ Limpeza de dados funciona
   - ✅ Otimização pode ser solicitada

---

**IMPORTANTE:** Execute esta migration ANTES de testar o sistema de gestão de banco de dados!
