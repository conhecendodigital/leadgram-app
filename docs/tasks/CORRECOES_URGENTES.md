# 🔧 CORREÇÕES URGENTES - GUIA COMPLETO

## ⚠️ EXECUTE PRIMEIRO: SQL Admin Fix

1. Abra o Supabase Dashboard → SQL Editor
2. Copie TODO o conteúdo do arquivo `SQL_ADMIN_FIX.sql`
3. Cole e execute
4. Verifique se aparece "Admin configurado!" no resultado

---

## 🔑 VARIÁVEIS DE AMBIENTE FALTANDO

Adicione no `.env.local` (e também na Vercel):

```env
# Instagram/Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=seu_app_id_facebook
FACEBOOK_APP_SECRET=seu_app_secret
FACEBOOK_REDIRECT_URI=https://seu-dominio.vercel.app/api/instagram/callback

# Supabase Service Role (para webhooks)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Mercado Pago (OPCIONAL - só se for usar)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=seu_public_key
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
```

### Como obter credenciais do Facebook:

1. Acesse: https://developers.facebook.com/apps
2. Crie um novo app ou use um existente
3. Vá em **Produtos** → Adicione **Instagram Basic Display** e **Instagram Graph API**
4. Configure:
   - **Valid OAuth Redirect URIs**: `https://seu-dominio.vercel.app/api/instagram/callback`
   - Copie **App ID** e **App Secret**

---

## 🐛 PROBLEMA: "Não aparece que sou admin"

### Causa:
A migration SQL não foi executada ou o email está incorreto.

### Solução:

1. Execute o `SQL_ADMIN_FIX.sql` no Supabase
2. Verifique se o email está correto: `matheussss.afiliado@gmail.com`
3. Faça logout e login novamente
4. Deve redirecionar automaticamente para `/admin/dashboard`

Se continuar sem funcionar, execute diretamente no SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'matheussss.afiliado@gmail.com';

SELECT email, role FROM profiles WHERE email = 'matheussss.afiliado@gmail.com';
```

---

## 🐛 PROBLEMA: Erro na conexão Instagram

### Causas possíveis:

1. **Falta variáveis de ambiente** (NEXT_PUBLIC_FACEBOOK_APP_ID, etc)
2. **App do Facebook não configurado**
3. **Redirect URI incorreto**

### Solução passo a passo:

#### 1. Configure o App do Facebook:

```
https://developers.facebook.com/apps/
```

- Crie/Abra seu app
- Adicione produtos: **Instagram Graph API** e **Login do Facebook**
- Em **Configurações** → **Básico**:
  - Copie **ID do App** → Vá para `.env.local` → `NEXT_PUBLIC_FACEBOOK_APP_ID`
  - Copie **Chave Secreta** → `FACEBOOK_APP_SECRET`

#### 2. Configure Redirect URI:

No Facebook App → **Instagram Graph API** → **Configurações**:
```
https://seu-dominio.vercel.app/api/instagram/callback
```

E também:
```
http://localhost:3000/api/instagram/callback  (para desenvolvimento)
```

#### 3. Permissões necessárias:

- `instagram_basic`
- `pages_show_list`
- `instagram_manage_insights`
- `pages_read_engagement`

---

## 🐛 PROBLEMA: Erro no Analytics

### Causa:
Dados insuficientes ou busca falhando.

### Solução RÁPIDA:

O analytics usa dados fictícios (mock data) por padrão. O erro deve ser apenas visual.

Se quiser corrigir completamente, os componentes analytics já têm tratamento de erro.

---

## 🐛 PROBLEMA: Página de Configurações

### O que pode estar falhando:

1. **Subscription não existe** → Execute o SQL_ADMIN_FIX.sql
2. **Erro ao buscar dados** → Verifique RLS policies

### Verificação rápida:

```sql
-- Verificar se você tem subscription
SELECT * FROM user_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'matheussss.afiliado@gmail.com');

-- Se não tiver, criar:
INSERT INTO user_subscriptions (user_id, plan_type, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matheussss.afiliado@gmail.com'),
  'free',
  'active'
);
```

---

## 🐛 PROBLEMA: Erro ao buscar perfis (Explore)

### Causa:
Falta Instagram conectado ou API sem permissão.

### Solução:

1. **Primeiro conecte uma conta Instagram** em `/dashboard/instagram`
2. A busca de perfis usa a API do Instagram Graph
3. Precisa ter conta Instagram Business conectada ao Facebook

### Limitações da API:

- Só busca perfis públicos
- Precisa ter Instagram Business Account
- Algumas métricas só funcionam para o próprio perfil

---

## 📊 VERIFICAÇÃO FINAL

Execute estes comandos SQL para verificar se tudo está OK:

```sql
-- 1. Verificar admin
SELECT email, role FROM profiles WHERE email = 'matheussss.afiliado@gmail.com';
-- Deve retornar role = 'admin'

-- 2. Verificar subscription
SELECT * FROM user_subscriptions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'matheussss.afiliado@gmail.com'
);
-- Deve retornar pelo menos 1 linha com plan_type = 'free'

-- 3. Verificar tabelas admin
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_mercadopago', 'user_subscriptions', 'payments');
-- Deve retornar as 3 tabelas

-- 4. Verificar Instagram
SELECT * FROM instagram_accounts;
-- Se tiver dados, Instagram está conectado
```

---

## 🎯 ORDEM DE EXECUÇÃO (IMPORTANTE!)

1. ✅ Execute `SQL_ADMIN_FIX.sql` no Supabase
2. ✅ Adicione variáveis de ambiente no Vercel
3. ✅ Configure App do Facebook
4. ✅ Faça logout/login no app
5. ✅ Teste admin em `/admin/dashboard`
6. ✅ Conecte Instagram em `/dashboard/instagram`
7. ✅ Teste explore em `/dashboard/explore`

---

## 🆘 SE NADA FUNCIONAR

1. Limpe o cache do navegador
2. Faça logout completo
3. Limpe cookies do site
4. Faça login novamente
5. Verifique o console do navegador (F12) para erros específicos

---

## 📞 DEBUG

Para ver erros detalhados, verifique:

1. **Vercel Logs** → Functions → Selecione a função com erro
2. **Supabase Logs** → Database → Logs
3. **Console do navegador** → F12 → Console
4. **Network tab** → F12 → Network (veja qual request falhou)

---

✅ **Após executar essas correções, tudo deve funcionar perfeitamente!**
