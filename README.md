# Leadgram

Plataforma completa de gerenciamento de conteúdo para criadores digitais, com design inspirado no Meta Business Suite.

## Funcionalidades

- **Autenticação completa** - Login, registro e OAuth
- **Gerenciamento de Ideias** - Crie, edite e organize suas ideias de conteúdo
- **Organização por Funil** - Classifique conteúdo por topo, meio e fundo de funil
- **Multi-plataforma** - Gerencie conteúdo para Instagram, TikTok, YouTube e Facebook
- **Integração Instagram** - Sincronize métricas automaticamente
- **Dashboard Analytics** - Visualize estatísticas e gráficos de desempenho
- **Sistema de Métricas** - Acompanhe views, likes, comments, shares e engagement rate

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS
- **Ícones**: lucide-react
- **Gráficos**: recharts
- **Datas**: date-fns (pt-BR)

## Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd leadgram-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o arquivo `SUPABASE_SCHEMA.sql`
4. Vá em **Settings > API** e copie suas credenciais

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. (Opcional) Configure Instagram OAuth

Para habilitar a integração com Instagram:

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Crie um novo app
3. Adicione o produto "Instagram Basic Display"
4. Configure OAuth Redirect URI: `http://localhost:3000/api/instagram/callback`
5. Copie App ID e App Secret para `.env.local`:

```env
NEXT_PUBLIC_INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
leadgram-app/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Páginas do dashboard
│   │   └── dashboard/
│   │       ├── ideas/       # Gerenciamento de ideias
│   │       ├── instagram/   # Integração Instagram
│   │       └── analytics/   # Analytics (futuro)
│   ├── api/                 # API Routes
│   │   ├── ideas/           # CRUD de ideias
│   │   ├── metrics/         # Métricas
│   │   └── instagram/       # Instagram OAuth e sync
│   └── auth/                # Callbacks de autenticação
├── components/
│   ├── dashboard/           # Componentes do dashboard
│   ├── ideas/               # Componentes de ideias
│   └── instagram/           # Componentes Instagram
├── lib/
│   └── supabase/            # Clientes Supabase
└── types/                   # TypeScript types

```

## Schema do Banco de Dados

### Principais Tabelas

- **profiles** - Perfis de usuários
- **ideas** - Ideias de conteúdo
- **idea_platforms** - Plataformas vinculadas a cada ideia
- **metrics** - Métricas de performance
- **instagram_accounts** - Contas Instagram conectadas
- **instagram_posts** - Posts sincronizados do Instagram

### Enums

- **idea_status**: `idea`, `recorded`, `posted`
- **funnel_stage**: `top`, `middle`, `bottom`
- **platform**: `instagram`, `tiktok`, `youtube`, `facebook`
- **metric_source**: `manual`, `instagram_api`

## Design System

Inspirado no Meta Business Suite:

- **Cores**: Azul Meta (#0866FF), gradientes azul/roxo
- **Sidebar**: Escura fixa (#1C1E21), 256px
- **Cards**: rounded-2xl, shadow-sm, hover effects
- **Tipografia**: font-medium/semibold
- **Inputs**: rounded-xl, focus:ring-2
- **Buttons**: gradientes, shadow-lg, hover:scale-[1.02]
- **Badges**: rounded-full, cores por categoria

## Funcionalidades Principais

### Gerenciamento de Ideias

- Criar, editar e deletar ideias
- Organizar por status (Ideia, Gravado, Postado)
- Classificar por estágio do funil
- Associar múltiplas plataformas
- Adicionar roteiro e instruções para editor

### Dashboard Analytics

- Cards de estatísticas gerais
- Gráfico de distribuição por funil
- Stats por plataforma
- Lista de ideias recentes

### Integração Instagram

- OAuth completo
- Sincronização de posts
- Métricas detalhadas (impressions, reach, engagement rate)
- Atualização automática

## Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
```

## Próximos Passos

- [ ] Adicionar integração com TikTok
- [ ] Adicionar integração com YouTube
- [ ] Página de Analytics completa
- [ ] Sistema de tags
- [ ] Calendário de conteúdo
- [ ] Upload de thumbnails
- [ ] Exportação de relatórios

## Licença

MIT

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
