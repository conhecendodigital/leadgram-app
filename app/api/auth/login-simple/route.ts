import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * ⚠️ DEBUG ONLY - NÃO USAR EM PRODUÇÃO ⚠️
 *
 * API de Login SIMPLES (sem sistema de segurança)
 *
 * Esta rota NÃO possui:
 * - Rate limiting
 * - Verificação de IP bloqueado
 * - Registro de tentativas de login
 * - Bloqueio automático de IPs
 * - Sistema de segurança completo
 *
 * USE APENAS para debug/desenvolvimento quando o sistema de segurança
 * estiver causando problemas durante o desenvolvimento.
 *
 * Para PRODUÇÃO, use: /api/auth/login
 */
export async function POST(request: Request) {
  try {
    console.log('1. Iniciando login simples...');

    const { email, password } = await request.json();
    console.log('2. Email recebido:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('3. Criando cliente Supabase...');
    const supabase = await createServerClient();

    console.log('4. Tentando autenticação...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('5. Resultado:', {
      success: !error,
      hasUser: !!data.user,
      error: error?.message
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (data.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email
        },
        session: data.session
      });
    }

    return NextResponse.json(
      { error: 'Falha na autenticação' },
      { status: 401 }
    );

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
