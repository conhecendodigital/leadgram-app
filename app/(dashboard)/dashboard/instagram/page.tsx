import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstagramConnect from '@/components/instagram/instagram-connect'
import InstagramAccount from '@/components/instagram/instagram-account'
import { CheckCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  no_code: 'Código de autorização não recebido',
  token_failed: 'Falha ao obter token de acesso',
  no_pages: 'Nenhuma página do Facebook encontrada. Você precisa ter uma página conectada.',
  no_instagram_account: 'Nenhuma conta Instagram Business conectada à sua página do Facebook',
  database: 'Erro ao salvar dados no banco',
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
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: instagramAccount } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', session.user.id)
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
          <p className="font-medium mb-1">Erro ao conectar</p>
          <p className="text-sm">
            {errorMessages[resolvedSearchParams.error] || 'Erro desconhecido'}
          </p>

          {resolvedSearchParams.error === 'no_pages' && (
            <a
              href="https://www.facebook.com/pages/creation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline mt-2 inline-block"
            >
              Criar página do Facebook →
            </a>
          )}

          {resolvedSearchParams.error === 'no_instagram_account' && (
            <a
              href="https://help.instagram.com/502981923235522"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline mt-2 inline-block"
            >
              Como conectar Instagram à Página →
            </a>
          )}
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
