# ✅ CHECKLIST - Autorização Facebook/Instagram e Google

**Data:** 24/01/2025
**Projeto:** Leadgram
**URL:** https://formulareal.online

---

## 📊 RESUMO EXECUTIVO

**Status Atual:** 70% Completo
**Itens Críticos Pendentes:** 5
**Estimativa de Conclusão:** 2-3 dias

### O que já temos implementado:
- ✅ Políticas legais completas (Privacidade, Termos, Data Deletion)
- ✅ Sistema de exclusão de dados funcionando
- ✅ App em produção e funcional
- ✅ URLs públicas acessíveis

### O que precisamos preparar:
- ⚠️ Documentação para submissão (screenshots, descrições, vídeos)
- ⚠️ Assets visuais nos tamanhos corretos
- ⚠️ Verificação de domínio no Google

---

## 📋 PARTE 1 - O QUE JÁ TEMOS (COMPLETO)

### ✅ 1. Política de Privacidade
- **URL:** `https://formulareal.online/legal/privacy`
- **Status:** ✅ Implementada e pública
- **Conteúdo:**
  - Explica coleta e uso de dados
  - Cumpre LGPD
  - Explica integração com Instagram e Google Drive
  - Lista dados coletados e finalidade

### ✅ 2. Termos de Serviço
- **URL:** `https://formulareal.online/legal/terms`
- **Status:** ✅ Implementado e público
- **Conteúdo:**
  - Regras de uso do aplicativo
  - Direitos e responsabilidades
  - Propriedade intelectual

### ✅ 3. URL de Exclusão de Dados (Data Deletion)
- **URL:** `https://formulareal.online/legal/data-deletion`
- **Status:** ✅ Implementada (EXIGÊNCIA OBRIGATÓRIA DO FACEBOOK)
- **Conteúdo:**
  - Instruções em português e inglês
  - 3 opções de exclusão:
    1. Direto no app (Configurações)
    2. Email para privacy@leadgram.com
    3. Email para DPO
  - Prazo: até 30 dias

### ✅ 4. Política de Cookies
- **URL:** `https://formulareal.online/legal/cookies`
- **Status:** ✅ Implementada e pública

### ✅ 5. Funcionalidade de Exclusão de Conta
- **Localização:** Configurações → Privacidade e Dados → Zona de Perigo
- **API:** `/api/settings/account/delete`
- **Status:** ✅ Funcionando
- **Processo:**
  - Usuário solicita exclusão
  - Sistema remove todos os dados
  - Confirmação por email

---

## ⚠️ PARTE 2 - O QUE PRECISAMOS COMPLETAR

### 📱 PARA AUTORIZAÇÃO FACEBOOK/INSTAGRAM

#### 1. ⚠️ App Icon/Logo (CRÍTICO)
**Status:** PENDENTE
**Requisitos:**
- Tamanho: 1024x1024 pixels
- Formato: PNG com fundo transparente
- Sem texto dentro do ícone
- Deve representar a marca Leadgram

**Ação Necessária:**
- [ ] Designer criar logo nos tamanhos corretos
- [ ] Exportar em alta resolução

---

#### 2. ⚠️ Screenshots do Aplicativo (CRÍTICO)
**Status:** PENDENTE
**Quantidade:** 3-5 screenshots
**Tamanho Recomendado:** 1920x1080 pixels

**Screenshots Necessários:**
1. **Tela de Login/Boas-vindas**
   - Mostra a primeira impressão do app

2. **Dashboard Principal**
   - Visão geral das funcionalidades
   - Mostra posts do Instagram

3. **Conexão com Instagram**
   - Processo de autorização
   - Botão "Conectar Instagram"

4. **Visualização de Métricas**
   - Como o app mostra insights dos posts
   - Gráficos e estatísticas

5. **Upload/Google Drive** (opcional)
   - Funcionalidade de backup

**Ação Necessária:**
- [ ] Tirar screenshots em alta resolução
- [ ] Anotar descrição de cada screenshot
- [ ] Salvar em pasta organizada

---

#### 3. ⚠️ Descrição Detalhada do App (CRÍTICO)
**Status:** PENDENTE
**Tamanho:** 200-500 palavras

**Template para Descrição:**

