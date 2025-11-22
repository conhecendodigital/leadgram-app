# 🔧 MELHORIAS DE AUTENTICAÇÃO - TODO LIST

## ✅ CONCLUÍDO (Deployado)

### Vulnerabilidades Críticas Corrigidas
- [x] Update-password: Validação de sessão ativa (não aceita mais userId do body)
- [x] Admin hardcoded: Role verificado no backend via profiles.role
- [x] Login-simple: Rota de debug deletada completamente
- [x] Backup codes: Usa crypto.randomBytes (criptograficamente seguro)
- [x] Password change: Removida verificação que criava sessão nova
- [x] OTP verify: Corrigida criação de sessão no client-side

---

## 🚨 ALTA PRIORIDADE (Fazer Logo)

### 1. Rate Limiting Persistente
**Problema:** Rate limit usa `Map` in-memory que não funciona em serverless
**Solução:** Migrar para Upstash Redis ou Vercel KV

```typescript
// lib/middleware/rate-limit.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function rateLimit(identifier: string, limit: number, windowSeconds: number) {
  const key = `rate-limit:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }

  return {
    limited: count > limit,
    remaining: Math.max(0, limit - count)
  }
}
```

**Arquivos:** `lib/middleware/rate-limit.ts`

### 2. Implementar Logout Adequado
**Problema:** Logout apenas no client, não invalida sessões no servidor
**Solução:** Criar API de logout que limpa active_sessions

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Deletar sessões ativas
    await (supabase.from('active_sessions') as any)
      .delete()
      .eq('user_id', user.id)

    // Logout do Supabase
    await supabase.auth.signOut()
  }

  return NextResponse.json({ success: true })
}
```

**Frontend:** Atualizar todos os componentes que fazem logout:
- `components/dashboard/header.tsx`
- `components/dashboard/mobile-menu.tsx`
- `components/admin/admin-header.tsx`
- `components/admin/admin-mobile-menu.tsx`

### 3. Implementar Middleware de Proteção de Rotas
**Problema:** Cada página verifica autenticação manualmente (código duplicado)
**Solução:** Criar middleware.ts na raiz

```typescript
// middleware.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/(auth)')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Redirecionar se não autenticado e tentando acessar área protegida
  if (!user && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecionar se autenticado e tentando acessar página de auth
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Verificar role para admin
  if (isAdminPage && user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 4. Simplificar OTP Verify API
**Problema:** Lógica confusa e quebrada em app/api/otp/verify/route.ts
**Solução:** Simplificar - OTP é verificado no client, API apenas marca email_verified_at

```typescript
// app/api/otp/verify/route.ts
export async function POST(request: Request) {
  const { email } = await request.json()
  const supabase = await createServerClient()

  // Buscar usuário autenticado (já verificou OTP no client)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Marcar como verificado
  await (supabase.from('profiles') as any)
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
```

### 5. Adicionar Proteção CSRF
**Problema:** APIs não têm proteção CSRF
**Solução:** Implementar tokens CSRF

```typescript
// lib/middleware/csrf.ts
import { NextRequest } from 'next/server'

export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function verifyCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value

  return token === cookieToken
}
```

---

## 📦 MÉDIO PRAZO (Refatoração)

### 6. Eliminar Código Duplicado - OTP Inputs
**Problema:** Lógica de OTP duplicada em verify-email e reset-password
**Solução:** Criar componente reutilizável

```typescript
// components/auth/otp-input.tsx
export function OTPInput({
  value,
  onChange,
  onComplete,
  disabled
}: OTPInputProps) {
  // Lógica de handleCodeChange, handleKeyDown, handlePaste
  // UI dos 6 inputs
}
```

**Usar em:**
- `app/(auth)/verify-email/page.tsx`
- `app/(auth)/reset-password/page.tsx`

### 7. Criar Hook useLogout
**Problema:** Lógica de logout duplicada em 4 componentes
**Solução:** Hook reutilizável

```typescript
// hooks/use-logout.ts
export function useLogout() {
  const router = useRouter()

  async function logout() {
    // Chamar API de logout
    await fetch('/api/auth/logout', { method: 'POST' })

    // Logout local
    const supabase = createClient()
    await supabase.auth.signOut()

    // Redirecionar
    router.push('/login')
    router.refresh()
  }

  return { logout }
}
```

### 8. Padronizar Error Handling
**Problema:** Respostas de erro inconsistentes
**Solução:** Criar tipos e helper

```typescript
// lib/types/api.ts
export interface APIError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface APISuccess<T = unknown> {
  success: true
  data?: T
  message?: string
}

// lib/utils/api.ts
export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({
    success: false,
    error: { code, message }
  }, { status })
}

export function successResponse<T>(data?: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}
```

### 9. Remover Código Morto
**Arquivos/Funções não usados:**

```typescript
// lib/services/otp-service.ts
- isOTPVerified() // NUNCA CHAMADO
- cleanupExpiredCodes() // NUNCA CHAMADO

