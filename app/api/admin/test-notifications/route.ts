import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { ErrorTrackingService } from '@/lib/services/error-tracking-service';
import { createServerClient } from '@/lib/supabase/server';

/**
 * API para testar notificações automáticas
 * Permite ao admin testar cada tipo de notificação manualmente
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const notificationService = new NotificationService(supabase);
    const errorTracking = new ErrorTrackingService(supabase);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { type } = await request.json();

    switch (type) {
      case 'new_user':
        await notificationService.notifyNewUser(
          user.id,
          'teste@exemplo.com'
        );
        break;

      case 'payment':
        await notificationService.notifyPayment(
          user.id,
          99.90,
          'Plano Pro'
        );
        break;

      case 'cancellation':
        await notificationService.notifyCancellation(
          user.id,
          'Plano Pro'
        );
        break;

      case 'error':
        // Criar um erro de teste
        await errorTracking.logCriticalError(
          new Error('Este é um erro de teste criado manualmente pelo admin'),
          'Test Context - Manual Trigger'
        );
        break;

      case 'error_info':
        // Teste de erro não crítico (não cria notificação)
        await errorTracking.logInfo('Informação de teste', { test: true });
        break;

      case 'error_warning':
        // Teste de warning (não cria notificação)
        await errorTracking.logWarning('Aviso de teste', { test: true });
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: new_user, payment, cancellation, error, error_info, error_warning' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Notificação de teste "${type}" criada com sucesso!`,
      type
    });

  } catch (error) {
    console.error('Erro ao testar notificação:', error);
    return NextResponse.json(
      {
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