```
LEADGRAM - Plataforma de Gestão de Conteúdo para Criadores

O Leadgram é uma plataforma web desenvolvida para criadores de conteúdo que
desejam organizar, analisar e gerenciar suas publicações do Instagram de forma
profissional.

PRINCIPAIS FUNCIONALIDADES:

1. Banco de Ideias de Conteúdo
   - Organização de ideias por funil de vendas
   - Sistema de tags e categorias
   - Anotações e planejamento

2. Integração com Instagram
   - Visualização de posts publicados
   - Análise de métricas e engajamento
   - Identificação de top posts
   - Busca por hashtags e perfis

3. Backup Automático (Google Drive)
   - Upload de vídeos para Google Drive
   - Organização automática em pastas
   - Segurança dos conteúdos criados

4. Análise de Performance
   - Métricas de engajamento
   - Gráficos de crescimento
   - Insights sobre melhor tipo de conteúdo

PÚBLICO-ALVO:
Criadores de conteúdo, influenciadores digitais, gestores de mídias sociais e
pequenos negócios que utilizam Instagram como principal canal de comunicação.

POR QUE PRECISAMOS DAS PERMISSÕES:

Instagram (instagram_basic, pages_read_engagement):
- Para exibir os posts do usuário na plataforma
- Para calcular métricas de engajamento
- Para identificar conteúdos de melhor performance
- Dados são usados APENAS para análise pessoal do usuário

Google Drive (drive.file):
- Para fazer backup dos vídeos criados pelo usuário
- Para organizar conteúdo em pastas automáticas
- Apenas arquivos criados pelo app são acessados
- Usuário tem controle total sobre uploads

SEGURANÇA E PRIVACIDADE:
- Dados nunca são compartilhados com terceiros
- Usuário pode excluir conta e dados a qualquer momento
- Cumpre LGPD e políticas do Facebook/Google
- URLs públicas: Privacidade, Termos, Data Deletion
```

**Ação Necessária:**
- [ ] Revisar e adaptar descrição acima
- [ ] Traduzir para inglês se necessário
- [ ] Ter versão pronta para colar no formulário

---

#### 4. ⚠️ Justificativa de Permissões (CRÍTICO)
**Status:** PENDENTE

**Instagram - Permissões Solicitadas:**

| Permissão | Para que serve | Justificativa |
|-----------|---------------|---------------|
| `instagram_basic` | Ver perfil básico | Exibir nome e foto do usuário no app |
| `instagram_content_publish` | Ver posts públicos | Listar posts do usuário para análise |
| `pages_read_engagement` | Ver métricas | Mostrar likes, comentários, alcance |

**Google Drive - Permissões Solicitadas:**

| Permissão | Para que serve | Justificativa |
|-----------|---------------|---------------|
| `drive.file` | Acessar arquivos criados pelo app | Upload de vídeos para backup |

**Ação Necessária:**
- [ ] Copiar tabela acima para formulário
- [ ] Adicionar exemplos concretos de uso

---

#### 5. ⚠️ Vídeo Demonstração (RECOMENDADO)
**Status:** PENDENTE
**Duração:** 30-60 segundos
**Formato:** MP4, MOV ou similar

**Roteiro do Vídeo:**
1. (0-10s) Tela inicial - Logo Leadgram
2. (10-20s) Login e conexão com Instagram
3. (20-35s) Dashboard mostrando posts e métricas
4. (35-45s) Funcionalidade de banco de ideias
5. (45-60s) Upload para Google Drive

**Ação Necessária:**
- [ ] Gravar vídeo da tela (pode usar OBS Studio ou similar)
- [ ] Editar para 30-60 segundos
- [ ] Adicionar música de fundo (opcional)

---

### 🔍 PARA AUTORIZAÇÃO GOOGLE (OAuth/Drive)

#### 1. ⚠️ Logo/Ícone
**Status:** PENDENTE
**Requisitos:**
- Tamanho mínimo: 120x120 pixels
- Formato: PNG ou JPG
- Pode ser o mesmo logo do Facebook

**Ação Necessária:**
- [ ] Usar mesmo logo preparado para Facebook

---

