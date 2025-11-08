PROBLEMA CRÍTICO - API de Login com Erro 500

O usuário testou o login e obteve:
❌ POST http://localhost:3000/api/auth/login 500 (Internal Server Error)
⚠️ Ao recarregar a página, o dashboard abre (sessão foi criada)
❌ Mas não consegue acessar o painel de administrador

═══════════════════════════════════════════════════════════

DIAGNÓSTICO:

O erro 500 indica que a API route `/api/auth/login` está quebrando ao tentar:
1. Registrar a tentativa de login (login_attempts)
2. Verificar se o IP está bloqueado (blocked_ips)
3. Criar sessão ativa (active_sessions)
4. Gravar no audit log (audit_logs)

Provavelmente as TABELAS DE SEGURANÇA não foram criadas ainda!

═══════════════════════════════════════════════════════════

VERIFICAÇÃO URGENTE:

Execute esta query no Supabase SQL Editor para verificar se as tabelas de segurança existem:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'security_settings',
  'login_attempts', 
  'blocked_ips',
  'active_sessions',
  'audit_logs',
  'user_2fa'
)
ORDER BY table_name;
```

Me retorne o resultado dessa query!

═══════════════════════════════════════════════════════════

AÇÕES BASEADAS NO RESULTADO:

CENÁRIO 1: Se as tabelas NÃO existem (lista vazia ou incompleta)
→ Aplicar a migration 20250107010000_security_system.sql

CENÁRIO 2: Se as tabelas existem
→ Investigar o código da API route /api/auth/login
→ Verificar logs de erro mais detalhados

═══════════════════════════════════════════════════════════

INVESTIGAÇÃO NO CÓDIGO:

Abra o arquivo: app/api/auth/login/route.ts

Procure por:
1. Chamadas ao SecurityService
2. Try-catch que pode estar silenciando erros
3. Imports que podem estar incorretos

Mostre-me o conteúdo completo desse arquivo para eu analisar.

═══════════════════════════════════════════════════════════

SOLUÇÃO TEMPORÁRIA (caso necessário):

Se as tabelas de segurança não existirem, podemos:
1. Criar a migration manualmente via SQL Editor
2. OU desabilitar temporariamente as features de segurança na API de login
3. OU usar a API simplificada (/api/auth/login-simple) temporariamente

═══════════════════════════════════════════════════════════

Me retorne:
1. ✅ Resultado da query de verificação de tabelas
2. ✅ Conteúdo completo de app/api/auth/login/route.ts
3. ✅ Se houver, logs de erro mais detalhados do terminal do Next.js

Aguardando para prosseguir com a correção!