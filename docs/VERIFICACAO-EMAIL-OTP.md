# Sistema de Verificação por Email - Leadgram

## Proposta de Implementação

Este documento apresenta **duas soluções** para adicionar verificação de código por email no processo de login/cadastro do Leadgram.

---

## Análise da Situação Atual

### ✅ O que já existe:

**Configuração Supabase:**
- Email OTP configurado (6 dígitos, expira em 1 hora)
- Rate limiting configurado (2 emails/hora em dev)
- Sistema de email testado via Inbucket (dev)

**Código Atual:**
- Login com sistema de segurança (rate limiting, tentativas)
- Cadastro com auto-login ativo
- Email confirmation **desabilitado** (linha 176 do config.toml)

### ⚠️ O que falta:

- Verificação de email no cadastro
- Sistema de OTP (One-Time Password) por email
- UI para digitar código de verificação

---

## Opção 1: Email Confirmation Link (Mais Simples) ✅

### Como Funciona:

1. Usuário cria conta
2. Supabase envia email com **link de confirmação**
3. Usuário clica no link
4. Conta é confirmada automaticamente
5. Usuário pode fazer login

### Vantagens:

- ✅ **Muito fácil de implementar** (apenas configuração)
- ✅ **Zero código customizado**
- ✅ **Padrão da maioria dos sites**
- ✅ **Supabase cuida de tudo**

### Desvantagens:

- ❌ Não é código de 6 dígitos (é link)
- ❌ Menos moderno que OTP
- ❌ Email pode cair em spam

### Implementação:

#### Passo 1: Habilitar Email Confirmation

**Arquivo:** `supabase/config.toml` (linha 176)

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true  # ← MUDAR DE false PARA true
secure_password_change = false
max_frequency = "1s"
otp_length = 6
otp_expiry = 3600
```

#### Passo 2: Configurar SMTP (Produção)

**Descomentar e configurar no Vercel:**

```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "suporte@formulareal.online"
sender_name = "Leadgram"
```

#### Passo 3: Atualizar UI de Cadastro

**Arquivo:** `app/(auth)/register/page.tsx` (linha 62-67)

Apenas ajustar mensagem (já existe!):

```typescript
// O código atual já trata isso:
} else {
  // Email confirmation está ativado - mostrar mensagem
  setError('Conta criada! Por favor, verifique seu email para confirmar.')
  setTimeout(() => {
    router.push('/login')
  }, 3000)
}
```

#### Passo 4: Customizar Template de Email (Opcional)

```html
<!-- supabase/templates/confirm.html -->
<h2>Confirme seu email</h2>
<p>Olá! Clique no botão abaixo para confirmar sua conta no Leadgram:</p>
<a href="{{ .ConfirmationURL }}">Confirmar Email</a>
```

**Pronto!** Apenas mudar uma configuração e já funciona.

---

## Opção 2: OTP por Email (Código de 6 dígitos) 🔥 RECOMENDADO

### Como Funciona:

1. Usuário cria conta
2. Supabase envia email com **código de 6 dígitos**
3. Usuário digita o código na tela
4. Sistema valida o código
5. Conta é confirmada e login automático

### Vantagens:

- ✅ **Mais moderno e profissional**
- ✅ **Experiência igual Gmail, Instagram, etc**
- ✅ **Não precisa sair do app** (digita código)
- ✅ **Melhor UX**
- ✅ **Facebook/Google vão aprovar fácil** (mostra segurança)

### Desvantagens:

- ❌ Requer mais código customizado
- ❌ Precisa criar UI para digitar código

### Implementação Completa:

#### Passo 1: Configurar SMTP (Produção)

**SendGrid (Recomendado - Grátis até 100 emails/dia):**

1. Criar conta em https://sendgrid.com
2. Criar API Key
3. Adicionar no Vercel:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxx
   ```

**Ou usar Resend (Moderno - Grátis até 3000 emails/mês):**

