# Sistema de Autenticação com OTP de 6 Dígitos

## 📋 Visão Geral

Sistema completo de autenticação usando códigos OTP (One-Time Password) de 6 dígitos para:
- ✅ Verificação de email no cadastro
- ✅ Recuperação de senha (reset password)
- ✅ Verificação de dispositivo automática

---

## 🔐 Como Funciona a Segurança

### Verificação de Dispositivo Inteligente

**Conceito**: O OTP de email serve como verificação de dispositivo.

**Fluxo:**
1. **Cadastro**: Usuário verifica email com OTP → Dispositivo marcado como confiável
2. **Login**: Usuário faz login normal com email/senha → Dispositivo marcado como confiável
3. **Registro**: Sistema mantém registro de todos os dispositivos para auditoria

**Por quê isso é seguro?**
- Para verificar o email, o usuário precisa ter acesso à caixa de entrada
- Se tem acesso ao email, é o dono legítimo da conta
- O dispositivo usado para verificar o email é automaticamente confiável
- Logins futuros desse dispositivo são permitidos normalmente
- Sistema continua registrando dispositivos para análise de segurança

---

## 🚀 Fluxos Completos

### 1. Cadastro + Verificação de Email

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário preenche formulário em /register                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Conta criada no Supabase (email NÃO confirmado)         │
│    POST /api/otp/send                                       │
│    - Gera código de 6 dígitos                              │
│    - Salva em email_otp_codes (expira em 15 min)          │
│    - Envia email com código                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirecionado para /verify-email?email=...              │
│    - Usuário recebe email com código                       │
│    - Interface com 6 campos de input                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuário digita código de 6 dígitos                      │
│    POST /api/otp/verify                                     │
│    - Valida código                                          │
│    - Confirma email no Supabase                            │
│    - Gera token de sessão (magic link)                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Cria sessão no navegador                                │
│    - supabase.auth.verifyOtp()                             │
│    - Marca dispositivo como confiável                      │
│    - Redireciona para /dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Login Normal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário preenche email/senha em /login                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/login                                     │
│    - Valida credenciais com Supabase                       │
│    - Cria sessão automaticamente                           │
│    - Marca dispositivo como confiável                      │
│    - Registra login bem-sucedido                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redireciona para /dashboard                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Recuperação de Senha

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Esqueci minha senha" em /login           │
│    Redirecionado para /forgot-password                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Digita email                                             │
│    POST /api/otp/send (purpose: password_reset)            │
│    - Gera código de 6 dígitos                              │
│    - Salva em email_otp_codes (expira em 60 min)          │
│    - Envia email com código                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirecionado para /reset-password?email=...            │
│    PASSO 1: Verificar código OTP                           │
│    - Usuário digita 6 dígitos                              │
│    - POST /api/otp/verify                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PASSO 2: Redefinir senha                                │
│    - Código validado ✅                                     │
│    - Formulário para nova senha                            │
│    - POST /api/auth/update-password                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Senha atualizada!                                        │
│    Redireciona para /login?reset=success                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Estrutura do Banco de Dados

### Tabela: `email_otp_codes`

```sql
CREATE TABLE email_otp_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  code TEXT NOT NULL,              -- Código de 6 dígitos
  purpose TEXT NOT NULL,            -- 'email_verification' ou 'password_reset'
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,       -- Contador de tentativas
  max_attempts INTEGER DEFAULT 5,   -- Máximo: 5 tentativas
  expires_at TIMESTAMPTZ NOT NULL,  -- Expiração
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);
```

**Regras:**
- Email verification: expira em **15 minutos**
- Password reset: expira em **60 minutos**
- Máximo de **5 tentativas** por código
- Códigos verificados são marcados como `verified = true`
- Cleanup automático de códigos expirados

---

## 🔧 APIs Criadas

### 1. POST /api/otp/send
Gera e envia código OTP

**Request:**
```json
{
  "email": "usuario@email.com",
  "purpose": "email_verification" | "password_reset",
  "userId": "opcional-para-email-verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código enviado com sucesso. Verifique seu email."
}
```

### 2. POST /api/otp/verify
Verifica código OTP

**Request:**
```json
{
  "email": "usuario@email.com",
  "code": "123456",
  "purpose": "email_verification" | "password_reset"
}
```

