import { createServerClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/roles';
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const role = await getUserRole(user.id);

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Enviar email de teste
    const emailService = new EmailService(supabase);
    const success = await emailService.sendTestEmail(email, {
      test_message: 'Se você está lendo isso, significa que seu sistema de emails está configurado corretamente! 🎉'
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao enviar email. Verifique as configurações e API Key.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado para ${email}`,
    });

  } catch (error) {
    console.error('Erro no POST /api/admin/test-email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