#### 2. ✅ URL de Privacidade
**Status:** ✅ COMPLETO
**URL:** `https://formulareal.online/legal/privacy`

---

#### 3. ✅ Termos de Serviço
**Status:** ✅ COMPLETO
**URL:** `https://formulareal.online/legal/terms`

---

#### 4. ⚠️ Verificação de Domínio (CRÍTICO)
**Status:** PENDENTE
**Onde fazer:** Google Search Console
**URL:** https://search.google.com/search-console

**Passo a Passo:**
1. Acessar Google Search Console
2. Adicionar propriedade: `formulareal.online`
3. Escolher método de verificação:
   - **Opção 1:** Arquivo HTML (upload no servidor)
   - **Opção 2:** Meta tag HTML (adicionar no site)
   - **Opção 3:** DNS TXT record (mais técnico)
4. Confirmar verificação

**Ação Necessária:**
- [ ] Acessar Google Search Console
- [ ] Verificar domínio formulareal.online
- [ ] Guardar comprovante de verificação

---

#### 5. ⚠️ Justificativa de Escopo do Drive
**Status:** PENDENTE

**Escopo Solicitado:** `https://www.googleapis.com/auth/drive.file`

**Justificativa para Google:**
```
ESCOPO: drive.file (Acesso a arquivos criados pelo app)

JUSTIFICATIVA:
O Leadgram permite que criadores de conteúdo façam backup automático de seus
vídeos no Google Drive. Este escopo é necessário para:

1. Upload de Vídeos
   - Usuário seleciona vídeo no computador
   - App faz upload para pasta específica no Drive do usuário
   - Organização automática por data/categoria

2. Listagem de Vídeos
   - Exibir vídeos já enviados pelo app
   - Permitir download de volta para computador
   - Visualizar status de uploads

3. Exclusão de Vídeos
   - Usuário pode deletar vídeos que não quer mais
   - Gerenciamento de espaço no Drive

IMPORTANTE:
- Apenas acessamos arquivos CRIADOS pelo Leadgram
- NÃO acessamos outros arquivos do Drive do usuário
- Usuário tem controle total sobre uploads e exclusões
- Escopo "drive.file" é o mais restritivo e seguro

ALTERNATIVAS CONSIDERADAS:
- drive.readonly: Não permite upload (insuficiente)
- drive: Acessa TODOS arquivos (excessivo e desnecessário)
- drive.file: ✅ IDEAL - Apenas arquivos do app
```

**Ação Necessária:**
- [ ] Copiar justificativa acima
- [ ] Adaptar se necessário

---

## 📝 PARTE 3 - INFORMAÇÕES DE CONTATO

**Para Submissão nos Formulários:**

| Campo | Informação |
|-------|-----------|
| **Nome do App** | Leadgram |
| **URL do App** | https://formulareal.online |
| **Categoria** | Social Media Management / Productivity |
| **Email de Suporte** | support@leadgram.com *(ou email atual)* |
| **Email de Privacidade** | privacy@leadgram.com *(ou email atual)* |
| **URL Privacidade** | https://formulareal.online/legal/privacy |
| **URL Termos** | https://formulareal.online/legal/terms |
| **URL Data Deletion** | https://formulareal.online/legal/data-deletion |
| **Empresa/Desenvolvedor** | *(Nome da empresa)* |

**Ação Necessária:**
- [ ] Confirmar emails de contato
- [ ] Criar emails se não existirem
- [ ] Testar se emails funcionam

---

## 🎯 PARTE 4 - PLANO DE AÇÃO

### PRIORIDADE 1 - CRÍTICO (Fazer Primeiro)
**Prazo Sugerido: 1-2 dias**

- [ ] **Designer:** Criar logo 1024x1024 PNG
- [ ] **Equipe:** Tirar 5 screenshots do app funcionando
- [ ] **Redação:** Escrever descrição de 300-500 palavras
- [ ] **Técnico:** Verificar domínio no Google Search Console
- [ ] **Admin:** Confirmar/criar emails de contato

### PRIORIDADE 2 - IMPORTANTE (Fazer em Seguida)
**Prazo Sugerido: 2-3 dias**

