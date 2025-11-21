import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solicitação de Exclusão de Dados | Leadgram',
  description: 'Instruções para solicitar a exclusão de seus dados pessoais do Leadgram.',
}

export default function DataDeletionPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitação de Exclusão de Dados</h1>
      <p className="text-gray-600 mb-8">Data Deletion Instructions / User Data Deletion Callback</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <p className="text-sm text-blue-900 m-0">
          Esta página fornece instruções sobre como solicitar a exclusão de seus dados pessoais do <strong>Leadgram</strong>,
          conforme exigido pela Lei Geral de Proteção de Dados (LGPD) e pelas políticas do Facebook/Instagram e Google.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Como Solicitar a Exclusão de Seus Dados</h2>

      <p className="text-gray-700 mb-4">
        Você pode solicitar a exclusão completa de seus dados pessoais do Leadgram de três maneiras:
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opção 1: Excluir Sua Conta Diretamente (Recomendado)</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <ol className="list-decimal pl-6 space-y-2 text-gray-700 m-0">
          <li>Faça login em sua conta no <a href="https://formulareal.online" className="text-primary hover:underline">Leadgram</a></li>
          <li>Acesse <strong>Configurações</strong> no menu superior</li>
          <li>Role até a seção <strong>"Zona de Perigo"</strong></li>
          <li>Clique em <strong>"Excluir Conta"</strong></li>
          <li>Confirme a exclusão digitando sua senha</li>
        </ol>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-900 m-0">
            <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos em até 30 dias.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opção 2: Enviar E-mail para Privacidade</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-gray-700 m-0 mb-3">
          Envie um e-mail para nosso Encarregado de Proteção de Dados:
        </p>
        <p className="text-gray-800 m-0 mb-2">
          <strong>E-mail:</strong>{' '}
          <a href="mailto:privacidade@leadgram.com.br" className="text-primary hover:underline">
            privacidade@leadgram.com.br
          </a>
        </p>
        <p className="text-gray-700 m-0 mb-3">
          <strong>Assunto:</strong> Solicitação de Exclusão de Dados
        </p>

        <p className="text-gray-700 m-0 mb-2"><strong>Inclua no e-mail:</strong></p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 m-0">
          <li>Seu nome completo</li>
          <li>E-mail cadastrado no Leadgram</li>
          <li>Solicitação explícita de exclusão de dados</li>
          <li>Data da solicitação</li>
        </ul>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opção 3: Contato através do DPO (Data Protection Officer)</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-gray-700 m-0 mb-3">
          Entre em contato diretamente com nosso Encarregado de Dados:
        </p>
        <p className="text-gray-800 m-0">
          <strong>E-mail do DPO:</strong>{' '}
          <a href="mailto:dpo@leadgram.com.br" className="text-primary hover:underline">
            dpo@leadgram.com.br
          </a>
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">O Que Será Excluído</h2>

      <p className="text-gray-700 mb-4">Quando você solicita a exclusão de seus dados, nós excluímos:</p>

      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Dados de cadastro:</strong> nome, e-mail, senha, foto de perfil</li>
        <li><strong>Conteúdo criado:</strong> todas as ideias, roteiros, descrições de posts</li>
        <li><strong>Arquivos de mídia:</strong> imagens e thumbnails armazenados em nosso sistema</li>
        <li><strong>Conexões de terceiros:</strong> tokens de acesso do Instagram e Google Drive</li>
        <li><strong>Histórico de uso:</strong> logs de atividades, métricas de uso</li>
        <li><strong>Dados de pagamento:</strong> histórico de transações (dados de cartão não são armazenados)</li>
        <li><strong>Preferências e configurações:</strong> todas as configurações de conta</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Prazo de Exclusão</h2>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
        <p className="text-gray-800 font-semibold m-0 mb-2">Tempo de Processamento</p>
        <p className="text-gray-700 m-0">
          Seus dados serão completamente excluídos de nossos sistemas em até <strong>30 dias</strong> após a solicitação.
          Você receberá uma confirmação por e-mail quando a exclusão for concluída.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Dados Retidos por Obrigação Legal</h2>

      <p className="text-gray-700 mb-4">
        Algumas informações podem ser retidas por períodos específicos para cumprimento de obrigações legais:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Dados fiscais e de pagamento:</strong> retidos por 5 anos (conforme legislação tributária brasileira)</li>
        <li><strong>Logs de segurança:</strong> retidos por 6 meses (conforme Marco Civil da Internet)</li>
        <li><strong>Dados sob disputa judicial:</strong> retidos até resolução final</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Dados em Serviços de Terceiros</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Instagram/Facebook</h3>
      <p className="text-gray-700">
        A conexão com o Instagram será revogada automaticamente. Para excluir dados que o Facebook/Instagram possui sobre você,
        acesse diretamente as configurações de privacidade do Facebook:{' '}
        <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          https://www.facebook.com/settings?tab=applications
        </a>
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google Drive</h3>
      <p className="text-gray-700 mb-4">
        Vídeos enviados para o Google Drive através do Leadgram permanecem em <strong>sua própria conta do Google Drive</strong>.
        Para excluir esses arquivos:
      </p>
      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
        <li>Acesse <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Drive</a></li>
        <li>Localize a pasta "Ideias" criada pelo Leadgram</li>
        <li>Delete os arquivos ou a pasta inteira</li>
        <li>Esvazie a lixeira do Drive para exclusão permanente</li>
      </ol>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Mercado Pago</h3>
      <p className="text-gray-700">
        Dados de transações de pagamento são processados pelo Mercado Pago. Para questões sobre esses dados,
        consulte a política de privacidade do Mercado Pago:{' '}
        <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          https://www.mercadopago.com.br/privacidade
        </a>
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Confirmação de Exclusão</h2>

      <p className="text-gray-700 mb-4">
        Após processar sua solicitação de exclusão, enviaremos um e-mail de confirmação para o endereço cadastrado.
        Este e-mail confirmará que todos os seus dados foram removidos permanentemente de nossos sistemas.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Perguntas Frequentes</h2>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-800 font-semibold m-0 mb-2">Posso recuperar minha conta após a exclusão?</p>
          <p className="text-gray-700 m-0">
            Não. A exclusão é permanente e irreversível. Você precisará criar uma nova conta se desejar usar o Leadgram novamente.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-800 font-semibold m-0 mb-2">E se eu apenas quiser desconectar o Instagram ou Google Drive?</p>
          <p className="text-gray-700 m-0">
            Você pode desconectar essas integrações sem excluir sua conta. Acesse <strong>Configurações</strong> e gerencie suas conexões individualmente.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-800 font-semibold m-0 mb-2">Quanto tempo leva para minha solicitação ser processada?</p>
          <p className="text-gray-700 m-0">
            Solicitações são processadas em até 30 dias. Você receberá confirmação por e-mail quando concluída.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-800 font-semibold m-0 mb-2">Posso exportar meus dados antes de excluir?</p>
          <p className="text-gray-700 m-0">
            Sim! Acesse <strong>Configurações {'>'} Exportar Dados</strong> antes de solicitar a exclusão. Você receberá um arquivo JSON com todos os seus dados.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Informações de Contato</h2>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <p className="text-gray-800 m-0 mb-3"><strong>Leadgram - Gestão de Conteúdo Digital</strong></p>
        <p className="text-gray-700 m-0 mb-1"><strong>Privacidade:</strong> <a href="mailto:privacidade@leadgram.com.br" className="text-primary hover:underline">privacidade@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0 mb-1"><strong>DPO (Encarregado de Dados):</strong> <a href="mailto:dpo@leadgram.com.br" className="text-primary hover:underline">dpo@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0 mb-1"><strong>Suporte Geral:</strong> <a href="mailto:suporte@leadgram.com.br" className="text-primary hover:underline">suporte@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0"><strong>Site:</strong> <a href="https://formulareal.online" className="text-primary hover:underline">https://formulareal.online</a></p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Referências Legais</h2>

      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
        <li><a href="/legal/privacy" className="text-primary hover:underline">Política de Privacidade</a></li>
        <li><a href="/legal/terms" className="text-primary hover:underline">Termos de Uso</a></li>
        <li><a href="/legal/cookies" className="text-primary hover:underline">Política de Cookies</a></li>
        <li><a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ANPD - Autoridade Nacional de Proteção de Dados</a></li>
      </ul>

      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 mt-12">
        <p className="text-gray-800 font-semibold m-0">Seus Direitos São Importantes</p>
        <p className="text-gray-700 m-0 mt-2">
          Respeitamos seu direito à privacidade e proteção de dados. Se tiver qualquer dúvida sobre o processo de exclusão,
          não hesite em entrar em contato conosco.
        </p>
      </div>
    </div>
  )
}
