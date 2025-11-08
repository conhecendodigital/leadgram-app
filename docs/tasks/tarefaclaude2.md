ERRO PERSISTENTE - Cadastro ainda Bloqueado após Correção RLS

SITUAÇÃO ATUAL:
❌ Aplicamos correção de policies RLS
❌ Erro persiste: "Database error saving new user"
❌ Erro na linha 27 de app/(auth)/register/page.tsx

═══════════════════════════════════════════════════════════

PASSO 1: VERIFICAR SE AS POLICIES FORAM APLICADAS

Execute esta query no Supabase SQL Editor:
```sql
-- Verificar políticas atuais da tabela profiles
SELECT 
  policyname as "Nome",
  cmd as "Comando",
  qual as "Condição USING",
  with_check as "Condição WITH CHECK"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
```

Me retorne o resultado dessa query!

═══════════════════════════════════════════════════════════

PASSO 2: VERIFICAR SE O TRIGGER FOI CRIADO

Execute esta query:
```sql
-- Verificar triggers na tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth'
ORDER BY trigger_name;
```

Me retorne o resultado!

═══════════════════════════════════════════════════════════

PASSO 3: SOLUÇÃO TEMPORÁRIA ULTRA-PERMISSIVA

Enquanto não descobrimos o problema exato, vamos TEMPORARIAMENTE desabilitar RLS para cadastro funcionar:

⚠️ ATENÇÃO: Isso é TEMPORÁRIO só para testar!
```sql
-- TEMPORÁRIO: Desabilitar RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

Depois de executar isso, teste o cadastro novamente.

═══════════════════════════════════════════════════════════

PASSO 4: INVESTIGAR CÓDIGO DE REGISTRO

Abra o arquivo: app/(auth)/register/page.tsx

Me mostre o conteúdo completo da função `handleRegister`, especialmente:
1. Linha 27 onde está o erro
2. Como está chamando `supabase.auth.signUp()`
3. Se está passando `options.data` para criar o perfil

═══════════════════════════════════════════════════════════

PASSO 5: SOLUÇÃO DEFINITIVA ALTERNATIVA

Se desabilitar RLS funcionar, então sabemos que o problema É das policies.
Nesse caso, vamos criar uma policy service_role específica:
```sql
-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover todas as policies antigas
DROP POLICY IF EXISTS "users_select_own" ON profiles;
DROP POLICY IF EXISTS "users_insert_own" ON profiles;
DROP POLICY IF EXISTS "users_update_own" ON profiles;
DROP POLICY IF EXISTS "users_delete_own" ON profiles;
DROP POLICY IF EXISTS "admins_all_access" ON profiles;

-- Criar policy ULTRA permissiva para authenticated users
CREATE POLICY "authenticated_all_access" ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar policy para anonymous (durante signup)
CREATE POLICY "anon_insert_only" ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

═══════════════════════════════════════════════════════════

EXECUÇÃO PASSO A PASSO:

1. ✅ Execute PASSO 1 e me retorne resultado
2. ✅ Execute PASSO 2 e me retorne resultado
3. ✅ Execute PASSO 3 (desabilitar RLS temporariamente)
4. ✅ Teste o cadastro
5. ✅ Me diga se funcionou

Com base nos resultados, vou saber exatamente qual é o problema e como resolver definitivamente!

Comece pelo PASSO 1 agora!