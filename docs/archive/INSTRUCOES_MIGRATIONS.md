# 🔧 Como Aplicar as Migrations do Leadgram

## ❌ Problema Identificado

As tabelas `webhooks`, `webhook_logs`, `email_settings` e `email_logs` não existem no banco de dados, causando erros 404 nas páginas de configuração.

## ✅ Solução

Execute os SQLs manualmente no Supabase Dashboard seguindo os passos abaixo:

---

## 📋 PASSO 1: Executar SQL de Email

1. Abra o SQL Editor do Supabase:
   ```
   https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
   ```

2. Copie **TODO** o conteúdo do arquivo `EXECUTAR_ESTE_SQL.sql`

3. Cole no editor SQL

4. Clique no botão **"Run"** (canto inferior direito)

5. Aguarde a mensagem de sucesso

---

## 📋 PASSO 2: Executar SQL de Webhooks

1. **No mesmo SQL Editor**, clique em **"New Query"** (ou Ctrl+N)

2. Copie **TODO** o conteúdo do arquivo `EXECUTAR_WEBHOOK_SQL.sql`

3. Cole no editor SQL

4. Clique no botão **"Run"** (canto inferior direito)

5. Aguarde a mensagem de sucesso

---

## ✅ PASSO 3: Verificar

Após executar ambos os SQLs:

1. Recarregue a página: http://localhost:3000/admin/settings

2. Clique na aba **"Webhooks"**

3. Você deve ver:
   - Dashboard com estatísticas (0 webhooks inicialmente)
   - Botão "Adicionar Primeiro Webhook"
   - SEM erros 404 no console

4. Clique na aba **"Email"**

5. Você deve ver:
   - Formulário de configuração de email
   - Opções de provider (Resend, SMTP, etc.)
   - SEM erros 404 no console

---

## 🔍 O que foi criado?

### Email System:
- ✅ Tabela `email_settings` (configurações de email)
- ✅ Tabela `email_logs` (histórico de emails enviados)
- ✅ Funções: `reset_daily_email_count()`, `increment_email_count()`
- ✅ Políticas RLS (apenas admins)
- ✅ Registro padrão com configuração inicial

### Webhook System:
- ✅ Tabela `webhooks` (webhooks configurados)
- ✅ Tabela `webhook_logs` (histórico de chamadas)
- ✅ Funções: `update_webhook_stats()`, `cleanup_old_webhook_logs()`
- ✅ Políticas RLS (apenas admins)
- ✅ Webhook padrão do Mercado Pago

---

## 🚨 Solução de Problemas

### Se der erro "table already exists":
- **Não se preocupe!** Os scripts usam `CREATE TABLE IF NOT EXISTS`, então é seguro executar várias vezes
- Ignore esse erro e continue

### Se o SQL Editor não carregar:
1. Verifique sua conexão com a internet
2. Tente abrir em modo anônimo/privado do navegador
3. Limpe o cache do navegador

### Se continuar com erro 404 após executar:
1. Abra o Developer Tools (F12)
2. Vá na aba Network
3. Recarregue a página
4. Envie print dos erros 404 que aparecerem

---

## 📞 Próximos Passos

Após aplicar as migrations com sucesso:

### Configurar Email:
1. Acesse a aba Email nas configurações
2. Selecione o provider (recomendado: Resend)
3. Adicione sua API Key
4. Ative os tipos de email que deseja enviar
5. Clique em "Testar Email" para validar

### Configurar Webhooks:
1. Acesse a aba Webhooks
2. Clique em "Adicionar Primeiro Webhook"
3. Configure nome, URL e eventos
4. Clique em "Testar" para validar a conexão
5. Ative o webhook

---

**⚠️ IMPORTANTE:** Execute AMBOS os SQLs (`EXECUTAR_ESTE_SQL.sql` E `EXECUTAR_WEBHOOK_SQL.sql`) para que o sistema funcione corretamente!
