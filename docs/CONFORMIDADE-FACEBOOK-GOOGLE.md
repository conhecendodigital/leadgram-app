# Guia de Conformidade e Aprovação - Facebook & Google

## Visão Geral

Este documento contém informações detalhadas sobre a conformidade do Leadgram com os requisitos do **Facebook/Instagram (Meta)** e **Google** para aprovação de aplicativos que utilizam OAuth e APIs dessas plataformas.

---

## Status Atual de Conformidade

### ✅ Documentação Legal

O Leadgram possui documentação legal completa e conforme:

- **Política de Privacidade** (`/legal/privacy`)
  - Completa e em conformidade com LGPD
  - Descreve coleta, uso e compartilhamento de dados
  - Lista todas as integrações de terceiros
  - Define direitos dos usuários
  - Contato do DPO (Encarregado de Dados)

- **Termos de Uso** (`/legal/terms`)
  - Define regras de uso da plataforma
  - Descreve planos e pagamentos
  - Lista permissões e restrições
  - Explica integrações de terceiros

- **Política de Cookies** (`/legal/cookies`)
  - Implementada no sistema

---

## 1. Facebook/Instagram (Meta) - App Review

### Permissões Solicitadas

O Leadgram solicita as seguintes permissões do Facebook/Instagram:

```javascript
// app/api/instagram/auth/route.ts
scope: [
  'instagram_basic',              // Acesso básico ao perfil
  'instagram_manage_insights',    // Acesso a métricas/insights
  'pages_show_list',              // Listar páginas Facebook
  'pages_read_engagement',        // Ler engajamento das páginas
  'business_management'           // Gerenciar contas business
]
```

### Status de Aprovação

#### ❌ PENDENTE - App Review Necessário

**O app precisa passar pelo Facebook App Review para:**
1. Obter aprovação das permissões avançadas
2. Ser utilizado por usuários públicos (não apenas desenvolvedores/testadores)
3. Acessar dados reais do Instagram Business/Creator

#### Modo Atual
- **Modo de Desenvolvimento**: Apenas desenvolvedores e testadores podem conectar
- **Limitações**: Máximo de 5 usuários de teste

### Requisitos para Aprovação Facebook

#### 1. Configuração do App no Facebook Developers

**Acesse:** https://developers.facebook.com/apps

- [x] App criado
- [ ] App ID configurado (`NEXT_PUBLIC_FACEBOOK_APP_ID`)
- [ ] App Secret configurado (`FACEBOOK_APP_SECRET`)
- [ ] Domínio verificado
- [ ] Redirect URIs configuradas
- [ ] Produto "Instagram Basic Display" adicionado
- [ ] Produto "Instagram Graph API" adicionado (para insights)

**Redirect URIs que devem ser configuradas:**
```
https://seu-dominio.com/api/instagram/callback
```

#### 2. Informações Necessárias para App Review

**URL da Política de Privacidade:**
```
https://seu-dominio.com/legal/privacy
```

**URL dos Termos de Uso:**
```
https://seu-dominio.com/legal/terms
```

**URL do App:**
```
https://seu-dominio.com
```

**Categoria do App:**
- Business and Pages Management
- Content Management
- Analytics

**Descrição do Uso das Permissões (para o App Review):**

**instagram_basic:**
> Precisamos acessar informações básicas do perfil do Instagram do usuário para exibir o nome de usuário, foto de perfil e permitir a conexão da conta com nossa plataforma de gerenciamento de conteúdo.

**instagram_manage_insights:**
> Solicitamos acesso às métricas e insights dos posts do Instagram para fornecer análises de desempenho ao usuário. Nosso app exibe dashboards com métricas como curtidas, comentários, alcance e impressões para ajudar criadores de conteúdo a melhorar sua estratégia.

**pages_show_list:**
> Precisamos listar as páginas do Facebook vinculadas ao usuário para identificar contas Instagram Business conectadas a essas páginas, permitindo a sincronização correta de dados.

**pages_read_engagement:**
> Solicitamos acesso às métricas de engajamento das páginas para fornecer análises completas de desempenho em todas as plataformas conectadas.

**business_management:**
> Necessário para gerenciar contas Instagram Business e acessar informações de contas conectadas através do Facebook Business Manager.

#### 3. Materiais para Submissão

**Você precisará fornecer:**

1. **Vídeo Demonstrativo (Screencast)**
   - Mostrar login no app
   - Demonstrar processo de conexão com Instagram
   - Mostrar como cada permissão é utilizada
   - Duração: 2-5 minutos
   - Resolução mínima: 1280x720
   - Formato: MP4, MOV, ou link YouTube (não listado)

