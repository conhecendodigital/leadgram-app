# Configuração do Supabase Dashboard

Este documento contém todas as configurações necessárias no Supabase Dashboard para o funcionamento correto da autenticação e emails.

## 1. Confirmação de Email

### Passo a passo:

1. Acesse: **Authentication > Providers** (menu lateral)
2. Na seção **User Signups**, localize a opção **"Confirm email"**
3. Ative o toggle (deve ficar verde)
4. Clique em **"Save changes"** no canto inferior direito

### O que isso faz:
- Usuários precisarão confirmar o endereço de email antes de fazer login pela primeira vez
- Ao se cadastrar, o usuário receberá um email com link de confirmação
- Só após clicar no link ele poderá acessar o dashboard

---

## 2. URLs de Redirecionamento

### Passo a passo:

1. Acesse: **Authentication > URL Configuration** (menu lateral)
2. Configure as seguintes URLs:

#### Site URL:
```
https://formulareal.online
```

#### Redirect URLs (adicione todas estas URLs):
```
https://formulareal.online/auth/callback
https://formulareal.online/reset-password
https://formulareal.online/auth/verify-device
https://formulareal.online/dashboard
https://formulareal.online/api/instagram/callback
https://formulareal.online/api/google-drive/callback
```

3. Clique em **"Save"**

### Por que isso é importante:
- O Supabase só permite redirecionamentos para URLs configuradas aqui
- Se a URL não estiver na lista, o redirecionamento falhará
- Inclui callbacks do Instagram e Google Drive para OAuth

---

## 3. Templates de Email

### Passo a passo:

1. Acesse: **Authentication > Email Templates** (menu lateral)
2. Configure os seguintes templates:

#### 3.1. Confirm signup (Confirmação de cadastro)

**Subject:**
```
Confirme sua conta no Leadgram
```

**Body:**
```html
<h2>Bem-vindo ao Leadgram!</h2>
<p>Obrigado por se cadastrar. Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar minha conta</a></p>
<p>Este link expira em 24 horas.</p>
<p>Se você não se cadastrou no Leadgram, ignore este email.</p>
```

#### 3.2. Reset password (Recuperação de senha)

**Subject:**
```
Recuperação de senha - Leadgram
```

**Body:**
```html
<h2>Redefinir sua senha</h2>
<p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir minha senha</a></p>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou esta recuperação, ignore este email.</p>
```

#### 3.3. Magic Link (Verificação de dispositivo)

**Subject:**
```
Novo dispositivo detectado - Leadgram
```

**Body:**
```html
<h2>Novo dispositivo detectado</h2>
<p>Detectamos uma tentativa de login de um novo dispositivo. Clique no link abaixo para confirmar:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar dispositivo</a></p>
<p>Este link expira em 1 hora.</p>
<p>Se não foi você, ignore este email e sua conta permanecerá segura.</p>
```

4. Clique em **"Save"** em cada template

---

## 4. SMTP (Email Personalizado) - OPCIONAL

Por padrão, o Supabase usa um serviço de email integrado, mas tem limitações de taxa. Para produção, recomenda-se configurar um SMTP customizado.

### Passo a passo:

1. Acesse: **Authentication > Email Templates > SMTP Settings**
2. Clique em **"Set up custom SMTP"**
3. Configure com seu provedor de email (Gmail, SendGrid, AWS SES, etc.)

**Exemplo de configuração (SendGrid):**
- **SMTP Host:** smtp.sendgrid.net
- **SMTP Port:** 587
- **SMTP Username:** apikey
- **SMTP Password:** [sua API key do SendGrid]
- **Sender Email:** noreply@formulareal.online
- **Sender Name:** Leadgram

4. Clique em **"Save"**
5. Teste enviando um email de teste

---

## 5. Verificação das Configurações

### Como testar se está tudo correto:

1. **Teste de Cadastro:**
   - Acesse: https://formulareal.online/register
   - Crie uma conta nova
   - Verifique se recebeu o email de confirmação
   - Clique no link e veja se é redirecionado para o dashboard

2. **Teste de Recuperação de Senha:**
   - Acesse: https://formulareal.online/login
   - Clique em "Esqueci minha senha"
   - Digite seu email
   - Verifique se recebeu o email de recuperação
   - Clique no link e veja se consegue redefinir a senha

3. **Teste de Novo Dispositivo:**
   - Faça login em um novo navegador/dispositivo
   - Verifique se recebe o email de verificação de dispositivo
   - Clique no link e veja se consegue acessar

---

## 6. Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado corretamente:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tgblybswivkktbehkblu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua key]
NEXT_PUBLIC_SUPABASE_PROJECT_ID=tgblybswivkktbehkblu
SUPABASE_SERVICE_ROLE_KEY=[sua key]

# URLs da Aplicação (PRODUÇÃO)
NEXT_PUBLIC_SITE_URL=https://formulareal.online
NEXT_PUBLIC_API_URL=https://formulareal.online
NEXT_PUBLIC_APP_URL=https://formulareal.online

# Instagram/Facebook OAuth
FACEBOOK_REDIRECT_URI=https://formulareal.online/api/instagram/callback
```

---

## 7. Troubleshooting

### Problema: Email não chega
- Verifique a caixa de spam
- Confirme que o SMTP está configurado corretamente (se customizado)
- Veja os logs em: **Authentication > Logs**

### Problema: Redirecionamento para localhost
- Verifique se as URLs estão corretas em **URL Configuration**
- Confirme que `.env.local` tem `NEXT_PUBLIC_SITE_URL=https://formulareal.online`
- Faça rebuild da aplicação após alterar variáveis de ambiente

### Problema: Link expirado
- Links de confirmação expiram em 24 horas
- Links de reset de senha expiram em 1 hora
- Links de magic link expiram em 1 hora
- Solicite um novo link se expirou

---

## 8. Recursos Adicionais

- [Documentação oficial do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuração de SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
