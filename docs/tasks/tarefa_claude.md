## 🔧 PROMPT DE CORREÇÃO PARA O CLAUDE CLI
```
PROBLEMA CRÍTICO IDENTIFICADO - Recursão Infinita nas Políticas RLS

ERRO EXATO:
```
Erro no login: {
  code: '42P17',
  details: null,
  hint: null,
  message: 'infinite recursion detected in policy for relation "profiles"'
}
```

═══════════════════════════════════════════════════════════

DIAGNÓSTICO:

A política RLS "Admins podem gerenciar todos os perfis" está causando recursão infinita porque:
1. Ela verifica a própria tabela `profiles` dentro da política
2. Isso cria um loop: policy → query profiles → policy → query profiles → ♾️

CAUSA:
```sql
-- ❌ POLÍTICA PROBLEMÁTICA:
CREATE POLICY "Admins podem gerenciar todos os perfis" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

═══════════════════════════════════════════════════════════

SOLUÇÃO - Corrigir Políticas RLS sem Recursão

Execute esta migration no Supabase SQL Editor:
```sql
-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO DEFINITIVA: Políticas RLS sem Recursão Infinita
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- 1. REMOVER TODAS as políticas atuais da tabela profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;

-- 2. CRIAR políticas corretas SEM recursão
-- Usuários normais podem ver apenas seu próprio perfil
CREATE POLICY "users_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "users_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Usuários podem deletar apenas seu próprio perfil
CREATE POLICY "users_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 3. Para ADMINS: usar auth.jwt() ao invés de consultar profiles
-- Isso evita recursão porque não consulta a tabela profiles
CREATE POLICY "admins_all_access" ON profiles
  FOR ALL
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- 4. VERIFICAÇÃO: Contar políticas criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  RAISE NOTICE 'Total de políticas RLS na tabela profiles: %', policy_count;
  
  IF policy_count = 5 THEN
    RAISE NOTICE '✓ Políticas criadas com sucesso!';
  ELSE
    RAISE WARNING '⚠ Esperado 5 políticas, encontrado %', policy_count;
  END IF;
END $$;

COMMIT;

-- 5. LISTAR políticas finais
SELECT 
  policyname as "Política",
  cmd as "Comando",
  qual as "Condição"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

═══════════════════════════════════════════════════════════

ALTERNATIVA (se auth.jwt() não funcionar):

Se a solução acima não funcionar, use esta abordagem mais simples:
```sql
BEGIN;

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "admins_all_access" ON profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON profiles;

-- Criar política de admin SIMPLIFICADA (sem verificar role)
-- Admins serão verificados no código da aplicação
CREATE POLICY "service_role_access" ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;
```

⚠️ **ATENÇÃO:** Esta segunda abordagem é MENOS segura, mas elimina a recursão.
Use apenas se a primeira não funcionar.

═══════════════════════════════════════════════════════════

APÓS APLICAR A MIGRATION:

1. ✅ Teste o login novamente
2. ✅ Verifique se não há mais erro de recursão
3. ✅ Verifique se redireciona corretamente
4. ✅ Me reporte o resultado

Execute a migration AGORA e me diga se funcionou!