**Response (email_verification):**
```json
{
  "success": true,
  "message": "Email verificado com sucesso!",
  "userId": "user-uuid",
  "accessToken": "token-para-criar-sessao",
  "tokenType": "magiclink"
}
```

**Response (password_reset):**
```json
{
  "success": true,
  "message": "Código verificado com sucesso!",
  "otpId": "otp-uuid",
  "userId": "user-uuid"
}
```

### 3. POST /api/auth/update-password
Atualiza senha após verificação de OTP

**Request:**
```json
{
  "userId": "user-uuid",
  "newPassword": "nova-senha-segura"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Senha atualizada com sucesso"
}
```

---

## 🎨 UX / Interface

### Componente de OTP (6 dígitos)

**Recursos:**
- ✅ 6 campos de input individuais
- ✅ Auto-foco no próximo campo ao digitar
- ✅ Backspace navega para campo anterior
- ✅ **Paste support**: colar código completo (ex: 123456)
- ✅ **Auto-verificação**: ao preencher 6° dígito, verifica automaticamente
- ✅ Validação apenas de números
- ✅ Contador de tentativas restantes
- ✅ Botão "Reenviar código"
- ✅ Mensagens de erro claras
- ✅ Loading states

**Páginas:**
- `/verify-email` - Verificação de email após cadastro
- `/reset-password` - Reset de senha em 2 passos (código → nova senha)

---

## ⚙️ Configurações Necessárias

### Supabase Dashboard

1. **Desabilitar "Confirm Email"**
   - Local: Authentication > Providers > Email
   - **DESMARCAR** "Confirm email"
   - Motivo: Usamos nosso próprio sistema OTP

2. **URLs de Redirecionamento** (manter configuradas)
   ```
   https://formulareal.online/auth/callback
   https://formulareal.online/dashboard
   https://formulareal.online/api/instagram/callback
   https://formulareal.online/api/google-drive/callback
   ```

3. **Aplicar Migration**
   - Executar: `supabase/migrations/20251122000000_email_otp_codes.sql`
   - Cria tabela `email_otp_codes`

---

## 🔒 Segurança

### Proteções Implementadas

1. **Rate Limiting**: Máximo 5 tentativas por código
2. **Expiração**: Códigos têm tempo de vida limitado
3. **Código Único**: Cada código é usado apenas uma vez
4. **Invalidação**: Códigos anteriores são invalidados ao gerar novo
5. **Cleanup**: Códigos expirados são removidos automaticamente
6. **Hash**: Comunicação via HTTPS
7. **Audit Trail**: Registro de dispositivos e logins

### Sobre Dispositivos

**Sistema Passivo:**
- Registra todos os dispositivos para auditoria
- Não bloqueia logins de novos dispositivos
- Usa OTP de email como verificação inicial
- Mantém histórico para análise de segurança

**Futuro (opcional):**
- Alertas de login em novo dispositivo
- Opção de bloquear dispositivos específicos
- 2FA adicional para ações sensíveis

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos
```
supabase/migrations/20251122000000_email_otp_codes.sql
lib/services/otp-service.ts
app/api/otp/send/route.ts
app/api/otp/verify/route.ts
app/api/auth/update-password/route.ts
app/(auth)/verify-email/page.tsx
```

### Arquivos Modificados
```
lib/services/email-service.ts         (+ templates OTP)
app/(auth)/register/page.tsx          (usa OTP)
app/(auth)/forgot-password/page.tsx   (usa OTP)
app/(auth)/reset-password/page.tsx    (reescrito para OTP)
app/api/auth/login/route.ts           (desabilitou verificação forçada)
```

---

## ✅ Checklist de Deploy

- [ ] Aplicar migration `20251122000000_email_otp_codes.sql` no Supabase
- [ ] Desabilitar "Confirm email" no Supabase Dashboard
- [ ] Fazer git commit e push
- [ ] Fazer redeploy da aplicação
- [ ] Testar cadastro completo (cadastro → código → dashboard)
- [ ] Testar login normal
- [ ] Testar reset de senha (email → código → nova senha → login)

---

**Criado em:** 22/11/2025
**Status:** ✅ Implementado e pronto para deploy
