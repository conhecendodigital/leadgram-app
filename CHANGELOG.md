# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Em Desenvolvimento
- Sistema de automações de engajamento
- Integração com TikTok API
- Integração com YouTube API

## [1.0.0] - 2025-01-21

### 🎉 Lançamento Inicial

Primeira versão estável do Leadgram pronta para produção!

### ✨ Adicionado

#### Autenticação & Segurança
- Login/Registro com Supabase Auth
- OAuth com Instagram (Instagram Graph API)
- OAuth com Google Drive
- Autenticação de 2 fatores (2FA) com OTP
- Proteção CSRF em OAuth callbacks
- Rate limiting em endpoints sensíveis
- Validação de webhooks do Mercado Pago
- Páginas legais (Privacidade, Termos, Cookies) - LGPD compliant
- Banner de consentimento de cookies

#### Gerenciamento de Ideias
- CRUD completo de ideias de conteúdo
- Organização por status (Ideia → Gravado → Postado)
- Classificação por funil (Topo, Meio, Fundo)
- Suporte multi-plataforma (Instagram, TikTok, YouTube, Facebook)
- Campo de roteiro para planejamento
- Instruções para editor
- Vinculação com posts publicados
- Upload e vinculação de vídeos

#### Integração Instagram
- Conexão via Instagram Graph API
- Sincronização automática de posts via cron jobs
- Métricas detalhadas (impressions, reach, engagement, saves, etc)
- Refresh automático de tokens (60 dias)
- Visualização de top posts
- Busca de perfis públicos (via RapidAPI)
- Proxy de imagens do Instagram

#### Analytics & Métricas
- Dashboard principal com estatísticas gerais
- Gráficos de distribuição por funil de vendas
- Métricas agregadas por plataforma
- Ranking de top ideias por engagement
- Tracking de engagement rate
- Histórico de sincronizações

#### Armazenamento & Upload
- Integração completa com Google Drive API v3
- Upload chunked para arquivos grandes (até 2GB)
- Criação automática de pastas por ideia
- Listagem de vídeos com thumbnail
- Exclusão de vídeos com validação de ownership
- Validação de tipo e tamanho de arquivo

#### Sistema de Pagamentos
- Integração com Mercado Pago
- 3 planos de assinatura (Free, Pro, Premium)
- Webhooks para confirmação automática de pagamento
- Gestão de assinaturas ativas
- Histórico de pagamentos
- Limits por plano (ideias, uploads, etc)

#### Admin Panel
- Dashboard administrativo completo
- Gestão de usuários e assinaturas
- Configurações de sistema
- Sistema de notificações para admins
- Estatísticas de uso da plataforma
- Gestão de banco de dados
- Limpeza de dados antigos
- Configuração de Mercado Pago via painel

#### UX/UI
- Design profissional inspirado no Meta Business Suite
- Interface responsiva (mobile-first)
- Suporte a dark mode
- Animações suaves com Framer Motion
- Loading states e skeleton loaders
- Error boundaries para tratamento de erros
- Toasts para feedback de ações
- Tour guiado para novos usuários

#### Cron Jobs
- Sincronização automática de posts do Instagram (6 em 6 horas)
- Refresh automático de tokens expirados (diário)
- Tarefas de manutenção diária (limpeza, notificações)

### 🐛 Corrigido

- **#1**: Validação de external_reference no webhook Mercado Pago
- **#2**: Race condition em datas de subscription
- **#3**: Validação de range de chunks no upload
- **#4**: N+1 query no sync de posts do Instagram (agora usa batching)
- **#5**: CSRF bypass no OAuth Instagram (update atômico)
- **#6**: Validação de ownership em GET /ideas/[id]
- **#7**: Perda de dados ao editar plataformas de ideias (smart update)
- **#8**: RapidAPI key validation incorreta
- **#10**: Validação de tamanho máximo de chunk (10MB)
- **#12**: Validação de Content-Type em webhook
- **#14**: Campo errado no cron (instagram_media_id vs instagram_post_id)
- **#16**: Validação de ownership ao deletar vídeos
- **#17**: Validação de plataformas no backend
- **#19**: Validação de fileSize no init-upload (máx 2GB)
- **#20**: Timestamp preciso no token refresh

### 🗑️ Removido

- Rotas de teste (test-rapidapi, test-env) que expunham env vars
- Arquivos temporários e de debug (image.png, problema.md)
- Scripts de diagnóstico obsoletos
- Middleware proxy.ts não utilizado
- Hook use-auto-save.ts não referenciado
- ThemeProvider vazio sem lógica
- SVGs padrão do Next.js não utilizados
- Documentação desorganizada (movida para docs/archive/)

### 🔄 Mudanças

- Migrado para Next.js 16 com Turbopack
- Melhorada performance do sync com batching
- Reorganizada estrutura de documentação
- Criado logger estruturado (lib/logger.ts)
- Otimizada validação de arquivos
- Melhorado tratamento de erros em APIs

### 🔒 Segurança

- Implementado rate limiting com Upstash Redis
- Adicionada validação CSRF em todos os OAuth flows
- Validação de webhooks do Mercado Pago
- Sanitização de inputs em todos os endpoints
- Proteção contra N+1 queries
- Validação de ownership em operações sensíveis
- Remoção de console.logs com dados sensíveis em produção

## Links

- [Repositório](https://github.com/conhecendodigital/leadgram-app)
- [Issues](https://github.com/conhecendodigital/leadgram-app/issues)
- [Pull Requests](https://github.com/conhecendodigital/leadgram-app/pulls)
