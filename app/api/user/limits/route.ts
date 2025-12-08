import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getIdeaLimit, getPostLimit } from '@/lib/settings'
import { getUserRole } from '@/lib/roles'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin - admin não tem limites
    const userRole = await getUserRole(user.id)
    const isAdmin = userRole === 'admin'

    // Buscar plano do usuário
    const { data: subscription } = await (supabase
      .from('user_subscriptions') as any)
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single()

    const planType = isAdmin ? 'admin' : (subscription?.plan_type || 'free')

    // Admin tem limites ilimitados (-1)
    const ideaLimit = isAdmin ? -1 : await getIdeaLimit(planType)
    const postLimit = isAdmin ? -1 : await getPostLimit(planType)

    // Contar ideias atuais do usuário
    const { count: currentIdeas } = await (supabase
      .from('ideas') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Contar posts do mês atual
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: currentPosts } = await (supabase
      .from('ideas') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'posted')
      .gte('posted_at', firstDayOfMonth.toISOString())

    // Calcular percentuais
    const ideasPercentage =
      ideaLimit === -1 ? 0 : Math.round(((currentIdeas || 0) / ideaLimit) * 100)
    const postsPercentage =
      postLimit === -1 ? 0 : Math.round(((currentPosts || 0) / postLimit) * 100)

    return NextResponse.json({
      success: true,
      planType,
      subscription: subscription?.status || 'active',
      limits: {
        ideas: {
          limit: ideaLimit,
          current: currentIdeas || 0,
          remaining: ideaLimit === -1 ? 'unlimited' : Math.max(0, ideaLimit - (currentIdeas || 0)),
          percentage: ideasPercentage,
          canCreate: ideaLimit === -1 || (currentIdeas || 0) < ideaLimit,
        },
        posts: {
          limit: postLimit,
          current: currentPosts || 0,
          remaining: postLimit === -1 ? 'unlimited' : Math.max(0, postLimit - (currentPosts || 0)),
          percentage: postsPercentage,
          canPost: postLimit === -1 || (currentPosts || 0) < postLimit,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao buscar limites:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
