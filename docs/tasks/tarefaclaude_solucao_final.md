ERRO PERSISTE - Cadastro Ainda Falhando Após Adicionar Email

SITUAÇÃO:
✅ Campo email foi adicionado na linha 53
✅ Build passa sem erros
❌ Cadastro AINDA falha com "Database error saving new user"

HIPÓTESES:

1. Código não foi recarregado (servidor Next.js precisa restart)
2. Há OUTRO campo obrigatório faltando
3. O INSERT manual está CONFLITANDO com o trigger
4. Há um erro no trigger que não foi detectado

═══════════════════════════════════════════════════════════

SOLUÇÃO 1: REMOVER INSERT MANUAL (Deixar apenas trigger)

O trigger handle_new_user JÁ cria o perfil automaticamente.
O INSERT manual pode estar causando conflito!

Abra: app/(auth)/register/page.tsx

REMOVA completamente o bloco de INSERT manual (linhas 48-59):
```typescript
// ❌ REMOVER ESTE BLOCO COMPLETO:
const { error: profileError } = await (supabase
  .from('profiles') as any)
  .insert({
    id: data.user.id,
    email: email,
    full_name: fullName,
    role: 'user',
    plan_id: 'free',
    ideas_limit: 10,
    ideas_used: 0
  })

if (profileError) {
  throw profileError
}
```

SUBSTITUA por apenas um comentário:
```typescript
// Perfil criado automaticamente pelo trigger handle_new_user
```

Justificativa:
- Trigger UPSERT já cria o perfil
- INSERT manual pode estar tentando criar duplicado
- Simplifica o código
- Evita race conditions

═══════════════════════════════════════════════════════════

SOLUÇÃO 2 (SE SOLUÇÃO 1 NÃO FUNCIONAR): 

Ver TODOS os campos obrigatórios da tabela profiles:

Execute no Supabase SQL Editor:
```sql
-- Ver campos NOT NULL da tabela profiles
SELECT 
  column_name,
  is_nullable,
  column_default,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
AND is_nullable = 'NO'
ORDER BY ordinal_position;
```

Me retorne o resultado para ver quais campos são obrigatórios!

═══════════════════════════════════════════════════════════

EXECUTE A SOLUÇÃO 1 PRIMEIRO (remover INSERT manual).

Depois:
1. Reinicie o servidor (npm run dev)
2. Teste o cadastro novamente
3. Me reporte o resultado

Se não funcionar, execute SOLUÇÃO 2 e me envie o resultado!