# Checklist de Validação - Facebook & Google
## Leadgram (formulareal.online)

Este documento contém os checklists completos para submissão aos processos de aprovação do Facebook/Instagram e Google OAuth.

---

## ✅ STATUS ATUAL DO CÓDIGO

### Documentação Legal - COMPLETA ✅

- [x] **Política de Privacidade** - https://formulareal.online/legal/privacy
- [x] **Termos de Uso** - https://formulareal.online/legal/terms
- [x] **Política de Cookies** - https://formulareal.online/legal/cookies
- [x] **Data Deletion Instructions** - https://formulareal.online/legal/data-deletion (CRIADA AGORA)

### Segurança - COMPLETA ✅

- [x] HTTPS em produção (formulareal.online)
- [x] Proteção CSRF (oauth_states)
- [x] Rate limiting (Upstash Redis)
- [x] Tokens seguros (não expostos)
- [x] RLS (Row Level Security)
- [x] Refresh tokens implementados
- [x] Validação de state no OAuth

### Funcionalidades - COMPLETA ✅

- [x] Revogação de acesso Instagram
- [x] Revogação de acesso Google Drive
- [x] Exportação de dados do usuário
- [x] Exclusão de conta

---

## 📋 CHECKLIST FACEBOOK/INSTAGRAM APP REVIEW

### Fase 1: Configuração Inicial

#### Console Facebook Developers
- [ ] **Criar/Configurar App** em https://developers.facebook.com/apps
- [ ] **Adicionar produto "Instagram Basic Display"**
- [ ] **Adicionar produto "Instagram Graph API"**
- [ ] **Configurar App ID e App Secret**

#### Variáveis de Ambiente
- [ ] **NEXT_PUBLIC_FACEBOOK_APP_ID** configurado no Vercel
- [ ] **FACEBOOK_APP_SECRET** configurado no Vercel (SECRET)
- [ ] **NEXT_PUBLIC_APP_URL** = `https://formulareal.online`

#### Redirect URIs
- [ ] **Adicionar no Facebook:** `https://formulareal.online/api/instagram/callback`
- [ ] **Verificar no código** que está usando a mesma URI

### Fase 2: Verificação de Domínio (OBRIGATÓRIO)

- [ ] **Acessar:** Facebook Developers > Seu App > Settings > Basic
- [ ] **Adicionar domínio:** `formulareal.online` em "App Domains"
- [ ] **Clicar em "Domain Verification"**
- [ ] **Escolher método de verificação:**
  - [ ] Opção A: Meta Tag HTML no `app/layout.tsx`
  - [ ] Opção B: Upload de arquivo HTML na raiz
  - [ ] Opção C: DNS TXT Record
- [ ] **Confirmar verificação aprovada**

### Fase 3: Informações do App

#### URLs Obrigatórias
- [ ] **URL do App:** `https://formulareal.online`
- [ ] **Política de Privacidade:** `https://formulareal.online/legal/privacy`
- [ ] **Termos de Uso:** `https://formulareal.online/legal/terms`
- [ ] **Data Deletion Instructions:** `https://formulareal.online/legal/data-deletion`

#### Ícones e Assets
- [ ] **Ícone do App:** 1024x1024 px (PNG)
- [ ] **Logo:** Alta resolução, fundo transparente
- [ ] **Business Use Case Icon:** 400x400 px

#### Informações Básicas
- [ ] **Nome do App:** Leadgram
- [ ] **Categoria:** Business and Pages Management / Content Management / Analytics
- [ ] **Descrição:** (breve descrição do que o app faz)

### Fase 4: Permissões (Scopes)

#### Justificativas Preparadas

**instagram_basic:**
```
Precisamos acessar informações básicas do perfil do Instagram do usuário
para exibir o nome de usuário, foto de perfil e permitir a conexão da conta
com nossa plataforma de gerenciamento de conteúdo.
```

**instagram_manage_insights:**
```
Solicitamos acesso às métricas e insights dos posts do Instagram para
fornecer análises de desempenho ao usuário. Nosso app exibe dashboards
com métricas como curtidas, comentários, alcance e impressões para ajudar
criadores de conteúdo a melhorar sua estratégia.
```