2. **Instruções de Teste**
   - Credenciais de uma conta de teste
   - Passo a passo de como usar cada funcionalidade
   - Exemplos de dados que serão exibidos

3. **Usuário de Teste**
   - Criar conta Instagram Business de teste
   - Adicionar como testador no Facebook App
   - Ter posts e dados para demonstração

#### 4. Verificação de Domínio

**IMPORTANTE:** O Facebook exige verificação de domínio antes do App Review.

**Passos:**
1. Acesse Facebook Developers > Seu App > Settings > Basic
2. Role até "App Domains"
3. Adicione seu domínio (exemplo: `leadgram.com.br`)
4. Clique em "Domain Verification"
5. Escolha um método:
   - **Meta Tag HTML** (mais fácil): Adicionar tag no `<head>` do site
   - **Arquivo HTML**: Upload de arquivo de verificação
   - **DNS TXT Record**: Adicionar registro DNS

**Para Meta Tag, adicione em `app/layout.tsx`:**
```tsx
<meta name="facebook-domain-verification" content="SEU_CODIGO_AQUI" />
```

#### 5. Ícones e Assets do App

**Obrigatório:**
- **Ícone do App**: 1024x1024 px (PNG)
- **Logo**: Transparente, alta resolução
- **Business Use Case Icon**: 400x400 px

#### 6. Data Deletion Instructions (OBRIGATÓRIO)

O Facebook exige uma URL ou instruções de como os usuários podem solicitar exclusão de dados.

**Adicionar em `app/(legal)/legal/data-deletion/page.tsx`:**

```tsx
// Criar página de solicitação de exclusão de dados
// URL: https://seu-dominio.com/legal/data-deletion
```

**Ou usar o email conforme documentado:**
```
privacidade@leadgram.com.br
```

#### 7. Configurações de Segurança

- [ ] **HTTPS obrigatório** (todo o site)
- [ ] **Proteção CSRF** implementada (✅ já implementado via `oauth_states`)
- [ ] **Rate limiting** configurado (✅ já implementado com Upstash)
- [ ] **Validação de state** no callback OAuth (✅ implementado)

### Cronograma Estimado de Revisão

- **Submissão inicial:** Imediato após configuração
- **Tempo de análise do Facebook:** 3-7 dias úteis
- **Possíveis rejeições:** 1-3 ciclos de revisão são comuns
- **Tempo total estimado:** 2-4 semanas

### Checklist de Pré-Submissão

Antes de submeter para App Review:

- [ ] App em produção com HTTPS
- [ ] Domínio verificado
- [ ] Política de Privacidade acessível publicamente
- [ ] Termos de Uso acessíveis publicamente
- [ ] Página/instruções de exclusão de dados
- [ ] Vídeo demonstrativo gravado
- [ ] Conta de teste criada e configurada
- [ ] App testado em ambiente de produção
- [ ] Todos os redirect URIs configurados
- [ ] Ícones e assets do app enviados

---

## 2. Google OAuth - Verification

### Permissões Solicitadas (Scopes)

O Leadgram solicita as seguintes permissões da API do Google:

```javascript
// lib/services/google-drive-service.ts
scope: [
  'https://www.googleapis.com/auth/drive.file',              // Criar/editar arquivos criados pelo app
  'https://www.googleapis.com/auth/drive.metadata.readonly',  // Ler metadados de arquivos
  'https://www.googleapis.com/auth/userinfo.email',          // Acessar email do usuário
]
```

### Status de Aprovação

#### ⚠️ ATENÇÃO - Verificação Necessária para Uso Público

**O Google possui dois níveis de verificação:**

1. **Unverified Apps** (modo atual)
   - Exibe tela de aviso "App não verificado"
   - Usuários podem clicar em "Avançado" > "Ir para [nome do app] (não seguro)"
   - Funciona mas causa atrito

2. **Verified Apps** (recomendado)
   - Sem tela de aviso
   - Experiência profissional
   - Aumenta confiança dos usuários

### Requisitos para Verificação Google

#### 1. Configuração no Google Cloud Console

**Acesse:** https://console.cloud.google.com

- [x] Projeto criado
- [ ] Google Drive API habilitada
- [ ] OAuth 2.0 Client ID criado
- [ ] Credenciais configuradas
- [ ] Tela de consentimento OAuth configurada

**Credenciais necessárias:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

