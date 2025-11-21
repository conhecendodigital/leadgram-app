<div align="center">

# 🚀 Leadgram

### Plataforma Completa de Gerenciamento de Conteúdo para Criadores Digitais

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Demo](https://leadgram.vercel.app) · [Documentação](./docs) · [Reportar Bug](https://github.com/conhecendodigital/leadgram-app/issues) · [Solicitar Feature](https://github.com/conhecendodigital/leadgram-app/issues)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Features](#-features)
- [Stack Tecnológica](#-stack-tecnológica)
- [Quick Start](#-quick-start)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Leadgram** é uma plataforma moderna e completa para criadores digitais gerenciarem seu conteúdo de forma eficiente. Inspirado no Meta Business Suite, oferece uma experiência profissional para organizar ideias, acompanhar métricas e integrar com principais redes sociais.

### Por que Leadgram?

- ✨ **Interface Profissional** - Design moderno inspirado no Meta Business Suite
- 🔄 **Sincronização Automática** - Métricas do Instagram atualizadas automaticamente
- 📊 **Analytics Poderoso** - Visualize performance com gráficos interativos
- 🎨 **Multi-Plataforma** - Gerencie conteúdo para Instagram, TikTok, YouTube e Facebook
- 🗂️ **Organização por Funil** - Classifique conteúdo por topo, meio e fundo de funil
- ☁️ **Upload de Vídeos** - Integração com Google Drive para armazenamento
- 💳 **Sistema de Pagamentos** - Planos via Mercado Pago integrado

---

## ✨ Features

### 🔐 Autenticação & Segurança
- [x] Login/Registro com Supabase Auth
- [x] OAuth com Instagram
- [x] OAuth com Google Drive
- [x] Autenticação de 2 fatores (2FA)
- [x] Proteção CSRF em OAuth callbacks
- [x] Rate limiting em endpoints sensíveis
- [x] Validação de webhooks do Mercado Pago

### 💡 Gerenciamento de Ideias
- [x] CRUD completo de ideias de conteúdo
- [x] Organização por status (Ideia → Gravado → Postado)
- [x] Classificação por funil (Topo, Meio, Fundo)
- [x] Multi-plataforma (Instagram, TikTok, YouTube, Facebook)
- [x] Roteiro e instruções para editor
- [x] Link com posts publicados
- [x] Upload e vinculação de vídeos

### 📸 Integração Instagram
- [x] Conexão via Instagram Graph API
- [x] Sincronização automática de posts (cron jobs)
- [x] Métricas detalhadas (impressions, reach, engagement, saves)
- [x] Refresh automático de tokens
- [x] Visualização de top posts
- [x] Busca de perfis públicos

### 📊 Analytics & Métricas
- [x] Dashboard com estatísticas gerais
- [x] Gráficos de distribuição por funil
- [x] Métricas por plataforma
- [x] Ranking de top ideias
- [x] Tracking de engagement rate
- [x] Histórico de sincronizações

### ☁️ Armazenamento & Upload
- [x] Integração com Google Drive
- [x] Upload chunked para arquivos grandes (até 2GB)
- [x] Criação automática de pastas por ideia
- [x] Listagem e exclusão de vídeos
- [x] Validação de tipo e tamanho de arquivo

### 💰 Sistema de Pagamentos
- [x] Integração com Mercado Pago
- [x] Planos de assinatura (Free, Pro, Premium)
- [x] Webhooks para confirmação automática
- [x] Gestão de assinaturas ativas
- [x] Histórico de pagamentos

### ⚙️ Admin Panel
- [x] Dashboard administrativo completo
- [x] Gestão de usuários e planos
- [x] Configurações de sistema
- [x] Sistema de notificações
- [x] Estatísticas de uso
- [x] Gestão de banco de dados
- [x] Configuração de Mercado Pago

### 🔔 Notificações
- [x] Sistema de notificações em tempo real
- [x] Toasts para feedback de ações
- [x] Notificações de admin
- [x] Alertas de erros e sucessos

### 📱 UX/UI
- [x] Design responsivo (mobile-first)
- [x] Dark mode suportado
- [x] Animações com Framer Motion
- [x] Loading states e skeletons
- [x] Error boundaries
- [x] Cookie consent (LGPD compliant)

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Linguagem**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Formulários**: React Hook Form
- **Datas**: [date-fns](https://date-fns.org/) (pt-BR)

### Backend & Database
- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **ORM**: Supabase Client
- **Authentication**: Supabase Auth
- **File Storage**: Google Drive API v3
- **Payments**: Mercado Pago SDK

### APIs & Integrações
- **Instagram**: Facebook Graph API (Instagram Basic Display + Instagram Graph)
- **Google Drive**: OAuth 2.0 + Drive API v3
- **Mercado Pago**: Payment Gateway + Webhooks
- **RapidAPI**: Instagram Scraper (para busca de perfis públicos)

### DevOps & Deploy
- **Hosting**: Vercel
- **CI/CD**: Vercel Auto-deploy
- **Cron Jobs**: Vercel Cron
- **Monitoring**: Vercel Analytics
- **Rate Limiting**: Upstash Redis

### Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier (integrado)
- **Git Hooks**: Husky
- **Commit Convention**: Conventional Commits

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ e npm
- Conta no [Supabase](https://supabase.com)
- (Opcional) Conta no [Meta for Developers](https://developers.facebook.com)
- (Opcional) Conta no [Google Cloud Console](https://console.cloud.google.com)
- (Opcional) Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/conhecendodigital/leadgram-app.git
cd leadgram-app
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais (veja [Environment Variables](#environment-variables))

4. **Configure o banco de dados**

Execute as migrations no Supabase:

```bash
# Acesse Supabase Dashboard > SQL Editor
# Execute os arquivos em docs/archive/ na ordem
```

5. **Rode o projeto**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Instagram OAuth
NEXT_PUBLIC_INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback

# Google Drive OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback

# RapidAPI (Instagram Scraper)
RAPIDAPI_KEY=your-rapidapi-key
RAPIDAPI_HOST=instagram-scraper-api.p.rapidapi.com

# Mercado Pago (Admin configura via painel)
# Não precisa de env vars - configuração via banco

# Upstash Redis (opcional - para rate limiting)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Cron Secret (para proteger endpoints de cron)
CRON_SECRET=your-random-secret
```

---

## 📁 Estrutura do Projeto

```
leadgram-app/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin panel (protected)
│   │   └── admin/
│   │       ├── customers/        # Gestão de clientes
│   │       ├── dashboard/        # Dashboard admin
│   │       ├── mercadopago/      # Config Mercado Pago
│   │       ├── notifications/    # Sistema de notificações
│   │       ├── payments/         # Gestão de pagamentos
│   │       ├── plans/            # Gestão de planos
│   │       ├── reports/          # Relatórios
│   │       └── settings/         # Configurações de sistema
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (dashboard)/              # Main app (protected)
│   │   └── dashboard/
│   │       ├── analytics/        # Analytics & insights
│   │       ├── explore/          # Explorar perfis Instagram
│   │       ├── ideas/            # CRUD de ideias
│   │       ├── instagram/        # Integração Instagram
│   │       ├── profile/          # Perfil do usuário
│   │       ├── settings/         # Configurações
│   │       └── upload/           # Upload de vídeos
│   ├── (legal)/                  # Páginas legais
│   │   └── legal/
│   │       ├── cookies/          # Política de Cookies
│   │       ├── privacy/          # Política de Privacidade
│   │       └── terms/            # Termos de Uso
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin endpoints
│   │   ├── auth/                 # Auth & 2FA
│   │   ├── checkout/             # Checkout Mercado Pago
│   │   ├── cron/                 # Cron jobs
│   │   │   ├── daily-tasks/      # Tarefas diárias
│   │   │   ├── refresh-tokens/   # Refresh tokens Instagram
│   │   │   └── sync-instagram/   # Sync posts do Instagram
│   │   ├── google-drive/         # Google Drive integration
│   │   ├── ideas/                # CRUD de ideias
│   │   ├── instagram/            # Instagram Graph API
│   │   ├── mercadopago/          # Payment webhooks
│   │   ├── metrics/              # Métricas e analytics
│   │   ├── proxy-image/          # Proxy para imagens Instagram
│   │   ├── settings/             # Settings do usuário
│   │   └── user/                 # User endpoints
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── auth/                     # Auth components (footer)
│   ├── automations/              # Automações (futuro)
│   ├── dashboard/                # Dashboard components
│   ├── ideas/                    # Ideias components
│   ├── instagram/                # Instagram components
│   └── upload/                   # Upload components
├── contexts/                     # React contexts
├── hooks/                        # Custom hooks
├── lib/                          # Libraries & utilities
│   ├── middleware/               # API middleware
│   ├── services/                 # Business logic services
│   ├── supabase/                 # Supabase clients
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
├── public/                       # Static assets
├── docs/                         # Documentation
│   └── archive/                  # Archived docs & migrations
├── scripts/                      # Utility scripts
├── types/                        # Global TypeScript types
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── README.md                     # This file
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🌐 Deploy

### Vercel (Recomendado)

1. **Push para GitHub**

```bash
git push origin main
```

2. **Importe no Vercel**

- Acesse [vercel.com](https://vercel.com)
- Clique em "New Project"
- Importe o repositório
- Configure as variáveis de ambiente
- Deploy!

3. **Configure Cron Jobs**

No Vercel Dashboard, adicione:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-instagram",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/daily-tasks",
      "schedule": "0 2 * * *"
    }
  ]
}
```

4. **Atualize URLs de Callback**

Atualize as redirect URIs nas plataformas:
- Instagram: `https://seu-dominio.vercel.app/api/instagram/callback`
- Google Drive: `https://seu-dominio.vercel.app/api/google-drive/callback`

### Outras Plataformas

O projeto também pode ser deployado em:
- **Railway**: Suporte completo para Next.js
- **Render**: Funciona perfeitamente
- **AWS Amplify**: Compatível
- **Netlify**: Suporte via adapter

---

## 🗺️ Roadmap

### Em Desenvolvimento
- [ ] Automações de engajamento (via n8n)
- [ ] Integração com TikTok API
- [ ] Integração com YouTube API
- [ ] Sistema de agendamento de posts
- [ ] Calendário de conteúdo visual

### Planejado
- [ ] Aplicativo mobile (React Native)
- [ ] Editor de vídeo integrado
- [ ] Templates de conteúdo
- [ ] Biblioteca de assets (imagens, músicas)
- [ ] Colaboração em equipe
- [ ] Webhooks customizáveis
- [ ] API pública
- [ ] Inteligência artificial para sugestões de conteúdo
- [ ] Análise de concorrentes
- [ ] Relatórios exportáveis (PDF, Excel)

Veja o [board de projetos](https://github.com/conhecendodigital/leadgram-app/projects) para mais detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais informações.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Atualização de dependências, etc

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

---

## 👥 Time

Desenvolvido com ❤️ por [Conhecendo Digital](https://github.com/conhecendodigital)

---

## 📞 Suporte

- 📧 Email: suporte@leadgram.com
- 🐛 Issues: [GitHub Issues](https://github.com/conhecendodigital/leadgram-app/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/conhecendodigital/leadgram-app/discussions)

---

<div align="center">

**[⬆ Voltar ao topo](#-leadgram)**

Feito com ☕ e 💻 por desenvolvedores para criadores de conteúdo

</div>