// Decisão necessária: Deletar tabela email_otp_codes?
// Sistema usa OTP nativo do Supabase, tabela não é usada
```

### 10. Criar Constantes
**Problema:** Magic numbers/strings espalhados
**Solução:** Arquivo de constantes

```typescript
// lib/constants/auth.ts
export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 6,
  SESSION_DURATION_DAYS: 7,
  RATE_LIMIT_LOGIN_MAX: 5,
  RATE_LIMIT_LOGIN_WINDOW: 60,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 15,
  OTP_PASSWORD_RESET_EXPIRY_MINUTES: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  IP_BLOCK_DURATION_HOURS: 24,
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODE_LENGTH: 8
}
```

---

## 🎨 MELHORIAS DE UX

### 11. Separar Reset Password em 2 Páginas
**Atual:** 2 telas em 1 componente (confuso)
**Melhor:**
- `/reset-password` - Verifica OTP
- `/new-password` - Define nova senha

### 12. Mensagens de Erro Específicas
**Melhorar:**
- "Código inválido ou expirado" → Dizer se é inválido OU expirado
- "Erro ao fazer login" → Especificar (email não existe, senha incorreta, etc)

### 13. Feedback Visual
- Loading states em todas as transições
- Animações suaves entre telas
- Indicador de força de senha
- "Último login em X de Y" após login

---

## 🔒 MELHORIAS DE SEGURANÇA

### 14. Prevenir Email Enumeration
**Problema:** 403 vs 401 revela se email existe
**Solução:** Retornar sempre mesma mensagem genérica

```typescript
// Ao invés de:
if (!user) return { error: 'Email não encontrado', status: 404 }
if (!verified) return { error: 'Email não verificado', status: 403 }

// Usar:
return { error: 'Credenciais inválidas', status: 401 }
```

### 15. Melhorar Device Fingerprinting
**Atual:** Apenas IP + User Agent (fácil de falsificar)
**Melhor:** Adicionar mais fatores
- Screen resolution
- Timezone
- Browser plugins
- Canvas fingerprint
- WebGL fingerprint

### 16. Headers de Segurança
**Adicionar em next.config.js:**

```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
    ]
  }]
}
```

### 17. Implementar Session Rotation
**Problema:** Sessões não expiram/renovam
**Solução:** Rotacionar tokens periodicamente

---

## 📝 FUNCIONALIDADES FALTANTES

### 18. Trocar Email
**Fluxo:**
1. User solicita troca (novo email)
2. Envia OTP para email NOVO
3. Verifica OTP
4. Atualiza email (marca como verificado)

### 19. Deletar Conta
**LGPD/GDPR compliance:**
- Opção em settings
- Confirmação com senha
- Deletar todos os dados

### 20. Gerenciar Sessões Ativas
**UI para:**
- Ver sessões ativas (dispositivo, localização, data)
- Encerrar sessão específica
- Encerrar todas exceto atual

### 21. Integrar 2FA no Login
**Problema:** 2FA configurável mas não usado
**Solução:** Adicionar step de verificação 2FA após senha

```typescript
// app/api/auth/login/route.ts
if (user.has_2fa_enabled) {
  return { success: false, requires2FA: true, tempToken: ... }
}
```

### 22. Login History
**Problema:** Dados existem mas sem UI
**Solução:** Página de histórico de logins
- Data/hora
- IP
- Localização (aproximada)
- Dispositivo
- Status (sucesso/falha)

---

## 🧹 LIMPEZA DE CÓDIGO

### 23. Remover Console.logs de Produção
**Problema:** Logs de debug em produção
**Solução:** Usar biblioteca de logging com níveis

```typescript
// lib/utils/logger.ts
const logger = {
  debug: (...args) => process.env.NODE_ENV === 'development' && console.log(...args),
  info: console.info,
  error: console.error
}
```

### 24. Melhorar Type Safety
**Problema:** Uso excessivo de `as any`
**Solução:** Regenerar types do Supabase ou criar interfaces

```bash
npx supabase gen types typescript --project-id PROJECT_ID > types/database.types.ts
```

### 25. Adicionar JSDoc
**Todas as funções públicas devem ter:**

```typescript
/**
 * Verifica código OTP e cria sessão
 * @param email - Email do usuário
 * @param code - Código de 6 dígitos
 * @returns Dados do usuário e sessão
 * @throws {Error} Se código inválido ou expirado
 */
export async function verifyOTP(email: string, code: string) {
  // ...
}
```

---

## 📊 PRIORIZAÇÃO FINAL

### FAZER AGORA (Esta Semana)
1. ✅ Rate Limiting Persistente
2. ✅ Logout Adequado
3. ✅ Middleware de Rotas
4. ✅ Simplificar OTP Verify API
5. ✅ CSRF Protection

### FAZER DEPOIS (Este Mês)
6. ⏳ Componente OTP reutilizável
7. ⏳ Hook useLogout
8. ⏳ Padronizar error handling
9. ⏳ Remover código morto
10. ⏳ Criar constantes

### BACKLOG (Quando Possível)
11. 📋 Melhorias de UX
12. 📋 Melhorias de segurança
13. 📋 Funcionalidades faltantes
14. 📋 Limpeza de código

---

## 🎯 RESUMO

### Corrigido Hoje ✅
- 5 vulnerabilidades críticas
- 1 bug importante
- Sistema está mais seguro

### Próximos Passos 🚀
- Rate limiting persistente (URGENTE)
- Logout adequado
- Middleware de proteção
- Refatoração de código duplicado

### Impacto das Melhorias 📈
- **Segurança:** 🔴 → 🟢 (Critical → Safe)
- **Manutenibilidade:** 🟡 → 🟢 (Hard → Easy)
- **Performance:** 🟢 (OK → OK)
- **UX:** 🟡 (Good → Great)