**Redirect URIs autorizadas:**
```
https://seu-dominio.com/api/google-drive/callback
```

#### 2. OAuth Consent Screen

**Configuração da Tela de Consentimento:**

**User Type:**
- Escolha "External" (usuários públicos)

**App Information:**
- **App name:** Leadgram
- **User support email:** suporte@leadgram.com.br
- **App logo:** 120x120 px (PNG, JPG)
- **App domain:** seu-dominio.com
- **Homepage:** https://seu-dominio.com
- **Privacy Policy:** https://seu-dominio.com/legal/privacy
- **Terms of Service:** https://seu-dominio.com/legal/terms

**Developer Contact:**
- Email: dev@leadgram.com.br

**Scopes:**
- Adicionar os 3 scopes listados acima
- Justificar uso de cada um

**Descrição do Uso dos Scopes:**

**drive.file:**
> Nosso aplicativo permite que usuários façam upload de vídeos para o Google Drive, organizados em pastas. Precisamos desta permissão para criar pastas e fazer upload de arquivos de vídeo criados pelos usuários através de nossa plataforma.

**drive.metadata.readonly:**
> Utilizamos esta permissão para listar os vídeos que o usuário enviou através do nosso app, exibindo informações como nome do arquivo, data de upload e tamanho, para que o usuário possa gerenciar seus vídeos.

**userinfo.email:**
> Solicitamos o email do usuário para identificar qual conta do Google Drive está conectada, exibir esta informação na interface e permitir que o usuário gerencie múltiplas contas se necessário.

#### 3. Tipos de Verificação Google

O Google possui diferentes níveis baseados nos scopes solicitados:

**Nosso caso: Scopes Sensíveis (Sensitive)**
- `drive.file` é considerado sensível
- **Requer:** Verificação de domínio + Security Assessment

##### Verificação de Domínio

**Métodos disponíveis:**
1. Google Search Console (recomendado)
2. Meta tag HTML
3. DNS TXT record

**Via Google Search Console:**
1. Acesse https://search.google.com/search-console
2. Adicione sua propriedade (domínio)
3. Verifique via DNS, meta tag ou upload de arquivo
4. Vincule no Google Cloud Console

##### Security Assessment

**O que o Google avalia:**
- [ ] Política de Privacidade conforme
- [ ] Termos de Uso presentes
- [ ] App em produção e funcional
- [ ] HTTPS em todo o site
- [ ] Uso apropriado dos scopes
- [ ] Segurança da implementação OAuth
- [ ] Transparência sobre uso de dados

**Documentação necessária:**

1. **Privacy Policy Checklist**
   - ✅ Descreve quais dados são coletados
   - ✅ Explica como os dados são usados
   - ✅ Descreve com quem os dados são compartilhados
   - ✅ Informa sobre retenção de dados
   - ✅ Explica direitos dos usuários
   - ✅ Contato para questões de privacidade

2. **YouTube Video (para scopes sensíveis)**
   - Demonstração do fluxo OAuth
   - Como o app usa cada permissão
   - Onde os dados são exibidos
   - Como usuário revoga acesso
   - Duração: 3-5 minutos

3. **Domain Verification**
   - Domínio verificado via Search Console

#### 4. Documentação de Segurança

**O que documentar:**

1. **OAuth Flow**
   - ✅ State parameter para CSRF protection
   - ✅ Tokens armazenados de forma segura (Supabase)
   - ✅ Refresh token implementado
   - ✅ HTTPS obrigatório

2. **Data Handling**
   - ✅ Dados encriptados em trânsito
   - ✅ Tokens não expostos ao cliente
   - ✅ Acesso baseado em usuário (RLS)
   - ✅ Revogação de acesso implementada

3. **Compliance**
   - ✅ LGPD compliance
   - ✅ Direito de exclusão implementado
   - ✅ Exportação de dados disponível
   - ✅ Logs de auditoria

#### 5. Processo de Submissão

**OAuth Verification (Unverified → Verified):**

1. **Preparação (1-2 semanas)**
   - Configurar OAuth Consent Screen
   - Verificar domínio
   - Gravar vídeo demonstrativo
   - Preparar documentação

2. **Submissão (1 dia)**
   - Google Cloud Console > OAuth consent screen
   - Clicar em "Submit for Verification"
   - Preencher formulário
   - Upload de vídeo e documentos

3. **Revisão (4-6 semanas)**
   - Google analisa o app
   - Possíveis perguntas/esclarecimentos
   - Testes de segurança

