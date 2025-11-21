# Setup de Verificação de Email - Leadgram

## ✅ Implementação Concluída

A verificação de email por link de confirmação foi implementada com sucesso!

---

## O que foi feito:

### 1. **Configuração Supabase** ✅
- Habilitado `enable_confirmations = true` no `supabase/config.toml`
- Configuração SMTP preparada para produção
- Email de confirmação ativado para novos cadastros

### 2. **Interface de Usuário** ✅
- Tela de confirmação de email enviado
- Mensagem clara com o email do usuário
- Link para voltar ao login
- Aviso sobre verificar spam

### 3. **Fluxo Completo** ✅
```
Usuário preenche cadastro
      ↓
Cria conta no Supabase
      ↓
Recebe email com link de confirmação
      ↓
Clica no link
      ↓
Conta confirmada automaticamente
      ↓
Pode fazer login
```

---

## Como funciona agora:

### Em Desenvolvimento (Local):

**Emails são capturados pelo Inbucket:**
- Não são enviados de verdade
- Acesse: http://localhost:54324
- Veja todos os emails enviados
- Clique no link de confirmação

### Em Produção:

**Precisa configurar SMTP:**

1. **Escolher provedor de email** (recomendado: Resend ou SendGrid)
2. **Configurar no Supabase Dashboard**
3. **Emails serão enviados de verdade**

---

## Configuração para Produção

### Opção 1: Resend (Recomendado) 🌟

**Vantagens:**
- ✅ Grátis até 3000 emails/mês
- ✅ Muito fácil de configurar
- ✅ Interface moderna
- ✅ Ótima entregabilidade

**Passo a passo:**

1. **Criar conta:** https://resend.com

2. **Verificar domínio formulareal.online:**
   - No painel do Resend, adicionar domínio
   - Copiar os registros DNS (MX, TXT, CNAME)
   - Adicionar no gerenciador DNS do domínio
   - Aguardar verificação (alguns minutos)

3. **Criar API Key:**
   - Settings > API Keys > Create
   - Copiar a chave `re_xxxxxxxxxxxxxx`

4. **Configurar no Supabase Dashboard:**
   ```
   Acesse: https://supabase.com/dashboard/project/SEU_PROJETO_ID/settings/auth

   Seção: SMTP Settings

   Enable Custom SMTP: ✅ ON
   Sender email: noreply@formulareal.online
   Sender name: Leadgram
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Cole sua API Key do Resend]
   ```

5. **Testar:**
   - Criar nova conta em formulareal.online
   - Verificar se email chegou
   - Clicar no link de confirmação
   - Fazer login

---

### Opção 2: SendGrid (Alternativa)

**Vantagens:**
- ✅ Grátis até 100 emails/dia
- ✅ Muito confiável
- ✅ Usado por grandes empresas

**Passo a passo:**

1. **Criar conta:** https://sendgrid.com

2. **Verificar domínio:**
   - Settings > Sender Authentication > Authenticate Your Domain
   - Adicionar registros DNS
   - Aguardar verificação

3. **Criar API Key:**
   - Settings > API Keys > Create API Key
   - Copiar a chave `SG.xxxxxxxxxxxxxx`

4. **Configurar no Supabase Dashboard:**
   ```
   Acesse: https://supabase.com/dashboard/project/SEU_PROJETO_ID/settings/auth

   Enable Custom SMTP: ✅ ON
   Sender email: noreply@formulareal.online
   Sender name: Leadgram
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Cole sua API Key do SendGrid]
   ```

---

### Opção 3: Supabase Email Nativo (Mais Fácil mas Limitado)

**Vantagens:**
- ✅ Já funciona automaticamente
- ✅ Zero configuração

**Desvantagens:**
- ❌ Emails podem cair em spam
- ❌ Não é profissional
- ❌ Usa domínio do Supabase

**Usar apenas para:**
- Testes iniciais
- MVP muito cedo

**Não recomendado para produção séria!**

---

## Templates de Email

### Template Padrão (Supabase)

O Supabase já envia um email bonito por padrão com:
- Logo do app
- Mensagem de boas-vindas
- Botão "Confirmar Email"
- Link alternativo se botão não funcionar

### Customizar Template (Opcional)

**Se quiser customizar o visual:**

1. **Criar template HTML:**
   ```html
   <!-- supabase/templates/confirm.html -->
   <!DOCTYPE html>
   <html>
   <head>
     <style>
       body {
         font-family: Arial, sans-serif;
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         padding: 40px;
       }
       .container {
         background: white;
         border-radius: 12px;
         padding: 40px;
         text-align: center;
       }
       .button {
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         color: white;
         padding: 15px 30px;
         text-decoration: none;
         border-radius: 8px;
         display: inline-block;
         margin: 20px 0;
       }
     </style>
   </head>
   <body>
     <div class="container">
       <h1>✨ Bem-vindo ao Leadgram!</h1>
       <p>Clique no botão abaixo para confirmar seu email:</p>
       <a href="{{ .ConfirmationURL }}" class="button">Confirmar Email</a>
       <p><small>Ou copie este link: {{ .ConfirmationURL }}</small></p>
     </div>
   </body>
   </html>
   ```

2. **Configurar no Supabase Dashboard:**
   ```
   Auth > Email Templates > Confirm signup

   Cole o HTML customizado
   ```

---

## Testando Localmente

### 1. Iniciar Supabase Local:
```bash
npx supabase start
```

### 2. Acessar Inbucket (Email Testing):
```
http://localhost:54324
```

