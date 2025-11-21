import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Leadgram',
  description: 'Política de Privacidade do Leadgram - Saiba como coletamos, usamos e protegemos seus dados pessoais.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
      <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <p className="text-sm text-blue-900 m-0">
          Esta Política de Privacidade descreve como o <strong>Leadgram</strong> coleta, usa, armazena e protege suas informações pessoais,
          em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e outras legislações aplicáveis.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Informações que Coletamos</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.1 Informações fornecidas por você</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Dados de cadastro:</strong> nome, e-mail, senha (criptografada)</li>
        <li><strong>Dados de perfil:</strong> foto, preferências de conta</li>
        <li><strong>Conteúdo criado:</strong> ideias, roteiros, descrições de posts</li>
        <li><strong>Arquivos de mídia:</strong> imagens, vídeos, thumbnails</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.2 Informações coletadas automaticamente</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Dados de uso:</strong> páginas visitadas, ações realizadas, tempo de sessão</li>
        <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo, sistema operacional</li>
        <li><strong>Cookies e tecnologias similares:</strong> veja nossa <a href="/legal/cookies" className="text-primary hover:underline">Política de Cookies</a></li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.3 Informações de terceiros</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Instagram/Facebook:</strong> dados públicos do perfil, métricas de posts (quando você conecta sua conta)</li>
        <li><strong>Google Drive:</strong> permissões de acesso para upload de arquivos (quando você conecta)</li>
        <li><strong>Mercado Pago:</strong> dados de pagamento e transações (processados por eles, não armazenamos dados de cartão)</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Como Usamos Suas Informações</h2>

      <p className="text-gray-700 mb-4">Utilizamos seus dados pessoais para:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Fornecer o serviço:</strong> gerenciar sua conta, processar suas solicitações, sincronizar dados do Instagram</li>
        <li><strong>Melhorar a plataforma:</strong> análise de uso, desenvolvimento de novas funcionalidades</li>
        <li><strong>Comunicação:</strong> enviar notificações importantes, atualizações de serviço, suporte técnico</li>
        <li><strong>Segurança:</strong> prevenir fraudes, proteger contra abusos, garantir conformidade legal</li>
        <li><strong>Processamento de pagamentos:</strong> gerenciar assinaturas e cobranças</li>
        <li><strong>Cumprimento legal:</strong> atender requisições judiciais e obrigações legais</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Base Legal para Processamento de Dados (LGPD)</h2>

      <p className="text-gray-700 mb-4">Processamos seus dados pessoais com base nas seguintes bases legais:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Execução de contrato:</strong> processamento necessário para fornecimento do serviço (Art. 7º, V da LGPD)</li>
        <li><strong>Consentimento:</strong> quando você autoriza conexões com Instagram, Google Drive, etc. (Art. 7º, I da LGPD)</li>
        <li><strong>Legítimo interesse:</strong> melhorias no serviço, segurança, prevenção de fraudes (Art. 7º, IX da LGPD)</li>
        <li><strong>Obrigação legal:</strong> cumprimento de requisitos legais e regulatórios (Art. 7º, II da LGPD)</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Compartilhamento de Informações</h2>

      <p className="text-gray-700 mb-4">Não vendemos seus dados pessoais. Compartilhamos informações apenas quando necessário:</p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Prestadores de serviço</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Supabase:</strong> armazenamento de dados e autenticação</li>
        <li><strong>Vercel:</strong> hospedagem da aplicação</li>
        <li><strong>Upstash:</strong> cache e rate limiting</li>
        <li><strong>Mercado Pago:</strong> processamento de pagamentos</li>
        <li><strong>Sentry:</strong> monitoramento de erros (quando implementado)</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Integrações autorizadas por você</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Meta (Instagram/Facebook):</strong> para sincronização de posts e métricas</li>
        <li><strong>Google Drive:</strong> para armazenamento de arquivos de vídeo</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Requisições legais</h3>
      <p className="text-gray-700">
        Podemos divulgar informações se exigido por lei, ordem judicial, ou para proteger direitos, propriedade ou segurança.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Armazenamento e Segurança</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Onde seus dados são armazenados</h3>
      <p className="text-gray-700 mb-4">
        Seus dados são armazenados em servidores seguros fornecidos por <strong>Supabase</strong> e <strong>Vercel</strong>,
        localizados em data centers certificados internacionalmente.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Medidas de segurança</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
        <li>Criptografia de senhas (hash bcrypt)</li>
        <li>Autenticação de dois fatores (2FA) disponível</li>
        <li>Row Level Security (RLS) no banco de dados</li>
        <li>Monitoramento de tentativas de login suspeitas</li>
        <li>Bloqueio automático de IPs suspeitos</li>
        <li>Rate limiting para prevenir abusos</li>
        <li>Logs de auditoria de ações críticas</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Retenção de dados</h3>
      <p className="text-gray-700">
        Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, seus dados são removidos em até 30 dias,
        exceto quando necessário para cumprimento de obrigações legais.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Seus Direitos (LGPD)</h2>

      <p className="text-gray-700 mb-4">De acordo com a LGPD, você tem os seguintes direitos:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Confirmação e acesso:</strong> saber se processamos seus dados e acessá-los</li>
        <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade</li>
        <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado e interoperável</li>
        <li><strong>Eliminação:</strong> excluir dados tratados com base em consentimento</li>
        <li><strong>Informação sobre compartilhamento:</strong> saber com quem compartilhamos seus dados</li>
        <li><strong>Revogação de consentimento:</strong> retirar consentimento a qualquer momento</li>
        <li><strong>Oposição:</strong> opor-se ao tratamento em caso de descumprimento da LGPD</li>
      </ul>

      <p className="text-gray-700 mt-4">
        Para exercer seus direitos, acesse as <strong>Configurações</strong> da sua conta ou entre em contato através de{' '}
        <a href="mailto:privacidade@leadgram.com.br" className="text-primary hover:underline">privacidade@leadgram.com.br</a>.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies e Tecnologias de Rastreamento</h2>

      <p className="text-gray-700">
        Utilizamos cookies e tecnologias similares para melhorar sua experiência. Para mais informações, consulte nossa{' '}
        <a href="/legal/cookies" className="text-primary hover:underline">Política de Cookies</a>.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Transferência Internacional de Dados</h2>

      <p className="text-gray-700">
        Alguns de nossos prestadores de serviço (como Vercel e Supabase) podem armazenar dados em servidores localizados fora do Brasil.
        Garantimos que tais transferências ocorram em conformidade com a LGPD, mediante cláusulas contratuais adequadas e outras salvaguardas.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Menores de Idade</h2>

      <p className="text-gray-700">
        Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores.
        Se identificarmos dados de menores, os excluiremos imediatamente.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Alterações nesta Política</h2>

      <p className="text-gray-700">
        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas por e-mail
        ou aviso em destaque no serviço. Recomendamos revisar esta página regularmente.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contato e Encarregado de Dados (DPO)</h2>

      <p className="text-gray-700 mb-4">
        Para questões sobre esta Política de Privacidade, proteção de dados ou para exercer seus direitos:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-800 m-0"><strong>Leadgram - Gestão de Conteúdo Digital</strong></p>
        <p className="text-gray-700 m-0 mt-2">E-mail: <a href="mailto:privacidade@leadgram.com.br" className="text-primary hover:underline">privacidade@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0">Encarregado de Dados (DPO): <a href="mailto:dpo@leadgram.com.br" className="text-primary hover:underline">dpo@leadgram.com.br</a></p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Autoridade Nacional de Proteção de Dados (ANPD)</h2>

      <p className="text-gray-700">
        Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD):{' '}
        <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          www.gov.br/anpd
        </a>
      </p>

      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 mt-12">
        <p className="text-gray-800 font-semibold m-0">Compromisso com sua Privacidade</p>
        <p className="text-gray-700 m-0 mt-2">
          No Leadgram, levamos sua privacidade a sério. Estamos comprometidos em proteger seus dados e ser transparentes
          sobre como os utilizamos. Se tiver dúvidas, estamos sempre à disposição.
        </p>
      </div>
    </div>
  )
}