- [ ] **Marketing:** Gravar vídeo demo 30-60 segundos
- [ ] **Redação:** Preparar justificativas detalhadas de permissões
- [ ] **Técnico:** Organizar todos arquivos em pasta única
- [ ] **Admin:** Revisar todas URLs públicas

### PRIORIDADE 3 - OPCIONAL (Se Houver Tempo)
- [ ] Traduzir descrição para inglês
- [ ] Preparar FAQ sobre privacidade
- [ ] Criar página de status do app

---

## 📊 PARTE 5 - ONDE SUBMETER

### Facebook/Instagram
**URL:** https://developers.facebook.com/apps
**Processo:**
1. Acessar Facebook for Developers
2. Selecionar seu app
3. App Review → Permissions and Features
4. Solicitar permissões: `instagram_basic`, `pages_read_engagement`
5. Upload de documentação preparada
6. Aguardar revisão (7-14 dias úteis)

### Google Cloud Platform
**URL:** https://console.cloud.google.com
**Processo:**
1. Acessar Google Cloud Console
2. Selecionar projeto
3. APIs & Services → OAuth consent screen
4. Preencher informações do app
5. Adicionar escopo: `drive.file`
6. Submit for verification
7. Aguardar revisão (3-7 dias úteis)

---

## ✅ PARTE 6 - CHECKLIST FINAL

### Antes de Submeter - CONFERIR:

#### Documentação
- [ ] Logo 1024x1024 PNG pronto
- [ ] 5 screenshots em alta resolução
- [ ] Descrição do app (300-500 palavras)
- [ ] Vídeo demo (30-60 segundos) - opcional
- [ ] Justificativas de permissões escritas

#### URLs Públicas Funcionando
- [ ] https://formulareal.online/legal/privacy ✅
- [ ] https://formulareal.online/legal/terms ✅
- [ ] https://formulareal.online/legal/data-deletion ✅
- [ ] https://formulareal.online ✅

#### Contatos
- [ ] Email de suporte funcionando
- [ ] Email de privacidade funcionando
- [ ] Alguém monitorando esses emails

#### Técnico
- [ ] Domínio verificado no Google Search Console
- [ ] App em produção estável
- [ ] Funcionalidade de exclusão testada

---

## 📞 PARTE 7 - CONTATOS E SUPORTE

### Dúvidas Sobre Este Checklist
**Desenvolvedor:** Claude Code
**Data Criação:** 24/01/2025

### Recursos Oficiais
- **Facebook App Review:** https://developers.facebook.com/docs/app-review
- **Google OAuth Verification:** https://support.google.com/cloud/answer/9110914
- **LGPD:** https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd

---

## 📈 ESTIMATIVAS

### Tempo Necessário
- **Preparação de Assets:** 1-2 dias
- **Preenchimento de Formulários:** 2-3 horas
- **Revisão Facebook:** 7-14 dias úteis
- **Revisão Google:** 3-7 dias úteis
- **TOTAL:** 10-21 dias (do início ao fim)

### Custos
- **Facebook:** Gratuito
- **Google:** Gratuito (pode requerer verificação de terceiros ~$15-75 USD se app for complexo)
- **Design de Logo:** *(se contratar designer externo)*

---

## 🎉 PRÓXIMOS PASSOS IMEDIATOS

**HOJE:**
1. Reunir equipe para dividir tarefas
2. Designer começar logo 1024x1024
3. Alguém tirar screenshots do app

**AMANHÃ:**
4. Verificar domínio no Google Search Console
5. Escrever descrição completa do app
6. Criar/confirmar emails de contato

**DEPOIS DE AMANHÃ:**
7. Revisar toda documentação
8. Submeter para Facebook
9. Submeter para Google

---

**DOCUMENTO CRIADO EM:** 24/01/2025
**ÚLTIMA ATUALIZAÇÃO:** 24/01/2025
**VERSÃO:** 1.0

---

## 💡 OBSERVAÇÕES FINAIS

- Você já tem **70% do trabalho pronto** (toda parte técnica e legal)
- Falta principalmente **documentação e assets visuais**
- Processo de aprovação pode levar **2-3 semanas** após submissão
- Se houver rejeição, geralmente pedem apenas ajustes pequenos
- Mantenha emails de contato monitorados durante processo de revisão

**BOA SORTE! 🚀**
