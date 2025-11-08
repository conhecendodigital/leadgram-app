PROBLEMA ESPECÍFICO - Cadastro de Usuários Bloqueado

CONTEXTO:
Login foi corrigido e está funcionando ✅
Mas agora o cadastro está bloqueado ❌

ERRO NO CONSOLE:
Erro no signup: AuthApiError: Database error saving new user
POST https://[...].supabase.co/auth/v1/signup?redirect_to=[...] 500 (Internal Server Error)

═══════════════════════════════════════════════════════════

DIAGNÓSTICO:

O problema é que as políticas RLS que corrigimos para resolver a recursão infinita estão BLOQUEANDO o INSERT de novos usuários.

Política atual:
```sql
CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

❌ PROBLEMA: Durante o signup, o usuário AINDA NÃO ESTÁ AUTENTICADO!
- Supabase Auth cria o usuário em auth.users
- Depois tenta criar o perfil em profiles
- Mas auth.uid() ainda é NULL nesse momento
- Policy bloqueia o INSERT

═══════════════════════════════════════════════════════════

SOLUÇÃO - Permitir INSERT durante Signup

Execute esta migration SOMENTE para corrigir o INSERT:
```sql
-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO CIRÚRGICA: Permitir Cadastro de Novos Usuários
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- 1. Remover política de INSERT atual (que está bloqueando)
DROP POLICY IF EXISTS "users_insert_own" ON profiles;

-- 2. Criar política de INSERT que permite signup
-- Durante signup, auth.uid() pode ser NULL ou já estar setado
-- Então verificamos: se auth.uid() existe, deve ser igual ao id
CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL  -- Permite INSERT durante signup
  );

-- 3. VERIFICAÇÃO
DO $$
DECLARE
  insert_policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'users_insert_own'
    AND cmd = 'INSERT'
  ) INTO insert_policy_exists;
  
  IF insert_policy_exists THEN
    RAISE NOTICE '✓ Política de INSERT corrigida com sucesso!';
  ELSE
    RAISE WARNING '⚠ Política de INSERT não foi criada!';
  END IF;
END $$;

COMMIT;
```

═══════════════════════════════════════════════════════════

ALTERNATIVA MAIS SEGURA (Recomendada):

Se a solução acima não funcionar, use trigger para criar perfil:
```sql
BEGIN;

-- 1. Permitir INSERT apenas para authenticated users ou service role
DROP POLICY IF EXISTS "users_insert_own" ON profiles;

CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- 2. Criar função de trigger para auto-criar perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignora erro se perfil já existe
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAÇÃO
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE '✓ Trigger de auto-criação de perfil criado!';
  ELSE
    RAISE WARNING '⚠ Trigger não foi criado!';
  END IF;
END $$;

COMMIT;
```

═══════════════════════════════════════════════════════════

TESTE APÓS APLICAR:

1. ✅ Vá para /register
2. ✅ Cadastre um novo usuário de teste
3. ✅ Verifique se não dá erro
4. ✅ Verifique se redireciona corretamente
5. ✅ Me reporte o resultado

═══════════════════════════════════════════════════════════

QUAL SOLUÇÃO USAR?

🥇 **RECOMENDAÇÃO:** Use a ALTERNATIVA (com trigger)
- É mais segura
- É o padrão do Supabase
- Evita problemas de RLS

Execute a ALTERNATIVA MAIS SEGURA agora e teste!