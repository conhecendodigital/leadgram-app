 PROMPT DE AUDITORIA E LIMPEZA COMPLETA
MISSÃO CRÍTICA - Auditoria e Limpeza Completa do Projeto Leadgram

CONTEXTO:
O projeto passou por múltiplas iterações de desenvolvimento com IA, resultando em:
- Arquivos criados e modificados várias vezes
- Features que quebraram outras features
- Possíveis migrations conflitantes
- Código duplicado ou morto
- Sistema de login/auth com problemas

OBJETIVO:
Fazer uma auditoria COMPLETA e sistemática do projeto, identificar conflitos, limpar código problemático, e garantir que o CORE do sistema funcione perfeitamente.

═══════════════════════════════════════════════════════════

ETAPA 1: AUDITORIA DO BANCO DE DADOS E MIGRATIONS

Execute e me reporte:
```bash
# Listar TODAS as migrations
ls -la supabase/migrations/

# Verificar se há migrations duplicadas ou conflitantes
grep -r "CREATE TABLE" supabase/migrations/ | grep -E "(profiles|security_settings|login_attempts|blocked_ips|active_sessions|audit_logs|user_2fa)"
```

Depois, execute esta query no Supabase SQL Editor:
```sql
-- Verificar TODAS as tabelas do projeto
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

E esta para verificar tabelas de segurança:
```sql
-- Verificar se tabelas de segurança existem
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
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

═══════════════════════════════════════════════════════════

ETAPA 2: AUDITORIA DAS API ROUTES DE AUTENTICAÇÃO

Liste e analise TODAS as rotas de autenticação:
```bash
# Listar todas as API routes de auth
find app/api/auth -type f -name "*.ts" | sort

# Verificar conteúdo de cada route
ls -la app/api/auth/*/route.ts
```

Para CADA arquivo encontrado:
1. Verifique se há erros de sintaxe
2. Verifique se há imports quebrados
3. Verifique se há código comentado ou duplicado
4. Liste quais rotas estão ATIVAS e quais estão DEPRECIADAS

Crie um relatório no formato:
ROTAS DE AUTENTICAÇÃO ENCONTRADAS:
✅ /api/auth/login - ATIVA - [descrição]
❌ /api/auth/login-simple - DEPRECIADA - [descrição]
⚠️ /api/auth/signup - CONFLITO - [descrição do problema]
...

═══════════════════════════════════════════════════════════

ETAPA 3: AUDITORIA DOS SERVIÇOS (lib/services/)

Liste todos os serviços e verifique:
```bash
# Listar todos os services
ls -la lib/services/

# Verificar imports quebrados em cada service
grep -r "import.*from" lib/services/ | grep -v "node_modules"
```

Para cada service, verifique:
1. ✅ Imports corretos
2. ✅ Métodos implementados completamente (sem TODOs)
3. ✅ Não há código duplicado
4. ✅ Cliente Supabase está sendo passado corretamente

Relatório:
SERVIÇOS ENCONTRADOS:
✅ auth-service.ts - OK
❌ security-service.ts - PROBLEMA: [descrever]
⚠️ notification-service.ts - ATENÇÃO: [descrever]
...

═══════════════════════════════════════════════════════════

ETAPA 4: AUDITORIA DE ARQUIVOS DUPLICADOS

Encontre arquivos duplicados ou com nomes similares:
```bash
# Buscar arquivos com nomes similares
find . -type f -name "*login*" ! -path "*/node_modules/*" ! -path "*/.next/*"
find . -type f -name "*auth*" ! -path "*/node_modules/*" ! -path "*/.next/*"
find . -type f -name "*security*" ! -path "*/node_modules/*" ! -path "*/.next/*"
find . -type f -name "*profile*" ! -path "*/node_modules/*" ! -path "*/.next/*"
```

Liste TODOS os arquivos encontrados e identifique:
- Arquivos duplicados que devem ser removidos
- Arquivos conflitantes que devem ser consolidados
- Arquivos antigos/depreciados que devem ser deletados

═══════════════════════════════════════════════════════════

ETAPA 5: VERIFICAÇÃO DE BUILD E TIPOS TYPESCRIPT

Execute e reporte TODOS os erros:
```bash
# Limpar cache e node_modules
rm -rf .next node_modules package-lock.json

# Reinstalar dependências
npm install

# Verificar erros de TypeScript
npx tsc --noEmit

# Tentar build
npm run build
```

Liste TODOS os erros de TypeScript encontrados, agrupados por:
1. Erros de import/módulo não encontrado
2. Erros de tipo
3. Erros de sintaxe
4. Outros erros

═══════════════════════════════════════════════════════════

ETAPA 6: CRIAR PLANO DE LIMPEZA

Com base nas 5 etapas anteriores, crie um PLANO DE LIMPEZA detalhado:
PLANO DE LIMPEZA DO PROJETO LEADGRAM
🗑️ ARQUIVOS PARA DELETAR:

 arquivo1.ts - Motivo: duplicado
 arquivo2.ts - Motivo: depreciado
...

🔧 ARQUIVOS PARA CORRIGIR:

 arquivo3.ts - Problema: import quebrado
 arquivo4.ts - Problema: tipo incorreto
...

📝 MIGRATIONS PARA CONSOLIDAR:

 Remover: 20250107030000_*.sql (conflitante)
 Manter: 20250107040000_*.sql (correta)
...

🔄 CÓDIGO PARA REFATORAR:

 Consolidar rotas de auth duplicadas
 Simplificar SecurityService
...

✅ PRIORIDADES (ordem de execução):

Corrigir migrations do banco
Deletar arquivos duplicados/depreciados
Corrigir imports quebrados
Resolver erros de TypeScript
Testar build
Testar funcionalidades core (login, cadastro, admin)


═══════════════════════════════════════════════════════════

ETAPA 7: EXECUTAR LIMPEZA (APÓS APROVAÇÃO)

IMPORTANTE: NÃO execute nenhuma limpeza até eu revisar e aprovar o plano!

Após aprovação, execute as limpezas na ordem de prioridade definida.

═══════════════════════════════════════════════════════════

FORMATO DE RESPOSTA:

Para CADA etapa, me retorne:
1. Comandos executados
2. Resultados completos (não truncar)
3. Problemas identificados
4. Recomendações

Ao final, apresente o PLANO DE LIMPEZA completo para minha aprovação.

═══════════════════════════════════════════════════════════

COMECE PELA ETAPA 1 agora!