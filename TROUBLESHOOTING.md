# Troubleshooting - Leadgram

## Problema: "Conta criada mas não faz login"

### Solução 1: Desabilitar confirmação de email (Recomendado para desenvolvimento)

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** > **Settings** (menu lateral)
3. Role até **Email Auth**
4. **DESABILITE** a opção **"Enable email confirmations"**
5. Clique em **Save**

Agora você pode criar contas e fazer login imediatamente!

### Solução 2: Verificar se o trigger foi criado

O trigger `handle_new_user()` deve criar automaticamente o perfil quando um usuário se registra.

1. Vá no **SQL Editor** do Supabase
2. Execute este comando para verificar:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Se retornar vazio, execute novamente o arquivo `SUPABASE_SCHEMA.sql` completo.

### Solução 3: Verificar políticas RLS

Execute no SQL Editor para verificar se as políticas estão corretas:

```sql
-- Ver todas as policies da tabela profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Se não houver policies, execute novamente o `SUPABASE_SCHEMA.sql`.

### Solução 4: Criar perfil manualmente (temporário)

Se o trigger não estiver funcionando, você pode criar o perfil manualmente:

1. Registre a conta normalmente
2. Vá em **Authentication** > **Users** no Supabase
3. Copie o **ID** do usuário criado
4. Vá no **SQL Editor** e execute:

```sql
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES (
  'COLE_O_ID_AQUI',
  'Seu Nome',
  null
);
```

5. Agora tente fazer login

### Solução 5: Limpar dados e recomeçar

Se nada funcionar:

```sql
-- CUIDADO: Isso deleta TODOS os dados!

-- 1. Deletar usuários de teste
DELETE FROM auth.users WHERE email LIKE '%teste%';

-- 2. Deletar perfis órfãos
DELETE FROM public.profiles;

-- 3. Recriar o schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Execute novamente o SUPABASE_SCHEMA.sql completo
```

## Problema: "New row violates row-level security policy"

Isso significa que as políticas RLS não permitem a inserção.

**Solução temporária (APENAS para desenvolvimento):**

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Solução definitiva:**

Execute estas policies no SQL Editor:

```sql
-- Deletar policies antigas
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recriar policy correta
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## Problema: Email de confirmação não chega

Se você quiser testar com confirmação de email:

1. Use um email real
2. Ou configure SMTP customizado em **Settings** > **Auth** > **SMTP Settings**
3. Ou use o link de confirmação que aparece nos logs

## Como testar se está tudo funcionando

### Teste 1: Criar conta

```bash
Email: teste@exemplo.com
Senha: teste123
Nome: Usuario Teste
```

Deve:
- ✅ Criar usuário em `auth.users`
- ✅ Criar perfil em `public.profiles`
- ✅ Fazer login automaticamente
- ✅ Redirecionar para `/dashboard`

### Teste 2: Verificar no banco

Execute no SQL Editor:

```sql
-- Ver usuários criados
SELECT id, email, created_at FROM auth.users;

-- Ver perfis criados
SELECT id, full_name, created_at FROM public.profiles;

-- Devem ter o mesmo ID
```

### Teste 3: Login

Depois de criar a conta, tente:
1. Fazer logout
2. Ir em `/login`
3. Entrar com as mesmas credenciais
4. Deve funcionar!

## Logs úteis

Abra o **Console do navegador** (F12) e veja os erros. Procure por:

- `AuthApiError` - Erro de autenticação
- `PostgrestError` - Erro do banco de dados
- Mensagens de RLS violation

## Ainda com problemas?

1. Verifique se as variáveis `.env.local` estão corretas
2. Reinicie o servidor: `npm run dev`
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Teste em aba anônima

## Configuração completa testada

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Com email confirmation **DESABILITADO**, deve funcionar perfeitamente! ✅
