DESCOBERTA CRÍTICA - Problema está no Código, NÃO no Banco

SITUAÇÃO:
✅ INSERT manual direto no banco FUNCIONA perfeitamente
✅ Políticas RLS estão corretas
✅ Constraints OK
❌ Cadastro via interface AINDA falha com "Database error saving new user"

CONCLUSÃO:
O problema É no código TypeScript de register/page.tsx ou na forma como está chamando supabase.auth.signUp()

═══════════════════════════════════════════════════════════

INVESTIGAÇÃO NECESSÁRIA:

1. Abra o arquivo: app/(auth)/register/page.tsx

2. Mostre-me o código COMPLETO da função handleRegister, especialmente:
   - Linha 27 onde está o erro
   - Como está chamando supabase.auth.signUp()
   - Quais options.data está passando
   - O que acontece após o signUp

3. Verifique se há algum:
   - Try-catch mal configurado
   - await faltando
   - Erro de tipagem
   - Campo obrigatório faltando

4. Compare com o padrão do Supabase:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
    }
  }
})
```

═══════════════════════════════════════════════════════════

POSSÍVEIS CAUSAS:

1. ❌ Código está tentando criar perfil ANTES do signUp completar
2. ❌ Options.data com campos incorretos ou faltando
3. ❌ Trigger handle_new_user com erro (mas INSERT manual funciona)
4. ❌ Código fazendo INSERT duplicado e causando conflict
5. ❌ Email confirmation desabilitado mas código esperando confirmação

═══════════════════════════════════════════════════════════

AÇÃO IMEDIATA:

Mostre-me o arquivo COMPLETO de:
- app/(auth)/register/page.tsx (linhas 1-100)

Especialmente a função handleRegister completa.

Com isso vou identificar o bug exato no código!