4. **Aprovação/Rejeição**
   - Se aprovado: Status muda para "Verified"
   - Se rejeitado: Corrigir e resubmeter

### Alternativa: Permanecer Unverified

**Prós:**
- Funciona imediatamente
- Sem processo de revisão
- Adequado para MVP/beta

**Contras:**
- Tela de aviso assusta usuários
- Parece menos profissional
- Pode reduzir conversão

**Recomendação:** Iniciar unverified, submeter para verificação quando tiver usuários reais.

---

## 3. Checklist Geral de Conformidade

### Obrigatórios para Ambas as Plataformas

- [ ] **HTTPS em produção** (obrigatório)
- [ ] **Domínio próprio** (não usar Vercel/Netlify free domains)
- [ ] **Política de Privacidade** publicada e acessível
- [ ] **Termos de Uso** publicados e acessíveis
- [ ] **Email de suporte** ativo e responsivo
- [ ] **Instruções de exclusão de dados**

### Segurança

- [x] **CSRF protection** (state parameter em OAuth)
- [x] **Rate limiting** implementado
- [x] **Tokens seguros** (não expostos ao cliente)
- [x] **HTTPS redirect** configurado
- [x] **RLS (Row Level Security)** no banco
- [x] **Validação de inputs**
- [x] **Logs de auditoria**

### Funcionalidades

- [x] **Revogação de acesso** (disconnect Instagram/Google Drive)
- [x] **Exportação de dados** do usuário
- [x] **Exclusão de conta** (com limpeza de dados)
- [x] **Refresh tokens** (Google Drive auto-refresh implementado)

### UX/UI

- [ ] **Loading states** durante OAuth
- [ ] **Error messages** claros
- [ ] **Instruções** de como conectar contas
- [ ] **Transparência** sobre permissões solicitadas

---

## 4. Configuração de Produção

### Variáveis de Ambiente Necessárias

```env
# App URL (HTTPS obrigatório)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Facebook/Instagram
NEXT_PUBLIC_FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret

# Google Drive
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://seu-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu-token

# Cron Protection
CRON_SECRET=seu-secret-aleatorio
```

### URLs que Devem Estar Acessíveis

```
https://seu-dominio.com/                    → Homepage
https://seu-dominio.com/legal/privacy       → Política de Privacidade
https://seu-dominio.com/legal/terms         → Termos de Uso
https://seu-dominio.com/legal/cookies       → Política de Cookies
https://seu-dominio.com/legal/data-deletion → Solicitação de exclusão (criar)
```

### Redirect URIs a Configurar

**Facebook:**
```
https://seu-dominio.com/api/instagram/callback
```

**Google:**
```
https://seu-dominio.com/api/google-drive/callback
```

---

## 5. Plano de Ação Recomendado

### Fase 1: Preparação (Semana 1-2)

1. **Deploy em produção com domínio próprio**
   - Configurar domínio (ex: leadgram.com.br)
   - SSL/HTTPS automático (Vercel faz isso)
   - Testar todas as funcionalidades

2. **Configurar Facebook App**
   - Criar app em developers.facebook.com
   - Adicionar produtos Instagram
   - Configurar redirect URIs
   - Verificar domínio

3. **Configurar Google Cloud**
   - Criar projeto
   - Habilitar Drive API
   - Configurar OAuth consent screen
   - Criar credenciais OAuth 2.0

4. **Criar contas de email**
   - suporte@leadgram.com.br
   - privacidade@leadgram.com.br
   - dpo@leadgram.com.br
   - legal@leadgram.com.br

### Fase 2: Preparação de Materiais (Semana 3)

5. **Gravar vídeos demonstrativos**
   - Facebook App Review (2-5 min)
   - Google Verification (3-5 min)
   - Mostrar uso real de cada permissão

6. **Preparar documentação**
   - Justificativas de uso dos scopes
   - Instruções de teste
   - Criar usuário de teste

7. **Verificar domínios**
   - Facebook domain verification
   - Google Search Console verification

### Fase 3: Submissões (Semana 4)

8. **Submeter Facebook App Review**
   - Preencher formulário completo
   - Upload de vídeo
   - Fornecer credenciais de teste
   - Aguardar 3-7 dias

9. **Submeter Google Verification**
   - OAuth consent screen
   - Security assessment
   - Upload de documentação
   - Aguardar 4-6 semanas

### Fase 4: Ajustes e Aprovação (Semana 5-8)

10. **Responder feedback**
    - Facebook pode pedir esclarecimentos
    - Google pode solicitar ajustes
    - Implementar correções rapidamente

