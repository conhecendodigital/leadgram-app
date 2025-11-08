# 🔍 INSTRUÇÕES: Como Pegar os Logs do Postgres

**Data:** 08 de Janeiro de 2025
**Status:** ⏳ Aguardando logs para identificar causa raiz

---

## 📋 O Que Descobrimos Até Agora

### ✅ O que JÁ foi testado e descartado:

1. **FK Constraints** ❌
   - Verificamos que NÃO existem FK constraints bloqueando
   - Migration removeu todas as FKs
   - Query confirmou: 0 FK constraints

2. **Trigger handle_new_user()** ❌
   - Desabilitamos o trigger completamente
   - Erro PERSISTIU mesmo sem o trigger
   - Portanto, NÃO é o trigger o problema

3. **RLS Policies** ❌
   - Verificamos as policies de `profiles`
   - Existem policies para `anon` (signup)
   - Não há problema aparente

### ❌ O que AINDA está causando o erro:

```
AuthApiError: Database error creating new user
Status: 500
Code: unexpected_failure
```

**Possíveis causas:**
- Outro trigger BEFORE INSERT em `auth.users` (do próprio Supabase)
- CHECK constraint violada
- NOT NULL constraint violada
- Configuração de segurança do Supabase Auth
- Erro oculto que só aparece nos logs

---

## 🎯 ÚNICA SOLUÇÃO: Ver os Logs do Postgres

Como já descartamos FK constraints e triggers customizados, **a única forma de descobrir o problema é vendo os logs do Postgres em tempo real**.

---

## 📝 PASSO A PASSO DETALHADO

### 1️⃣ Abrir Dashboard do Supabase

Acesse:
```
https://supabase.com/dashboard/project/tgblybswivkktbehkblu
```

### 2️⃣ Ir para Postgres Logs

No menu lateral esquerdo, clique em:
```
Logs → Postgres Logs
```

Ou acesse diretamente:
```
https://supabase.com/dashboard/project/tgblybswivkktbehkblu/logs/postgres-logs
```

### 3️⃣ Configurar Filtros (Opcional mas Recomendado)

Na página de logs, você pode:
- Filtrar por `severity: ERROR`
- Filtrar por `severity: FATAL`
- Deixar em "Live" (atualização em tempo real)

### 4️⃣ Tentar Fazer Cadastro

**EM OUTRA ABA/JANELA**, acesse:
```
http://localhost:3000/register
```

Preencha o formulário:
```
Nome: Teste Log
Email: teste.log@example.com
Senha: senha123456
```

Clique em **"Criar conta"**

### 5️⃣ IMEDIATAMENTE Voltar aos Logs

Assim que clicar em "Criar conta", **volte RAPIDAMENTE** para a aba dos logs do Postgres.

### 6️⃣ Procurar pelo Erro

Nos logs, procure por linhas que contenham:

- `ERROR`
- `FATAL`
- `constraint`
- `violates`
- `foreign key`
- `check constraint`
- `not null`
- `insert into auth.users`

**Você verá algo parecido com:**

```
2025-01-08 17:00:00 UTC [12345]: ERROR:  <AQUI ESTÁ O ERRO REAL>
2025-01-08 17:00:00 UTC [12345]: STATEMENT:  INSERT INTO auth.users ...
```

### 7️⃣ Copiar/Screenshot do Erro

**COPIE** ou faça **SCREENSHOT** das linhas de erro completas.

**Especialmente importante:**
- A linha com `ERROR:` ou `FATAL:`
- A linha com `STATEMENT:` (mostra o SQL que falhou)
- Qualquer linha com `DETAIL:` ou `HINT:`

### 8️⃣ Me Enviar os Logs

Cole aqui no chat ou faça screenshot das linhas de erro.

---

## 📸 Exemplo de Como Deve Ficar

Você deve me enviar algo parecido com isso:

```
2025-01-08 17:00:00.123 UTC [12345] ERROR:  insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
2025-01-08 17:00:00.123 UTC [12345] DETAIL:  Key (id)=(abc123-...) is not present in table "users".
2025-01-08 17:00:00.123 UTC [12345] STATEMENT:  INSERT INTO public.profiles (id, email, ...) VALUES (...)
```

OU:

```
2025-01-08 17:00:00.123 UTC [12345] ERROR:  null value in column "confirmation_token" violates not-null constraint
2025-01-08 17:00:00.123 UTC [12345] DETAIL:  Failing row contains (abc123, null, ...).
2025-01-08 17:00:00.123 UTC [12345] STATEMENT:  INSERT INTO auth.users (...)
```

---

## 🆘 Se Não Aparecer Nada nos Logs

Se você não ver NENHUM erro nos logs ao tentar o cadastro, significa que:

1. **Os logs podem estar desabilitados** - Vá em Settings → Database → Logging e habilite logs detalhados

2. **O erro está acontecendo ANTES de chegar no banco** - Pode ser problema de rede/proxy

3. **Preciso ver os logs do Browser** - Abra DevTools (F12) → Console tab e me envie erros que aparecerem

---

## 🔧 Alternativa: Executar SQL de Teste

Se não conseguir ver os logs, execute este SQL no Dashboard:

**Link:**
```
https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
```

**SQL:**

Copie o conteúdo do arquivo:
```
teste-signup-logs.sql
```

Ou use:
```sql
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
  test_email text := 'teste.' || extract(epoch from now())::text || '@example.com';
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token,
    email_change_token_new, recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', test_email,
    crypt('senha123', gen_salt('bf')), now(),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Teste"}'::jsonb,
    false, '', '', ''
  );

  DELETE FROM auth.users WHERE id = test_user_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO: SQLSTATE=% SQLERRM=%', SQLSTATE, SQLERRM;
    RAISE NOTICE 'DETAIL: %', PG_EXCEPTION_DETAIL;
    RAISE;
END $$;
```

Execute e me envie TODO o output (inclusive a parte de "ERRO").

---

## ✅ Quando Tiver os Logs

Assim que você me enviar os logs, vou poder:

1. Identificar **EXATAMENTE** qual constraint/trigger está bloqueando
2. Criar migration **específica** para resolver
3. Testar e confirmar que funcionou

---

**Aguardando os logs para continuar! 🚀**
