# Sistema Admin Multi-Tenancy - Guia de Configuração

## Visão Geral

O Leadgram agora possui um sistema completo de multi-tenancy com:
- **Área Admin**: Painel administrativo completo
- **Área Cliente**: Dashboard normal com sistema de planos
- **Integração Mercado Pago**: Pagamentos e assinaturas

---

## 1. Executar Migration no Supabase

### Passo 1: Acessar o Supabase

1. Acesse https://supabase.com
2. Entre no projeto do Leadgram
3. Vá em **SQL Editor**

### Passo 2: Executar o Script

1. Abra o arquivo: `supabase/migrations/20250101000000_admin_system.sql`
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (executar)

### Passo 3: Verificar

Execute para confirmar que as tabelas foram criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_mercadopago', 'user_subscriptions', 'payments');
```

Você deve ver as 3 tabelas listadas.

---

## 2. Adicionar Variável de Ambiente

Adicione ao arquivo `.env.local`:

```env
# Supabase Service Role Key (para webhooks)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Onde encontrar:**
1. Supabase Dashboard → Settings → API
2. Copie a **service_role key** (não é a anon key!)

---

## 3. Configurar Mercado Pago (Admin)

### Passo 1: Obter Credenciais

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta Mercado Pago
3. Vá em **Suas integrações**
4. Clique em **Credenciais**
5. Copie:
   - **Access Token** (começa com `APP_USR-...`)
   - **Public Key** (começa com `APP_USR-...`)

### Passo 2: Conectar no Admin

1. Faça login com o email admin: **matheussss.afiliado@gmail.com**
2. Você será redirecionado para `/admin/dashboard`
3. No menu lateral, clique em **Mercado Pago**
4. Cole as credenciais:
   - Access Token
   - Public Key
5. Marque **Modo de Teste** se for usar credenciais de teste
6. Clique em **Conectar Mercado Pago**

### Passo 3: Configurar Webhook

No painel do Mercado Pago:

1. Vá em **Webhooks**
2. Adicione nova URL:
   ```
   https://seu-dominio.vercel.app/api/mercadopago/webhook
   ```
3. Selecione eventos:
   - Pagamentos
4. Salve

---

## 4. Como Funciona

### Para Admin (Você)

**Acesso:**
- URL: `/admin/dashboard`
- Email: matheussss.afiliado@gmail.com

**Recursos:**
- 📊 Dashboard com métricas
- 👥 Gerenciar clientes
- 💳 Configurar Mercado Pago
- 💰 Ver pagamentos e receita
- 📈 Relatórios

### Para Clientes

**Acesso:**
- URL: `/dashboard`
- Qualquer email (exceto o admin)

**Recursos:**
- Ver e criar ideias
- Conectar Instagram
- **Fazer upgrade de plano**

**Fluxo de Upgrade:**
1. Cliente vai em Configurações → Plano
2. Clica em "Fazer Upgrade"
3. Redireciona para Mercado Pago
4. Após pagamento:
   - Webhook atualiza assinatura automaticamente
   - Cliente tem acesso aos recursos

---

## 5. Planos Disponíveis

| Plano | Preço | Recursos |
|-------|-------|----------|
| Free | R$ 0/mês | 10 ideias, 1 conta Instagram |
| Pro | R$ 49/mês | 100 ideias, 3 contas, métricas avançadas |
| Premium | R$ 99/mês | Ilimitado, 10 contas, IA avançada |

---

## 6. Testes

### Testar Modo Admin

1. Faça login com: `matheussss.afiliado@gmail.com`
2. Deve redirecionar para `/admin/dashboard`
3. Veja os cards de estatísticas
4. Navegue pelas páginas do menu

### Testar Modo Cliente

1. Crie nova conta com email diferente
2. Deve redirecionar para `/dashboard` (cliente normal)
3. Vá em Configurações → Plano
4. Clique em "Fazer Upgrade para Pro"
5. Deve abrir página do Mercado Pago

### Testar Webhook (Produção)