11. **Re-submissões se necessário**
    - Corrigir problemas apontados
    - Reenviar para análise

12. **Go Live**
    - Após aprovações, app está pronto para público
    - Remover modo de teste/desenvolvimento

---

## 6. Problemas Comuns e Soluções

### Facebook App Review

**Problema:** "Unable to verify the use case for this permission"
- **Solução:** Gravar vídeo mais detalhado mostrando onde/como a permissão é usada

**Problema:** "Privacy Policy URL is not accessible"
- **Solução:** Verificar se `/legal/privacy` está público (não requer login)

**Problema:** "Invalid Redirect URI"
- **Solução:** Garantir que URI no código é IDÊNTICA à configurada no Facebook App

**Problema:** "Domain not verified"
- **Solução:** Completar verificação de domínio antes de submeter

### Google OAuth Verification

**Problema:** "Scope not justified"
- **Solução:** Explicar em detalhes por que cada scope é necessário

**Problema:** "Video doesn't show scope usage"
- **Solução:** Demonstrar claramente no vídeo onde cada permissão é utilizada

**Problema:** "Privacy Policy incomplete"
- **Solução:** Adicionar seções específicas sobre uso de dados do Google Drive

**Problema:** "Domain verification failed"
- **Solução:** Usar Google Search Console para verificar propriedade do domínio

---

## 7. Custos Envolvidos

### Facebook/Instagram
- **Criação de App:** Gratuito
- **App Review:** Gratuito
- **Sem custos recorrentes**

### Google
- **Google Cloud Project:** Gratuito
- **Drive API:** Gratuito (até limites generosos)
- **OAuth Verification:** Gratuito

### Outros
- **Domínio:** ~R$ 40-80/ano (.com.br)
- **Email profissional:** Gratuito (via Cloudflare, Zoho, etc.) ou ~R$ 30/mês (Google Workspace)

---

## 8. Monitoramento Pós-Aprovação

### Métricas a Acompanhar

**Facebook:**
- Taxa de erro nas conexões
- Tokens expirados
- Usuários conectados
- API rate limits

**Google:**
- Quota de API utilizada
- Erros de autenticação
- Uploads bem-sucedidos
- Storage usado pelos usuários

### Manutenção

**Revisar trimestralmente:**
- Termos de uso das APIs (mudanças)
- Política de Privacidade (atualizar se necessário)
- Permissões solicitadas (remover se não usar)
- Segurança da implementação

**Se adicionar novas permissões:**
- Facebook: Novo App Review necessário
- Google: Nova verificação se scope sensível

---

## 9. Contatos e Recursos

### Documentação Oficial

**Facebook/Instagram:**
- App Review: https://developers.facebook.com/docs/app-review
- Instagram API: https://developers.facebook.com/docs/instagram-api
- Permissions: https://developers.facebook.com/docs/permissions/reference

**Google:**
- OAuth Verification: https://support.google.com/cloud/answer/13463073
- Drive API: https://developers.google.com/drive/api/guides/about-sdk
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

### Suporte

**Facebook Developer Support:**
- https://developers.facebook.com/support/bugs/

**Google Cloud Support:**
- https://cloud.google.com/support

---

## 10. Conclusão

### Status Atual do Leadgram

**Pronto para uso em desenvolvimento:**
- ✅ Código implementado corretamente
- ✅ Segurança adequada (CSRF, RLS, etc.)
- ✅ Documentação legal completa
- ✅ Funcionalidades principais testadas

**Pendente para uso público:**
- ❌ Facebook App Review
- ❌ Google OAuth Verification
- ❌ Deploy em produção com domínio
- ❌ Verificação de domínio (ambas plataformas)

### Próximos Passos Críticos

1. **Decidir domínio** e fazer deploy em produção
2. **Configurar emails** profissionais
3. **Gravar vídeos** demonstrativos
4. **Submeter para revisão** (Facebook primeiro, mais rápido)
5. **Aguardar aprovações** e responder feedbacks

### Estimativa de Tempo Total

- **Preparação:** 2-3 semanas
- **Facebook Review:** 1-2 semanas
- **Google Verification:** 4-6 semanas
- **Total:** 2-3 meses até ambos aprovados

**Recomendação:** Começar o processo assim que possível, pois pode levar tempo. Enquanto isso, usar em modo de desenvolvimento/teste com usuários limitados.

---

**Documento criado em:** 21 de novembro de 2025
**Última atualização:** 21 de novembro de 2025
**Versão:** 1.0
