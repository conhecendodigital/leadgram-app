# 🔐 Sistema de Autenticação - Leadgram

**Status:** ✅ Funcionando
**Última atualização:** 08 de Janeiro de 2025

---

## 📋 Visão Geral

Sistema completo de autenticação com suporte a:
- ✅ Cadastro de novos usuários (signup)
- ✅ Login de usuários existentes
- ✅ Logout
- ✅ Recuperação de senha
- ✅ Criação automática de perfil via trigger
- ✅ Sistema de notificações para administradores

---

## 🔧 Componentes

### 1. Páginas de Autenticação

#### Cadastro (`/register`)
- **Arquivo:** `app/(auth)/register/page.tsx`
- **Funcionalidade:** Permite que novos usuários criem uma conta
- **Campos:** Nome completo, Email, Senha (mínimo 6 caracteres)
- **Processo:**
  1. Usuário preenche formulário
  2. Supabase Auth cria usuário em `auth.users`
  3. Trigger `on_auth_user_created` dispara automaticamente
  4. Função `handle_new_user()` cria perfil em `public.profiles`
  5. Função `notify_new_user()` cria notificação para admin

#### Login (`/login`)
- **Arquivo:** `app/(auth)/login/page.tsx`
- **Funcionalidade:** Permite que usuários existentes façam login
- **Campos:** Email, Senha

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `auth.users` (Gerenciada pelo Supabase)
```sql
id: UUID PRIMARY KEY
email: VARCHAR
encrypted_password: VARCHAR
email_confirmed_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
raw_user_meta_data: JSONB
raw_app_meta_data: JSONB
```

### Tabela `public.profiles`
```sql
id: UUID PRIMARY KEY (FK para auth.users.id)
email: VARCHAR NOT NULL
full_name: VARCHAR
role: VARCHAR DEFAULT 'user'
plan_id: VARCHAR DEFAULT 'free'
ideas_limit: INTEGER DEFAULT 10
ideas_used: INTEGER DEFAULT 0
created_at: TIMESTAMPTZ DEFAULT NOW()
updated_at: TIMESTAMPTZ DEFAULT NOW()
```

---

## ⚙️ Triggers e Funções

### Trigger: `on_auth_user_created`
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Quando executa:** Sempre que um novo usuário é criado em `auth.users`

### Função: `handle_new_user()`
**Responsabilidades:**
1. Capturar email e nome do usuário
2. Criar perfil automaticamente em `public.profiles`
3. Definir valores padrão (role='user', plan='free', etc)
4. Retornar NEW (nunca bloqueia signup)

**Tratamento de erro:**
- ✅ Usa `EXCEPTION WHEN OTHERS` para não bloquear signup
- ✅ Loga warnings em caso de erro
- ✅ Sempre retorna NEW

### Função: `notify_new_user()`
**Responsabilidades:**
1. Verificar se notificações estão ativadas em `admin_notification_settings`
2. Criar notificação em `admin_notifications` se ativado
3. Nunca bloquear signup (usa try/catch)

---

## 🔒 Row Level Security (RLS)

### Tabela `profiles`

**Policy: "Users can view own profile"**
```sql
FOR SELECT USING (auth.uid() = id)
```

**Policy: "Users can update own profile"**
```sql
FOR UPDATE USING (auth.uid() = id)
```

**Policy: "Admins can view all profiles"**
```sql
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
```

**Policy: "Enable signup for anon users"**
```sql
FOR INSERT WITH CHECK (true)
-- Permite INSERT durante signup (usuário ainda não autenticado)
```

---

## 📝 Fluxo de Cadastro

```
┌────────────────────────────────────────────────────────────┐
│ 1. Usuário preenche formulário em /register               │
│    - Nome: "João Silva"                                    │
│    - Email: "joao@example.com"                             │
│    - Senha: "senha123"                                     │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 2. Frontend chama supabase.auth.signUp()                  │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 3. Supabase Auth cria registro em auth.users              │
│    - id: abc123-...                                        │
│    - email: joao@example.com                               │
│    - encrypted_password: (hash)                            │
│    - raw_user_meta_data: {full_name: "João Silva"}        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 4. Trigger on_auth_user_created dispara                   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 5. Função handle_new_user() executa                       │
│    - Captura email e nome                                  │
│    - Insere em public.profiles:                            │
│      * id: abc123-...                                      │
│      * email: joao@example.com                             │
│      * full_name: João Silva                               │
│      * role: user                                          │
│      * plan_id: free                                       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 6. Função notify_new_user() executa (se ativado)          │
│    - Cria notificação para admin                           │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 7. Usuário logado automaticamente                         │
│    - Session criada                                        │
│    - Redirecionado para /dashboard                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Problema: "Database error creating new user"

**Causa:** Trigger falhando ao criar perfil ou notificação

**Solução:**
1. Verificar se tabela `admin_notification_settings` existe
2. Verificar logs do Postgres em Dashboard → Logs
3. Verificar se trigger `handle_new_user()` está ativo

### Problema: Perfil não é criado automaticamente

**Causa:** Trigger não está executando

**Verificar:**
```sql
-- Ver triggers ativos
SELECT * FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- Ver função do trigger
SELECT pg_get_functiondef('public.handle_new_user()'::regprocedure);
```

**Solução:**
```sql
-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Problema: RLS bloqueando signup

**Verificar policies:**
```sql
SELECT * FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles';
```

**Garantir que existe policy para anon:**
```sql
CREATE POLICY "Enable signup for anon users" ON profiles
  FOR INSERT WITH CHECK (true);
```

---

## 📚 Migrations Relacionadas

Migrations aplicadas (em ordem):
1. `20250107010000_security_system.sql` - Sistema de segurança e perfis
2. `20250107040000_fix_profiles_rls_and_trigger.sql` - Correção RLS e triggers
3. `20250108020000_fix_signup_with_trigger.sql` - Correção signup
4. `20250108120000_fix_admin_notification_settings.sql` - Tabela de notificações

---

## ✅ Status Atual

- ✅ Signup funcionando 100%
- ✅ Login funcionando 100%
- ✅ Trigger de criação de perfil ativo
- ✅ Sistema de notificações ativo
- ✅ RLS configurado corretamente
- ✅ Sem Foreign Key constraints bloqueando

---

## 📞 Suporte

Para mais informações ou problemas:
- Ver logs em: Dashboard → Logs → Postgres Logs
- Documentação do Supabase Auth: https://supabase.com/docs/guides/auth
- Histórico de debug: `/docs/debug-history/`
