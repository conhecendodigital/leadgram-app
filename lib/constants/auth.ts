/**
 * Constantes de autenticação e segurança
 *
 * Centraliza valores usados em múltiplos lugares do sistema
 * para facilitar manutenção e evitar números/strings mágicas
 */

// ============================================
// VALIDAÇÃO DE SENHA
// ============================================

export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 128

// ============================================
// OTP (One-Time Password)
// ============================================

export const OTP_LENGTH = 6
export const OTP_EXPIRATION_MINUTES = 10
export const OTP_EXPIRATION_SECONDS = OTP_EXPIRATION_MINUTES * 60

// ============================================
// RATE LIMITING
// ============================================

// Login attempts
export const LOGIN_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_SECONDS: 900, // 15 minutos
  MESSAGE: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
}

// OTP send
export const OTP_SEND_RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_SECONDS: 900, // 15 minutos
  MESSAGE: 'Você já solicitou muitos códigos. Aguarde 15 minutos antes de tentar novamente.'
}

// OTP verify
export const OTP_VERIFY_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_SECONDS: 300, // 5 minutos
  MESSAGE: 'Muitas tentativas de verificação. Tente novamente em 5 minutos.'
}

// Register
export const REGISTER_RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_SECONDS: 3600, // 1 hora
  MESSAGE: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.'
}

// Password reset
export const PASSWORD_RESET_RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_SECONDS: 1800, // 30 minutos
  MESSAGE: 'Muitas tentativas de redefinição. Tente novamente em 30 minutos.'
}

// ============================================
// COUNTDOWN TIMERS (UI)
// ============================================

export const RESEND_COUNTDOWN_SECONDS = 60

// ============================================
// SESSÃO
// ============================================

export const SESSION_DURATION_DAYS = 7
export const SESSION_DURATION_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60

export const REMEMBER_ME_DURATION_DAYS = 30
export const REMEMBER_ME_DURATION_SECONDS = REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60

// ============================================
// TRUSTED DEVICE
// ============================================

export const TRUSTED_DEVICE_DURATION_DAYS = 30
export const TRUSTED_DEVICE_DURATION_SECONDS = TRUSTED_DEVICE_DURATION_DAYS * 24 * 60 * 60

// ============================================
// MENSAGENS DE ERRO (PORTUGUÊS)
// ============================================

export const ERROR_MESSAGES = {
  // Autenticação
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  EMAIL_NOT_CONFIRMED: 'Por favor, verifique seu email antes de fazer login',
  ACCOUNT_DISABLED: 'Sua conta foi desativada. Entre em contato com o suporte.',

  // Senha
  PASSWORD_TOO_SHORT: `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
  PASSWORD_MISMATCH: 'As senhas não coincidem',
  PASSWORD_WEAK: 'A senha é muito fraca. Use letras, números e caracteres especiais.',

  // Email
  EMAIL_REQUIRED: 'Email é obrigatório',
  EMAIL_INVALID: 'Email inválido',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',
  EMAIL_NOT_FOUND: 'Email não encontrado',

  // OTP
  OTP_INVALID: 'Código inválido ou expirado',
  OTP_EXPIRED: 'Este código expirou. Solicite um novo código.',
  OTP_INCORRECT: 'Código inválido. Verifique se digitou corretamente.',
  OTP_NOT_FOUND: 'Código não encontrado. Solicite um novo código.',
  OTP_INCOMPLETE: `Por favor, digite o código completo de ${OTP_LENGTH} dígitos`,

  // Geral
  UNKNOWN_ERROR: 'Ocorreu um erro. Tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Não autorizado. Faça login novamente.',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Muitas tentativas. Aguarde alguns minutos.',
}

// ============================================
// MENSAGENS DE SUCESSO
// ============================================

export const SUCCESS_MESSAGES = {
  // Autenticação
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  REGISTER_SUCCESS: 'Cadastro realizado com sucesso!',

  // Email
  EMAIL_VERIFIED: 'Email verificado com sucesso!',
  VERIFICATION_EMAIL_SENT: 'Email de verificação enviado!',

  // Senha
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  PASSWORD_RESET_EMAIL_SENT: 'Email de recuperação enviado!',

  // OTP
  OTP_SENT: 'Código enviado com sucesso!',
  OTP_RESENT: 'Código reenviado com sucesso!',
  OTP_VERIFIED: 'Código verificado com sucesso!',
}

// ============================================
// REGEX PATTERNS
// ============================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DIGITS_ONLY: /^\d+$/,
  OTP: /^\d{6}$/,
}

// ============================================
// ROTAS
// ============================================

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
}

// ============================================
// OTP PURPOSES
// ============================================

export const OTP_PURPOSES = {
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  TWO_FACTOR: 'two_factor',
} as const

export type OTPPurpose = typeof OTP_PURPOSES[keyof typeof OTP_PURPOSES]