1. Criar conta em https://resend.com
2. Verificar domínio formulareal.online
3. Criar API Key
4. Adicionar no Vercel:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```

#### Passo 2: API de Envio de OTP

**Criar:** `app/api/auth/send-otp/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Enviar OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Não criar usuário se não existir
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Erro ao enviar OTP:', error)
      return NextResponse.json({ error: 'Erro ao enviar código' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado para seu email',
    })
  } catch (error) {
    console.error('Erro no envio de OTP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
```

#### Passo 3: API de Verificação de OTP

**Criar:** `app/api/auth/verify-otp/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Verificar OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      console.error('Erro ao verificar OTP:', error)
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: 'Falha na verificação' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso',
      user: data.user,
    })
  } catch (error) {
    console.error('Erro na verificação de OTP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
```

#### Passo 4: Componente de Verificação OTP

**Criar:** `components/auth/verify-otp.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'

interface VerifyOTPProps {
  email: string
  onBack: () => void
}

export default function VerifyOTP({ email, onBack }: VerifyOTPProps) {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  // Auto-focus no próximo input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Apenas 1 dígito

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit quando preencher todos
    if (index === 5 && value) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const token = code || otp.join('')

    if (token.length !== 6) {
      setError('Digite o código de 6 dígitos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Código inválido')
      }

      // Verificação bem-sucedida
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código')
      setOtp(['', '', '', '', '', '']) // Limpar código
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Erro ao reenviar código')
      }

      setError('Novo código enviado!')
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      setError('Erro ao reenviar código. Tente novamente.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verifique seu email
        </h2>
        <p className="text-gray-600">
          Enviamos um código de 6 dígitos para
        </p>
        <p className="text-primary font-semibold">{email}</p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-3 rounded-xl text-sm text-center ${
          error.includes('enviado')
            ? 'bg-green-50 border border-green-200 text-green-600'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={() => handleVerify()}
        disabled={loading || otp.join('').length !== 6}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Verificar Código
          </>
        )}
      </button>

      {/* Resend Code */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Não recebeu o código?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-primary hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {resending ? 'Reenviando...' : 'Reenviar'}
          </button>
        </p>

        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Voltar para cadastro
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 text-center">
          O código expira em <strong>1 hora</strong>. Verifique sua caixa de spam se não encontrar o email.
        </p>
      </div>
    </div>
  )
}
```

#### Passo 5: Atualizar Página de Registro

**Arquivo:** `app/(auth)/register/page.tsx`

Adicionar estado para mostrar tela de OTP:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'
import VerifyOTP from '@/components/auth/verify-otp'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOTP, setShowOTP] = useState(false) // ← NOVO

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Criar usuário (SEM auto-confirm)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        console.error('Erro no signUp:', signUpError)
        throw signUpError
      }

      if (!data.user) {
        throw new Error('Erro ao criar usuário')
      }

      // 2. Enviar OTP
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!otpResponse.ok) {
        throw new Error('Erro ao enviar código de verificação')
      }

      // 3. Mostrar tela de OTP
      setShowOTP(true)
    } catch (err) {
      console.error('Erro ao criar conta:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  // Se deve mostrar tela de OTP
  if (showOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <VerifyOTP email={email} onBack={() => setShowOTP(false)} />
          </div>
        </div>
      </div>
    )
  }

  // ... resto do código de registro permanece igual
}
```

#### Passo 6: Template de Email Customizado

**Criar:** `supabase/templates/otp.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Seu código de verificação - Leadgram</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
    }
    .code {
      background: white;
      color: #667eea;
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
      display: inline-block;
    }
    .message {
      color: white;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">✨ Leadgram</div>

    <h1 style="color: white; font-size: 24px; margin: 20px 0;">
      Seu Código de Verificação
    </h1>

    <p class="message">
      Use o código abaixo para confirmar seu email:
    </p>

    <div class="code">{{ .Token }}</div>

    <p class="message">
      Este código expira em <strong>1 hora</strong>.
    </p>

    <div class="footer">
      <p>Se você não solicitou este código, ignore este email.</p>
      <p>© 2025 Leadgram. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
```

#### Passo 7: Configurar Template no Supabase

**Arquivo:** `supabase/config.toml`

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false  # Manter false (usamos OTP)
secure_password_change = false
max_frequency = "1s"
otp_length = 6
otp_expiry = 3600

# Configurar template customizado
[auth.email.template.magic_link]
subject = "Seu código de verificação - Leadgram"
content_path = "./supabase/templates/otp.html"
```

---

## Comparação das Opções

| Aspecto | Opção 1: Link | Opção 2: OTP (Código) |
|---------|---------------|------------------------|
| **Facilidade** | ⭐⭐⭐⭐⭐ Muito fácil | ⭐⭐⭐ Médio |
| **Código necessário** | Quase zero | Médio (APIs + UI) |
| **UX** | ⭐⭐⭐ Bom | ⭐⭐⭐⭐⭐ Excelente |
| **Modernidade** | ⭐⭐⭐ Padrão | ⭐⭐⭐⭐⭐ Muito moderno |
| **Segurança** | ⭐⭐⭐⭐ Ótima | ⭐⭐⭐⭐⭐ Excelente |
| **Facebook/Google** | ✅ Aprovado | ✅ Aprovado (melhor impressão) |
| **Tempo implementação** | 30 minutos | 3-4 horas |

---

## Recomendação Final

### 🎯 **Para lançar rápido: Opção 1**
Se você quer colocar no ar rapidamente para validar com usuários reais, use a Opção 1 (link de confirmação). É o padrão da maioria dos sites e funciona perfeitamente.

### 🚀 **Para produto profissional: Opção 2**
Se quer impressionar no Facebook/Google App Review e oferecer a melhor experiência, implemente a Opção 2 (OTP). É o que grandes apps usam (Gmail, Instagram, etc).

---

## Checklist de Implementação

### Opção 1 (Link):
- [ ] Mudar `enable_confirmations = true` no config.toml
- [ ] Configurar SMTP (SendGrid ou Resend)
- [ ] Testar registro localmente
- [ ] Customizar template de email (opcional)
- [ ] Deploy e testar em produção

**Tempo estimado: 30-60 minutos**

### Opção 2 (OTP):
- [ ] Configurar SMTP (SendGrid ou Resend)
- [ ] Criar API `send-otp` route.ts
- [ ] Criar API `verify-otp` route.ts
- [ ] Criar componente `VerifyOTP`
- [ ] Atualizar página de registro
- [ ] Criar template de email customizado
- [ ] Testar fluxo completo localmente
- [ ] Deploy e testar em produção

**Tempo estimado: 3-4 horas**

---

## Serviços de Email Recomendados

### 1. **Resend** (Mais Moderno) ⭐ RECOMENDADO

**Vantagens:**
- ✅ Grátis até 3000 emails/mês
- ✅ Interface moderna
- ✅ Fácil configuração
- ✅ Ótima entregabilidade
- ✅ Analytics incluído

**Setup:**
```bash
# 1. Criar conta: https://resend.com
# 2. Verificar domínio formulareal.online
# 3. Criar API Key
# 4. Adicionar no Vercel:
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

### 2. **SendGrid** (Mais Estabelecido)

**Vantagens:**
- ✅ Grátis até 100 emails/dia
- ✅ Muito confiável
- ✅ Usado por grandes empresas
- ✅ Boa documentação

**Setup:**
```bash
# 1. Criar conta: https://sendgrid.com
# 2. Criar API Key
# 3. Adicionar no Vercel:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
```

### 3. **Supabase Email** (Mais Integrado)

**Vantagens:**
- ✅ Já integrado
- ✅ Grátis (limitado)
- ✅ Zero configuração extra

**Desvantagens:**
- ❌ Emails podem cair em spam
- ❌ Menos controle

---

## Próximos Passos

### Se escolher Opção 1:
1. Me avise que quer ir com link de confirmação
2. Faço a configuração para você
3. Testamos juntos

### Se escolher Opção 2:
1. Me avise que quer ir com OTP
2. Implemento todo o código necessário
3. Testamos o fluxo completo

**Qual opção você prefere?** 🤔

---

**Documento criado em:** 21 de novembro de 2025
**Status:** Aguardando escolha da opção
