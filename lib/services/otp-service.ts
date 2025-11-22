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
   */
  static async sendEmailVerificationOTP(
    email: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createServiceClient()
      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

      // Invalidar códigos anteriores não verificados
      await supabase
        .from('email_otp_codes')
        .delete()
        .eq('email', email)
        .eq('purpose', 'email_verification')
        .eq('verified', false)

      // Criar novo código
      const { error: dbError } = await supabase
        .from('email_otp_codes')
        .insert({
          user_id: userId || null,
          email,
          code,
          purpose: 'email_verification',
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          max_attempts: 5
        })

      if (dbError) {
        console.error('Erro ao criar código OTP:', dbError)
        return { success: false, error: 'Erro ao criar código de verificação' }
      }

      // Enviar email
      await EmailService.sendEmailVerificationOTP(email, code)

      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar OTP:', error)
      return { success: false, error: 'Erro ao enviar código de verificação' }
    }
  }

  /**
   * Cria e envia um código OTP para reset de senha
   */
  static async sendPasswordResetOTP(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createServiceClient()

      // Verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        // Não revelar se o email existe ou não (segurança)
        console.log('Email não encontrado:', email)
        return { success: true } // Retornar sucesso mesmo se não existir
      }

      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 minutos

      // Invalidar códigos anteriores não verificados
      await supabase
        .from('email_otp_codes')
        .delete()
        .eq('email', email)
        .eq('purpose', 'password_reset')
        .eq('verified', false)

      // Criar novo código
      const { error: dbError } = await supabase
        .from('email_otp_codes')
        .insert({
          user_id: userData.user_id,
          email,
          code,
          purpose: 'password_reset',
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          max_attempts: 5
        })

      if (dbError) {
        console.error('Erro ao criar código OTP:', dbError)
        return { success: false, error: 'Erro ao criar código de recuperação' }
      }

      // Enviar email
      await EmailService.sendPasswordResetOTP(email, code)

      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar OTP de reset:', error)
      return { success: false, error: 'Erro ao enviar código de recuperação' }
    }
  }

  /**
   * Verifica um código OTP
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

      // Buscar código válido
      const { data: otpData, error: fetchError } = await supabase
        .from('email_otp_codes')
        .select('*')
        .eq('email', email)
        .eq('purpose', purpose)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !otpData) {
        return {
          success: false,
          error: 'Código inválido ou expirado. Solicite um novo código.'
        }
      }

      // Verificar se excedeu tentativas
      if (otpData.attempts >= otpData.max_attempts) {
        return {
          success: false,
          error: 'Número máximo de tentativas excedido. Solicite um novo código.'
        }
      }

      // Verificar se o código está correto
      if (otpData.code !== code) {
        // Incrementar tentativas
        await supabase
          .from('email_otp_codes')
          .update({
            attempts: otpData.attempts + 1
          })
          .eq('id', otpData.id)

        const remainingAttempts = otpData.max_attempts - (otpData.attempts + 1)

        return {
          success: false,
          error: `Código incorreto. Tentativas restantes: ${remainingAttempts}`
        }
      }

      // Código correto - marcar como verificado
      await supabase
        .from('email_otp_codes')
        .update({
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', otpData.id)

      return {
        success: true,
        userId: otpData.user_id || undefined,
        otpId: otpData.id
      }
    } catch (error) {
      console.error('Erro ao verificar OTP:', error)
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

      const { data, error } = await supabase
        .from('email_otp_codes')
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
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      const supabase = createServiceClient()

      await supabase
        .from('email_otp_codes')
        .delete()
        .lt('expires_at', new Date().toISOString())

      console.log('✅ Códigos OTP expirados removidos')
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error)
    }
  }
}