**pages_show_list:**
```
Precisamos listar as páginas do Facebook vinculadas ao usuário para
identificar contas Instagram Business conectadas a essas páginas,
permitindo a sincronização correta de dados.
```

**pages_read_engagement:**
```
Solicitamos acesso às métricas de engajamento das páginas para fornecer
análises completas de desempenho em todas as plataformas conectadas.
```

**business_management:**
```
Necessário para gerenciar contas Instagram Business e acessar informações
de contas conectadas através do Facebook Business Manager.
```

### Fase 5: Vídeo Demonstrativo

**Requisitos:**
- [ ] **Duração:** 2-5 minutos
- [ ] **Resolução:** Mínimo 1280x720
- [ ] **Formato:** MP4, MOV ou link YouTube (não listado)

**Conteúdo do Vídeo:**
1. [ ] Mostrar login no app (formulareal.online)
2. [ ] Navegar até conexão com Instagram
3. [ ] Clicar em "Conectar Instagram"
4. [ ] Mostrar tela de permissões do Facebook
5. [ ] Concluir autorização
6. [ ] Demonstrar uso de cada permissão:
   - [ ] `instagram_basic`: Mostrar perfil conectado
   - [ ] `instagram_manage_insights`: Mostrar dashboard de métricas
   - [ ] `pages_show_list`: Mostrar páginas listadas
   - [ ] `pages_read_engagement`: Mostrar métricas de engajamento
   - [ ] `business_management`: Mostrar gerenciamento de conta business
7. [ ] Demonstrar revogação de acesso (disconnect)

### Fase 6: Conta de Teste

- [ ] **Criar conta Instagram Business de teste**
- [ ] **Adicionar posts e dados para demonstração**
- [ ] **Adicionar como testador no Facebook App:**
  - Facebook Developers > Roles > Test Users
- [ ] **Preparar credenciais de teste para o revisor**

### Fase 7: Instruções de Teste

Preparar documento com:
- [ ] **Credenciais de login da conta de teste**
- [ ] **Passo a passo de como testar cada funcionalidade**
- [ ] **Exemplos de dados que serão exibidos**
- [ ] **Como revogar acesso**

### Fase 8: Submissão

- [ ] **Acessar:** Facebook Developers > Seu App > App Review > Permissions and Features
- [ ] **Selecionar cada permissão necessária**
- [ ] **Preencher justificativas (usar textos acima)**
- [ ] **Upload do vídeo demonstrativo**
- [ ] **Fornecer credenciais e instruções de teste**
- [ ] **Submeter para revisão**

### Fase 9: Aguardar Revisão

- [ ] **Prazo esperado:** 3-7 dias úteis
- [ ] **Monitorar e-mail para notificações**
- [ ] **Responder prontamente se houver perguntas**
- [ ] **Fazer ajustes se rejeitado**

---

## 📋 CHECKLIST GOOGLE OAUTH VERIFICATION

### Fase 1: Configuração Google Cloud

#### Google Cloud Console
- [ ] **Acessar:** https://console.cloud.google.com
- [ ] **Projeto criado:** (nome do projeto)
- [ ] **Google Drive API habilitada**
- [ ] **OAuth 2.0 Client ID criado** (tipo: Web application)

#### Credenciais OAuth 2.0
- [ ] **Client ID configurado**
- [ ] **Client Secret configurado**
- [ ] **Redirect URIs autorizadas:**
  - `https://formulareal.online/api/google-drive/callback`

#### Variáveis de Ambiente
- [ ] **NEXT_PUBLIC_GOOGLE_CLIENT_ID** configurado no Vercel
- [ ] **GOOGLE_CLIENT_SECRET** configurado no Vercel (SECRET)
- [ ] **NEXT_PUBLIC_APP_URL** = `https://formulareal.online`

### Fase 2: OAuth Consent Screen

#### User Type
- [ ] **Selecionar "External"** (usuários públicos)