### 3. Criar conta de teste:
```
http://localhost:3000/register
```

### 4. Ver email no Inbucket:
- Abrir http://localhost:54324
- Clicar no email recebido
- Clicar no link de confirmação

### 5. Fazer login:
```
http://localhost:3000/login
```

---

## Troubleshooting

### Problema: "Email not confirmed"

**Causa:** Usuário tentou fazer login antes de confirmar email

**Solução:**
- Verificar email e clicar no link
- Ou reenviar email de confirmação

**Como reenviar:**
```typescript
// No código ou via API
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'usuario@email.com'
})
```

### Problema: Email não chega

**Possíveis causas:**
1. Email caiu em spam → Verificar pasta spam
2. SMTP mal configurado → Verificar credenciais
3. Domínio não verificado → Verificar DNS

**Debug:**
- Verificar logs do Supabase Dashboard
- Testar com outro email
- Verificar configuração SMTP

### Problema: Link de confirmação expirado

**Causa:** Token expira em 24 horas (padrão Supabase)

**Solução:**
- Reenviar email de confirmação
- Ou aumentar tempo de expiração no Supabase Dashboard

---

## Fluxo de Reenvio de Email

**Adicionar botão "Reenviar email" na página de login (opcional):**

```typescript
const handleResendConfirmation = async () => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: emailInput
  })

  if (error) {
    alert('Erro ao reenviar email')
  } else {
    alert('Email reenviado! Verifique sua caixa de entrada.')
  }
}
```

---

## Segurança

### Proteções Implementadas:

✅ **Rate Limiting:**
- Máximo 2 emails/hora em dev
- Configurável em produção

✅ **Token Único:**
- Cada link é único e válido por 24h
- Não pode ser reutilizado

✅ **CSRF Protection:**
- Links contêm token de segurança
- Validados pelo Supabase

✅ **Email Verification:**
- Confirma que usuário possui acesso ao email
- Reduz contas fake

---

## Conformidade (Facebook/Google)

### ✅ Requisitos Atendidos:

**Facebook/Instagram:**
- ✅ Email verification implementado
- ✅ Usuários não podem usar app sem confirmar email
- ✅ Segurança adicional para App Review

**Google OAuth:**
- ✅ Email verificado antes de conectar serviços
- ✅ Reduz risco de abuso
- ✅ Demonstra preocupação com segurança

**LGPD:**
- ✅ Confirma que usuário forneceu email correto
- ✅ Comunicação oficial pode ser enviada
- ✅ Direito de exclusão pode ser exercido

---

## Próximos Passos

### 1. Agora (Desenvolvimento):
- ✅ Testar fluxo completo localmente
- ✅ Verificar emails no Inbucket
- ✅ Confirmar que login funciona após confirmação

### 2. Antes do Deploy (Produção):
- [ ] Escolher provedor SMTP (Resend ou SendGrid)
- [ ] Criar conta no provedor
- [ ] Verificar domínio formulareal.online
- [ ] Configurar SMTP no Supabase Dashboard
- [ ] Testar com email real

### 3. Após Deploy:
- [ ] Criar conta de teste em produção
- [ ] Verificar se email chega
- [ ] Testar link de confirmação
- [ ] Monitorar taxa de entrega (Dashboard do provedor)

---

## Checklist de Deploy

### Antes de fazer deploy:

- [x] Email confirmation habilitado no config.toml
- [x] UI de confirmação implementada
- [x] Mensagens claras para o usuário
- [ ] Provedor SMTP escolhido
- [ ] Conta criada no provedor
- [ ] Domínio verificado
- [ ] SMTP configurado no Supabase Dashboard
- [ ] Testado com email real

### Após deploy:

- [ ] Criar conta teste em produção
- [ ] Verificar recebimento de email
- [ ] Testar confirmação de email
- [ ] Testar login após confirmação
- [ ] Verificar logs de email no provedor
- [ ] Monitorar taxa de spam

---

## Custos

### Resend:
- **Grátis:** 3000 emails/mês
- **Pago:** $20/mês = 50.000 emails

### SendGrid:
- **Grátis:** 100 emails/dia (3000/mês)
- **Pago:** $19.95/mês = 50.000 emails

### Estimativa para Leadgram:
- **Cadastros/dia:** ~10-50
- **Emails/mês:** ~300-1500
- **Conclusão:** **Plano gratuito é suficiente!**

---

## Suporte

### Documentação Oficial:

**Supabase Email:**
- https://supabase.com/docs/guides/auth/auth-email

**Resend:**
- https://resend.com/docs

**SendGrid:**
- https://docs.sendgrid.com

### Ajuda:

Se tiver problemas:
1. Verificar logs do Supabase Dashboard
2. Verificar logs do provedor de email
3. Consultar documentação acima
4. Me avisar para ajudar!

---

## Resumo

### ✅ O que está pronto:
- Código implementado
- UI de confirmação
- Fluxo completo testado localmente
- Configuração preparada para produção

### 📋 O que falta fazer:
- Configurar SMTP em produção (escolher Resend ou SendGrid)
- Verificar domínio
- Testar com emails reais

### ⏱️ Tempo estimado:
- **Configuração SMTP:** 30-45 minutos
- **Testes em produção:** 15 minutos
- **Total:** ~1 hora

---

**Pronto para deploy!** 🚀

Quando configurar o SMTP em produção, a verificação de email vai funcionar perfeitamente!

---

**Documento criado em:** 21 de novembro de 2025
**Implementação:** Concluída
**Status:** Aguardando configuração SMTP em produção
