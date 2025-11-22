/**
 * OTP Service - Sistema de One-Time Password (Código de 6 dígitos)
 *
 * Substitui os magic links do Supabase para evitar rate-limit
 * e melhorar a experiência do usuário
 */

import { createServiceClient } from '@/lib/supabase/service'
import { EmailService } from './email-service'

export interface OTPCode {
  id: string
  user_id: string | null
  email: string
  code: string
  purpose: 'email_verification' | 'password_reset'
  verified: boolean
  attempts: number
  max_attempts: number
  expires_at: string
  created_at: string
  verified_at: string | null
}

export class OTPService {
  /**
   * Gera um código de 6 dígitos aleatório
   */
  private static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Cria e envia um código OTP para verificação de email
   * USA O SISTEMA NATIVO DO SUPABASE
   */
  static async sendEmailVerificationOTP(
    email: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createServiceClient()

      console.log('📧 Enviando OTP de verificação via Supabase para:', email)

      // USAR O MÉTODO NATIVO DO SUPABASE PARA ENVIAR OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Não criar usuário (já foi criado)
          data: {
            purpose: 'email_verification',
            user_id: userId
          }
        }
      })

      if (error) {
        console.error('❌ Erro ao enviar OTP via Supabase:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ OTP enviado via Supabase com sucesso!')
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao enviar OTP:', error)
      return { success: false, error: 'Erro ao enviar código de verificação' }
    }
  }

  /**
   * Cria e envia um código OTP para reset de senha
   * USA O SISTEMA NATIVO DO SUPABASE
   */
  static async sendPasswordResetOTP(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createServiceClient()

      console.log('📧 Enviando OTP de reset de senha via Supabase para:', email)

      // USAR O MÉTODO NATIVO DO SUPABASE PARA ENVIAR OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: {
            purpose: 'password_reset'
          }
        }
      })

      if (error) {
        console.error('❌ Erro ao enviar OTP via Supabase:', error)
        // Não revelar se o email existe ou não (segurança)
        return { success: true } // Retornar sucesso mesmo se falhar
      }

      console.log('✅ OTP de reset enviado via Supabase com sucesso!')
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao enviar OTP de reset:', error)
      return { success: false, error: 'Erro ao enviar código de recuperação' }
    }
  }

  /**
   * Verifica um código OTP usando o sistema nativo do Supabase
   */
  static async verifyOTP(
    email: string,
    code: string,
    purpose: 'email_verification' | 'password_reset'
  ): Promise<{
    success: boolean
    error?: string
    userId?: string
    otpId?: string
  }> {
    try {
      const supabase = createServiceClient()

      console.log('🔍 Verificando OTP via Supabase para:', email)

      // USAR O MÉTODO NATIVO DO SUPABASE PARA VERIFICAR OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })

      if (error) {
        console.error('❌ Erro ao verificar OTP:', error)
        return {
          success: false,
          error: 'Código inválido ou expirado. Solicite um novo código.'
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Erro ao verificar código'
        }
      }

      console.log('✅ Código OTP verificado com sucesso!')

      return {
        success: true,
        userId: data.user.id,
        otpId: data.user.id // Usar user ID como referência
      }
    } catch (error) {
      console.error('❌ Erro ao verificar OTP:', error)
      return {
        success: false,
        error: 'Erro ao verificar código'
      }
    }
  }

  /**
   * Verifica se um código OTP foi verificado (para reset de senha)
   */
  static async isOTPVerified(
    otpId: string
  ): Promise<{ verified: boolean; userId?: string }> {
    try {
      const supabase = createServiceClient()

      const { data, error } = await (supabase
        .from('email_otp_codes') as any)
        .select('verified, user_id')
        .eq('id', otpId)
        .single()

      if (error || !data) {
        return { verified: false }
      }

      return {
        verified: data.verified,
        userId: data.user_id || undefined
      }
    } catch (error) {
      console.error('Erro ao verificar status do OTP:', error)
      return { verified: false }
    }
  }

  /**
   * Limpa códigos expirados (pode ser chamado por um cron job)
   * Remove códigos que expiraram há mais de 1 hora
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      const supabase = createServiceClient()

      // Deletar códigos expirados há mais de 1 hora
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      const { error, count } = await (supabase
        .from('email_otp_codes') as any)
        .delete({ count: 'exact' })
        .lt('expires_at', oneHourAgo.toISOString())

      if (error) {
        console.error('Erro ao limpar códigos expirados:', error)
      } else {
        console.log(`✅ ${count || 0} códigos OTP expirados removidos`)
      }
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error)
    }
  }
}