#### App Information
- [ ] **App name:** Leadgram
- [ ] **User support email:** suporte@leadgram.com.br
- [ ] **App logo:** 120x120 px (PNG ou JPG)
- [ ] **App domain:** formulareal.online
- [ ] **Homepage:** https://formulareal.online
- [ ] **Privacy Policy:** https://formulareal.online/legal/privacy
- [ ] **Terms of Service:** https://formulareal.online/legal/terms

#### Developer Contact
- [ ] **Email:** dev@leadgram.com.br (ou suporte@)

#### Scopes
- [ ] **Adicionar:** `https://www.googleapis.com/auth/drive.file`
- [ ] **Adicionar:** `https://www.googleapis.com/auth/drive.metadata.readonly`
- [ ] **Adicionar:** `https://www.googleapis.com/auth/userinfo.email`

### Fase 3: Justificativas dos Scopes

**drive.file:**
```
Nosso aplicativo permite que usuários façam upload de vídeos para o
Google Drive, organizados em pastas. Precisamos desta permissão para
criar pastas e fazer upload de arquivos de vídeo criados pelos usuários
através de nossa plataforma.
```

**drive.metadata.readonly:**
```
Utilizamos esta permissão para listar os vídeos que o usuário enviou
através do nosso app, exibindo informações como nome do arquivo, data
de upload e tamanho, para que o usuário possa gerenciar seus vídeos.
```

**userinfo.email:**
```
Solicitamos o email do usuário para identificar qual conta do Google
Drive está conectada, exibir esta informação na interface e permitir
que o usuário gerencie múltiplas contas se necessário.
```

### Fase 4: Verificação de Domínio

#### Google Search Console
- [ ] **Acessar:** https://search.google.com/search-console
- [ ] **Adicionar propriedade:** formulareal.online
- [ ] **Escolher método de verificação:**
  - [ ] Opção A: DNS TXT record
  - [ ] Opção B: Meta tag HTML
  - [ ] Opção C: Upload de arquivo HTML
- [ ] **Confirmar verificação aprovada**
- [ ] **Vincular no Google Cloud Console**

### Fase 5: Vídeo Demonstrativo

**Requisitos:**
- [ ] **Duração:** 3-5 minutos
- [ ] **Resolução:** Mínimo 1280x720
- [ ] **Formato:** MP4, MOV ou link YouTube

**Conteúdo do Vídeo:**
1. [ ] Login no app (formulareal.online)
2. [ ] Navegar até conexão com Google Drive
3. [ ] Clicar em "Conectar Google Drive"
4. [ ] Mostrar tela de permissões do Google
5. [ ] Demonstrar uso de cada scope:
   - [ ] `drive.file`: Fazer upload de vídeo, mostrar pasta criada
   - [ ] `drive.metadata.readonly`: Listar vídeos enviados
   - [ ] `userinfo.email`: Mostrar email da conta conectada
6. [ ] Demonstrar revogação de acesso
7. [ ] Mostrar que arquivos permanecem no Drive do usuário

### Fase 6: Documentação de Segurança

Preparar documento descrevendo:
- [ ] **OAuth Flow implementado** (state, CSRF protection)
- [ ] **Armazenamento seguro de tokens** (Supabase, encriptados)
- [ ] **Refresh token** automático
- [ ] **HTTPS obrigatório**
- [ ] **Revogação de acesso** disponível
- [ ] **Compliance LGPD**

### Fase 7: Submissão

- [ ] **Google Cloud Console > OAuth consent screen**
- [ ] **Clicar em "Publish App"**
- [ ] **Se scopes sensíveis, clicar em "Submit for Verification"**
- [ ] **Preencher formulário de verificação**
- [ ] **Upload de vídeo demonstrativo**
- [ ] **Upload de documentação de segurança**
- [ ] **Submeter**

### Fase 8: Aguardar Revisão

- [ ] **Prazo esperado:** 4-6 semanas
- [ ] **Monitorar e-mail para notificações**
- [ ] **Responder prontamente a perguntas**
- [ ] **Fazer ajustes se necessário**