1. Use credenciais **de teste** do Mercado Pago
2. Faça um pagamento de teste
3. Verifique no Supabase:
   ```sql
   SELECT * FROM user_subscriptions;
   SELECT * FROM payments;
   ```
4. A assinatura deve estar como `active`

---

## 7. Estrutura de Arquivos Criados

```
📁 app/
  📁 (admin)/
    📄 layout.tsx               # Layout admin
    📁 admin/
      📁 dashboard/
        📄 page.tsx             # Dashboard admin
      📁 customers/
        📄 page.tsx             # Gestão clientes
      📁 mercadopago/
        📄 page.tsx             # Config MP
  📁 api/
    📁 admin/
      📁 mercadopago/
        📁 connect/
          📄 route.ts           # Conectar MP (admin)
    📁 checkout/
      📁 create-preference/
        📄 route.ts             # Criar pagamento
    📁 mercadopago/
      📁 webhook/
        📄 route.ts             # Receber notificações

📁 components/
  📁 admin/
    📄 admin-sidebar.tsx        # Menu lateral admin
    📄 admin-header.tsx         # Cabeçalho admin
    📄 admin-stats-cards.tsx    # Cards métricas
    📄 revenue-chart.tsx        # Gráfico receita
    📄 plan-distribution.tsx    # Gráfico planos
    📄 recent-customers.tsx     # Clientes recentes
    📄 customers-table.tsx      # Tabela clientes
    📄 customers-stats.tsx      # Stats clientes
    📄 mercadopago-connection.tsx # Conexão MP

📁 lib/
  📄 roles.ts                   # Sistema de roles

📁 supabase/
  📁 migrations/
    📄 20250101000000_admin_system.sql  # Migration

📄 middleware.ts                # Controle acesso
```

---

## 8. Segurança

### RLS (Row Level Security)

Todas as tabelas têm políticas de segurança:

**admin_mercadopago:**
- Apenas admin pode ver/editar

**user_subscriptions:**
- Usuários veem apenas a própria assinatura
- Admin vê todas

**payments:**
- Usuários veem apenas os próprios pagamentos
- Admin vê todos

### Middleware

Protege rotas automaticamente:
- `/admin/*` → Apenas admin
- `/dashboard/*` → Usuários autenticados
- Redirecionamento automático baseado em role

---

## 9. Próximos Passos

### Páginas Admin Faltantes

Ainda podem ser criadas:
- `/admin/plans` - Gerenciar planos e preços
- `/admin/payments` - Lista de todos pagamentos
- `/admin/reports` - Relatórios detalhados
- `/admin/settings` - Configurações do sistema

### Melhorias Sugeridas

1. **Email notifications** quando cliente faz upgrade
2. **Dashboard do cliente** mostrando uso do plano
3. **Limites de recursos** baseados no plano
4. **Renovação automática** de assinaturas

---

## 10. Troubleshooting

### Admin não redireciona para /admin/dashboard

**Problema:** Middleware não reconhece como admin

**Solução:**
1. Verifique o email no banco:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'matheussss.afiliado@gmail.com';
   ```
2. Se `role` não for `admin`, execute:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'matheussss.afiliado@gmail.com';
   ```

### Webhook não está atualizando assinatura

**Problema:** Webhook não está sendo chamado

**Soluções:**
1. Verifique no Mercado Pago se webhook está configurado
2. Verifique logs do Vercel
3. Teste localmente com ngrok:
   ```bash
   ngrok http 3000
   # Use a URL do ngrok como webhook
   ```

### Erro ao criar pagamento

**Problema:** "Mercado Pago não configurado"

**Solução:**
1. Faça login como admin
2. Vá em Mercado Pago
3. Conecte suas credenciais
4. Verifique no Supabase:
   ```sql
   SELECT * FROM admin_mercadopago WHERE is_active = true;
   ```

---

## 11. Suporte

Se tiver problemas:

1. Verifique logs do Vercel
2. Verifique SQL no Supabase
3. Teste com credenciais de teste do MP

---

✅ **Sistema pronto para uso!**

Login admin: `matheussss.afiliado@gmail.com`
