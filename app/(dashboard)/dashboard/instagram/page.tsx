import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstagramConnect from '@/components/instagram/instagram-connect'
import InstagramAccount from '@/components/instagram/instagram-account'
import { CheckCircle, AlertCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  no_code: 'Código de autorização não recebido',
  token_failed: 'Falha ao obter token de acesso',
  no_pages: 'Nenhuma página do Facebook encontrada. Você precisa ter uma página conectada.',
  no_instagram_account: 'Nenhuma conta Instagram Business conectada à sua página do Facebook',
  database: 'Erro ao salvar dados no banco',
  'NEXT_PUBLIC_FACEBOOK_APP_ID não configurado': 'Variável NEXT_PUBLIC_FACEBOOK_APP_ID não está configurada nas variáveis de ambiente',
  'FACEBOOK_APP_SECRET não configurado': 'Variável FACEBOOK_APP_SECRET não está configurada nas variáveis de ambiente',
  'NEXT_PUBLIC_APP_URL não configurado': 'Variável NEXT_PUBLIC_APP_URL não está configurada nas variáveis de ambiente',
  unknown: 'Erro desconhecido ao conectar',
}

export default async function InstagramPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createServerClient()
  const resolvedSearchParams = await searchParams

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: instagramAccount } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram</h1>
        <p className="text-gray-600">
          Conecte sua conta Instagram Business para sincronizar posts e métricas
        </p>
      </div>

      {/* Success Message */}
      {resolvedSearchParams.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Instagram conectado com sucesso!
        </div>
      )}

      {/* Error Message */}
      {resolvedSearchParams.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Erro ao conectar</p>
              <p className="text-sm">
                {errorMessages[resolvedSearchParams.error] || 'Erro desconhecido'}
              </p>

              {resolvedSearchParams.error === 'no_pages' && (
                <a
                  href="https://www.facebook.com/pages/creation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-2 inline-block hover:text-red-900"
                >
                  Criar página do Facebook →
                </a>
              )}

              {resolvedSearchParams.error === 'no_instagram_account' && (
                <a
                  href="https://help.instagram.com/502981923235522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-2 inline-block hover:text-red-900"
                >
                  Como conectar Instagram à Página →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {instagramAccount ? (
        <InstagramAccount account={instagramAccount} />
      ) : (
        <InstagramConnect />
      )}
    </div>
  )
}
