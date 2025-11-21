import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | Leadgram',
  description: 'Termos de Uso do Leadgram - Conheça as regras e condições para uso da plataforma.',
}

export default function TermsOfServicePage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
      <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <p className="text-sm text-blue-900 m-0">
          Bem-vindo ao <strong>Leadgram</strong>! Estes Termos de Uso regulam o acesso e uso de nossa plataforma.
          Ao criar uma conta ou usar nossos serviços, você concorda com estes termos.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Definições</h2>

      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Leadgram, "nós", "nosso":</strong> refere-se à plataforma e seus operadores</li>
        <li><strong>"Você", "usuário":</strong> pessoa física ou jurídica que utiliza o serviço</li>
        <li><strong>"Plataforma" ou "Serviço":</strong> o sistema Leadgram, incluindo website e APIs</li>
        <li><strong>"Conteúdo":</strong> ideias, textos, imagens, vídeos e outros dados criados ou carregados por você</li>
        <li><strong>"Plano":</strong> Free, Pro ou Premium, conforme escolhido pelo usuário</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Aceitação dos Termos</h2>

      <p className="text-gray-700">
        Ao criar uma conta no Leadgram, você declara que:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Leu, compreendeu e concorda com estes Termos de Uso</li>
        <li>Leu e concorda com nossa <a href="/legal/privacy" className="text-primary hover:underline">Política de Privacidade</a></li>
        <li>Tem pelo menos 18 anos de idade ou possui autorização de responsável legal</li>
        <li>Forneceu informações verdadeiras, precisas e completas</li>
        <li>Possui autoridade legal para aceitar estes termos</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Descrição do Serviço</h2>

      <p className="text-gray-700 mb-4">
        O Leadgram é uma plataforma SaaS (Software as a Service) que oferece:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Gerenciamento de ideias de conteúdo para redes sociais</li>
        <li>Organização por funil de vendas e plataforma</li>
        <li>Integração com Instagram para sincronização de métricas</li>
        <li>Integração com Google Drive para armazenamento de vídeos</li>
        <li>Analytics e dashboards de desempenho</li>
        <li>Análise de concorrentes (perfis públicos do Instagram)</li>
        <li>Sistema de pagamentos via Mercado Pago</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Criação e Gestão de Conta</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Registro</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Você deve fornecer informações precisas e atualizadas</li>
        <li>É responsável por manter a confidencialidade de sua senha</li>
        <li>Não pode compartilhar sua conta com terceiros</li>
        <li>Deve notificar imediatamente sobre uso não autorizado</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Segurança</h3>
      <p className="text-gray-700">
        Recomendamos fortemente ativar a autenticação de dois fatores (2FA) para proteção adicional de sua conta.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Suspensão e Encerramento</h3>
      <p className="text-gray-700">
        Podemos suspender ou encerrar sua conta se:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Violar estes Termos de Uso</li>
        <li>Usar o serviço para atividades ilegais ou fraudulentas</li>
        <li>Tentar comprometer a segurança da plataforma</li>
        <li>Abusar de recursos ou APIs</li>
        <li>Não pagar por serviços contratados</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Planos e Pagamentos</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Planos Disponíveis</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Free:</strong> R$ 0/mês - Funcionalidades básicas com limitações</li>
        <li><strong>Pro:</strong> conforme tabela de preços - Funcionalidades avançadas</li>
        <li><strong>Premium:</strong> conforme tabela de preços - Todas as funcionalidades</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Cobrança</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Pagamentos são processados via <strong>Mercado Pago</strong></li>
        <li>Assinaturas são cobradas mensalmente (planos pagos)</li>
        <li>Não armazenamos dados de cartão de crédito (processados pelo Mercado Pago)</li>
        <li>Você pode cancelar sua assinatura a qualquer momento</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Reembolsos</h3>
      <p className="text-gray-700">
        Reembolsos são analisados caso a caso. Entre em contato através de{' '}
        <a href="mailto:suporte@leadgram.com.br" className="text-primary hover:underline">suporte@leadgram.com.br</a> para solicitar.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.4 Alterações de Preço</h3>
      <p className="text-gray-700">
        Podemos alterar os preços com aviso prévio de 30 dias. Usuários ativos manterão o preço contratado durante o período de aviso.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Uso Aceitável</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Você PODE:</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Usar o serviço para gerenciar conteúdo de suas redes sociais</li>
        <li>Conectar suas próprias contas do Instagram e Google Drive</li>
        <li>Fazer upload de conteúdo que você possui os direitos</li>
        <li>Exportar seus dados a qualquer momento</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Você NÃO PODE:</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Usar o serviço para atividades ilegais ou não autorizadas</li>
        <li>Tentar acessar contas de outros usuários</li>
        <li>Fazer engenharia reversa, descompilar ou desmontar o código</li>
        <li>Usar bots, scripts ou automações não autorizadas</li>
        <li>Sobrecarregar nossos servidores (DDoS, spam, etc.)</li>
        <li>Fazer scraping ou extração massiva de dados</li>
        <li>Revender ou redistribuir o serviço sem autorização</li>
        <li>Fazer upload de conteúdo ilegal, ofensivo ou que viole direitos de terceiros</li>
        <li>Violar direitos autorais, marcas registradas ou propriedade intelectual</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Propriedade Intelectual</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Seu Conteúdo</h3>
      <p className="text-gray-700">
        Você mantém todos os direitos sobre o conteúdo que criar ou carregar no Leadgram. Ao usar o serviço,
        você nos concede uma licença limitada para armazenar, processar e exibir seu conteúdo para fornecer o serviço.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 Nossa Plataforma</h3>
      <p className="text-gray-700">
        O Leadgram, incluindo código-fonte, design, marca, logos e funcionalidades, é propriedade exclusiva nossa
        e está protegido por leis de propriedade intelectual.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Integrações de Terceiros</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.1 Instagram/Facebook (Meta)</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Conectar sua conta é opcional mas necessário para sincronizar métricas</li>
        <li>Você pode revogar acesso a qualquer momento</li>
        <li>Estamos sujeitos aos Termos de Uso da Meta</li>
        <li>Não somos responsáveis por mudanças na API do Instagram</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.2 Google Drive</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Usamos apenas para upload de vídeos, com sua autorização</li>
        <li>Arquivos ficam armazenados em sua própria conta do Google Drive</li>
        <li>Você pode revogar acesso a qualquer momento</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.3 Mercado Pago</h3>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Processamento de pagamentos é feito inteiramente pelo Mercado Pago</li>
        <li>Não armazenamos dados de cartão de crédito</li>
        <li>Estamos sujeitos aos Termos de Uso do Mercado Pago</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Limitações e Responsabilidade</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.1 Limitações do Serviço</h3>
      <p className="text-gray-700 mb-4">O Leadgram é fornecido "como está". Não garantimos que:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>O serviço estará disponível 100% do tempo (uptime)</li>
        <li>Será livre de erros ou bugs</li>
        <li>Atenderá todas as suas necessidades específicas</li>
        <li>Integrações de terceiros funcionarão permanentemente</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.2 Isenção de Responsabilidade</h3>
      <p className="text-gray-700">Não somos responsáveis por:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Perda de dados devido a problemas técnicos (recomendamos backups)</li>
        <li>Mudanças nas APIs de terceiros (Instagram, Google, etc.)</li>
        <li>Danos indiretos, incidentais ou consequenciais</li>
        <li>Uso inadequado do serviço por outros usuários</li>
        <li>Conteúdo criado ou carregado por você</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.3 Limitação de Responsabilidade</h3>
      <p className="text-gray-700">
        Nossa responsabilidade total é limitada ao valor pago por você nos últimos 12 meses, conforme permitido por lei.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Disponibilidade do Serviço</h2>

      <p className="text-gray-700">
        Nos esforçamos para manter o serviço disponível 24/7, mas podem ocorrer:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Manutenções programadas (com aviso prévio quando possível)</li>
        <li>Interrupções emergenciais</li>
        <li>Problemas com provedores de infraestrutura</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Modificações dos Termos</h2>

      <p className="text-gray-700">
        Podemos modificar estes Termos de Uso a qualquer momento. Mudanças significativas serão notificadas
        por e-mail ou aviso na plataforma com antecedência mínima de 15 dias. Continuar usando o serviço
        após as mudanças constitui aceitação dos novos termos.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Rescisão</h2>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.1 Por Você</h3>
      <p className="text-gray-700">
        Você pode cancelar sua conta a qualquer momento através das Configurações. Seus dados serão excluídos
        conforme nossa <a href="/legal/privacy" className="text-primary hover:underline">Política de Privacidade</a>.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.2 Por Nós</h3>
      <p className="text-gray-700">
        Podemos encerrar sua conta com aviso prévio de 30 dias, ou imediatamente em caso de violação destes termos.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Lei Aplicável e Foro</h2>

      <p className="text-gray-700">
        Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
        Quaisquer disputas serão resolvidas no foro da comarca de [Cidade], Brasil, com exclusão de qualquer outro.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Disposições Gerais</h2>

      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li><strong>Divisibilidade:</strong> Se alguma cláusula for considerada inválida, as demais permanecem em vigor</li>
        <li><strong>Renúncia:</strong> Nossa falha em exercer direitos não constitui renúncia</li>
        <li><strong>Cessão:</strong> Você não pode transferir seus direitos sem nossa autorização</li>
        <li><strong>Acordo Completo:</strong> Estes termos constituem o acordo completo entre as partes</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contato</h2>

      <p className="text-gray-700 mb-4">
        Para questões sobre estes Termos de Uso:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-800 m-0"><strong>Leadgram - Gestão de Conteúdo Digital</strong></p>
        <p className="text-gray-700 m-0 mt-2">E-mail: <a href="mailto:suporte@leadgram.com.br" className="text-primary hover:underline">suporte@leadgram.com.br</a></p>
        <p className="text-gray-700 m-0">Jurídico: <a href="mailto:legal@leadgram.com.br" className="text-primary hover:underline">legal@leadgram.com.br</a></p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6 mt-12">
        <p className="text-gray-800 font-semibold m-0">Transparência e Confiança</p>
        <p className="text-gray-700 m-0 mt-2">
          Estamos comprometidos em fornecer um serviço transparente e confiável. Se tiver dúvidas sobre estes termos
          ou sobre qualquer aspecto do Leadgram, não hesite em entrar em contato conosco.
        </p>
      </div>
    </div>
  )
}