---

## 🔧 CONFIGURAÇÕES FINAIS NO VERCEL

### Variáveis de Ambiente Críticas

Verificar se estão configuradas no Vercel (Production):

```env
# App
NEXT_PUBLIC_APP_URL=https://formulareal.online

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Facebook/Instagram
NEXT_PUBLIC_FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret

# Google Drive
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://seu-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu-token

# Cron Protection
CRON_SECRET=seu-secret-aleatorio
```

### Deploy da Página de Data Deletion

- [ ] **Fazer commit** da nova página `app/(legal)/legal/data-deletion/page.tsx`
- [ ] **Push para repositório**
- [ ] **Aguardar deploy automático no Vercel**
- [ ] **Testar acesso:** https://formulareal.online/legal/data-deletion

---

## 📧 EMAILS NECESSÁRIOS

Configurar emails profissionais (via Cloudflare Email Routing, Zoho, ou Google Workspace):

- [ ] **suporte@leadgram.com.br** ou usar domínio formulareal.online
- [ ] **privacidade@leadgram.com.br** ou privacidade@formulareal.online
- [ ] **dpo@leadgram.com.br** ou dpo@formulareal.online
- [ ] **legal@leadgram.com.br** ou legal@formulareal.online
- [ ] **dev@leadgram.com.br** ou dev@formulareal.online

**Alternativa:** Pode-se usar apenas um email (ex: contato@formulareal.online) e mencionar nas políticas.

---

## 🎯 RESUMO - PRONTO PARA SUBMETER?

### ✅ CÓDIGO - PRONTO
- [x] Documentação legal completa
- [x] Página de Data Deletion criada (precisa fazer deploy)
- [x] Segurança implementada corretamente
- [x] Funcionalidades de OAuth funcionando
- [x] Deploy em produção com HTTPS

### ⚠️ PENDENTE - CONFIGURAÇÕES EXTERNAS

**Facebook:**
- [ ] Configurar App no Facebook Developers
- [ ] Verificar domínio
- [ ] Gravar vídeo
- [ ] Criar conta de teste
- [ ] Submeter App Review

**Google:**
- [ ] Configurar OAuth consent screen
- [ ] Verificar domínio no Search Console
- [ ] Gravar vídeo
- [ ] Submeter para verificação (opcional mas recomendado)

**Infraestrutura:**
- [ ] Verificar variáveis de ambiente no Vercel
- [ ] Configurar emails profissionais
- [ ] Fazer deploy da página de data deletion

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1: Preparação
- Dias 1-2: Configurar Apps no Facebook e Google
- Dias 3-4: Verificar domínios (ambos)
- Dia 5: Configurar emails profissionais
- Dias 6-7: Deploy da página de data deletion e testes

### Semana 2: Materiais
- Dias 1-3: Gravar vídeos demonstrativos (Facebook e Google)
- Dias 4-5: Preparar documentação e instruções de teste
- Dias 6-7: Criar conta de teste Instagram com dados

### Semana 3: Submissões
- Dia 1: Submeter Facebook App Review
- Dia 2: Submeter Google OAuth Verification
- Dias 3-7: Responder feedbacks iniciais

### Semanas 4-8: Aprovações
- Facebook: Resposta em 3-7 dias (revisões se necessário)
- Google: Resposta em 4-6 semanas

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

1. **Deploy da página de data deletion:**
   ```bash
   git add app/(legal)/legal/data-deletion/page.tsx
   git commit -m "feat: Adiciona página de Data Deletion (obrigatório Facebook)"
   git push
   ```

2. **Testar página após deploy:**
   - https://formulareal.online/legal/data-deletion

3. **Configurar Apps:**
   - Facebook Developers
   - Google Cloud Console

4. **Verificar variáveis de ambiente no Vercel**

5. **Gravar vídeos demonstrativos**

6. **Submeter para revisão!**

---

**Documento criado em:** 21 de novembro de 2025
**Status:** Código pronto, aguardando configurações externas e submissões
