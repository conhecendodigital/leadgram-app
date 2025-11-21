import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies | Leadgram',
  description: 'Política de Cookies do Leadgram - Saiba como usamos cookies e tecnologias similares.',
}

export default function CookiePolicyPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Cookies</h1>
      <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <p className="text-sm text-blue-900 m-0">
          Esta Política de Cookies explica como o <strong>Leadgram</strong> utiliza cookies e tecnologias similares
          para melhorar sua experiência, analisar uso e personalizar conteúdo.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. O que são Cookies?</h2>

      <p className="text-gray-700">
        Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, smartphone, tablet)
        quando você visita um site. Eles permitem que o site "lembre" de suas ações e preferências ao longo do tempo.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Por que Usamos Cookies?</h2>

      <p className="text-gray-700 mb-4">Utilizamos cookies para:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Essenciais:</strong> Garantir o funcionamento básico da plataforma (login, sessão, segurança)</li>
        <li><strong>Funcionalidade:</strong> Lembrar suas preferências (idioma, tema, configurações)</li>
        <li><strong>Performance:</strong> Analisar como você usa o serviço para melhorar a experiência</li>
        <li><strong>Segurança:</strong> Detectar e prevenir atividades fraudulentas ou não autorizadas</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Tipos de Cookies que Utilizamos</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Cookies Essenciais (Necessários)</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
        <p className="text-gray-800 m-0"><strong>Finalidade:</strong> Funcionamento básico da plataforma</p>
        <p className="text-gray-700 m-0 mt-2"><strong>Podem ser bloqueados?</strong> Não - o serviço não funcionará corretamente</p>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg my-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Finalidade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duração</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">sb-access-token</td>
            <td className="px-4 py-3 text-sm text-gray-700">Autenticação de sessão (Supabase)</td>
            <td className="px-4 py-3 text-sm text-gray-700">Sessão</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">sb-refresh-token</td>
            <td className="px-4 py-3 text-sm text-gray-700">Renovação automática de sessão</td>
            <td className="px-4 py-3 text-sm text-gray-700">30 dias</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">next-auth.session-token</td>
            <td className="px-4 py-3 text-sm text-gray-700">Manter você logado</td>
            <td className="px-4 py-3 text-sm text-gray-700">7 dias</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">csrf-token</td>
            <td className="px-4 py-3 text-sm text-gray-700">Proteção contra CSRF attacks</td>
            <td className="px-4 py-3 text-sm text-gray-700">Sessão</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Cookies de Funcionalidade</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
        <p className="text-gray-800 m-0"><strong>Finalidade:</strong> Lembrar suas preferências</p>
        <p className="text-gray-700 m-0 mt-2"><strong>Podem ser bloqueados?</strong> Sim - mas você terá que redefinir preferências a cada visita</p>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg my-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Finalidade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duração</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">user-preferences</td>
            <td className="px-4 py-3 text-sm text-gray-700">Armazenar configurações da conta</td>
            <td className="px-4 py-3 text-sm text-gray-700">1 ano</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">sidebar-state</td>
            <td className="px-4 py-3 text-sm text-gray-700">Lembrar se sidebar está aberta/fechada</td>
            <td className="px-4 py-3 text-sm text-gray-700">30 dias</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">cookie-consent</td>
            <td className="px-4 py-3 text-sm text-gray-700">Armazenar sua escolha de cookies</td>
            <td className="px-4 py-3 text-sm text-gray-700">1 ano</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Cookies de Performance e Analytics</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
        <p className="text-gray-800 m-0"><strong>Finalidade:</strong> Entender como você usa a plataforma</p>
        <p className="text-gray-700 m-0 mt-2"><strong>Podem ser bloqueados?</strong> Sim - mas não poderemos melhorar sua experiência</p>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg my-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Serviço</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Finalidade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Mais informações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">Vercel Analytics</td>
            <td className="px-4 py-3 text-sm text-gray-700">Métricas de performance e uso</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">Sentry (quando implementado)</td>
            <td className="px-4 py-3 text-sm text-gray-700">Monitoramento de erros e bugs</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.4 Cookies de Terceiros</h3>

      <p className="text-gray-700 mb-4">Quando você usa integrações, os seguintes serviços podem definir cookies:</p>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg my-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Serviço</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Quando?</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Política de Privacidade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">Meta (Facebook/Instagram)</td>
            <td className="px-4 py-3 text-sm text-gray-700">Ao conectar Instagram</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Meta Privacy
              </a>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">Google</td>
            <td className="px-4 py-3 text-sm text-gray-700">Ao conectar Google Drive</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Privacy
              </a>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-700">Mercado Pago</td>
            <td className="px-4 py-3 text-sm text-gray-700">Ao fazer pagamento</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                MP Privacy
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Outras Tecnologias de Rastreamento</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Local Storage</h3>
      <p className="text-gray-700">
        Usamos Local Storage (armazenamento local do navegador) para guardar preferências e dados temporários.
        Diferente de cookies, dados em Local Storage não são enviados automaticamente ao servidor.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Session Storage</h3>
      <p className="text-gray-700">
        Session Storage é usado para dados temporários que existem apenas durante sua sessão atual.
        Quando você fecha o navegador, esses dados são apagados automaticamente.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Web Beacons / Pixels</h3>
      <p className="text-gray-700">
        Não utilizamos web beacons ou pixels de rastreamento de terceiros (como Facebook Pixel) atualmente.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Como Gerenciar Cookies</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Banner de Consentimento</h3>
      <p className="text-gray-700">
        Quando você acessa o Leadgram pela primeira vez, exibimos um banner de consentimento onde você pode:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Aceitar todos os cookies</li>
        <li>Aceitar apenas cookies essenciais</li>
        <li>Personalizar suas preferências</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Configurações do Navegador</h3>
      <p className="text-gray-700 mb-4">Você pode controlar cookies através das configurações do seu navegador:</p>

      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 font-semibold m-0">Google Chrome</p>
          <p className="text-gray-700 text-sm m-0 mt-1">
            Configurações → Privacidade e segurança → Cookies e outros dados de sites
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 font-semibold m-0">Mozilla Firefox</p>
          <p className="text-gray-700 text-sm m-0 mt-1">
            Opções → Privacidade e Segurança → Cookies e dados de sites
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 font-semibold m-0">Safari (macOS)</p>
          <p className="text-gray-700 text-sm m-0 mt-1">
            Preferências → Privacidade → Gerenciar dados de sites
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 font-semibold m-0">Microsoft Edge</p>
          <p className="text-gray-700 text-sm m-0 mt-1">
            Configurações → Cookies e permissões de site → Gerenciar e excluir cookies
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Modo de Navegação Privada</h3>
      <p className="text-gray-700">
        Você pode usar o modo anônimo/privado do navegador, que não armazena cookies permanentemente.
        <strong> Atenção:</strong> Isso pode afetar funcionalidades da plataforma.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies em Dispositivos Móveis</h2>

      <p className="text-gray-700">
        Se você acessa o Leadgram via navegador móvel (Safari, Chrome, etc.), as mesmas regras se aplicam.
        Você pode gerenciar cookies através das configurações do navegador no seu dispositivo móvel.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Consequências de Bloquear Cookies</h2>

      <p className="text-gray-700 mb-4">Se você bloquear ou recusar cookies:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Essenciais bloqueados:</strong> A plataforma não funcionará (você não conseguirá fazer login)</li>
        <li><strong>Funcionais bloqueados:</strong> Suas preferências não serão salvas</li>
        <li><strong>Analytics bloqueados:</strong> Não conseguiremos melhorar sua experiência</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Do Not Track (DNT)</h2>

      <p className="text-gray-700">
        Respeitamos sinais "Do Not Track" do navegador sempre que possível. No entanto, cookies essenciais
        ainda são necessários para o funcionamento da plataforma.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Atualização desta Política</h2>

      <p className="text-gray-700">
        Podemos atualizar esta Política de Cookies para refletir mudanças em nossa tecnologia ou legislação.
        A data de "Última atualização" no topo da página mostra quando foi modificada pela última vez.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contato</h2>

      <p className="text-gray-700 mb-4">
        Para questões sobre cookies ou esta política:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-800 m-0"><strong>Leadgram - Gestão de Conteúdo Digital</strong></p>
        <p className="text-gray-700 m-0 mt-2">E-mail: <a href="mailto:privacidade@leadgram.com.br" className="text-primary hover:underline">privacidade@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0">Mais informações: <a href="/legal/privacy" className="text-primary hover:underline">Política de Privacidade</a></p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 mt-12">
        <p className="text-gray-800 font-semibold m-0">Transparência Total</p>
        <p className="text-gray-700 m-0 mt-2">
          Acreditamos em transparência total sobre como usamos cookies. Você sempre terá controle sobre quais cookies aceita,
          e nunca usaremos cookies para fins não divulgados nesta política.
        </p>
      </div>
    </div>
  )
}
