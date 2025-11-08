# 🔍 Instagram Explorer - Guia de Uso

## Funcionalidade Implementada

O **Instagram Explorer** permite analisar perfis públicos do Instagram usando a RapidAPI Instagram Scraper. Com ele você pode:

- 📊 Visualizar estatísticas detalhadas de qualquer perfil
- 📈 Analisar taxa de engajamento e crescimento
- 🎯 Descobrir os posts com melhor performance
- 📉 Ver evolução do engajamento ao longo do tempo
- 🔥 Comparar métricas entre diferentes perfis

## Como Configurar

### 1. Obter API Key do RapidAPI

1. Acesse [RapidAPI](https://rapidapi.com/hub)
2. Crie uma conta gratuita ou faça login
3. Procure por "Instagram Scraper" ou similar
4. Inscreva-se no plano (existe plano gratuito)
5. Copie sua `X-RapidAPI-Key`

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
RAPIDAPI_KEY=sua_chave_aqui
RAPIDAPI_HOST=instagram-scraper-api2.p.rapidapi.com
```

> **Nota:** Um arquivo `.env.example` foi criado com template

### 3. Reiniciar o Servidor

Após adicionar as variáveis de ambiente, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Como Usar

### Acessar a Página Explorar

1. Faça login no Leadgram
2. Clique em **"Explorar"** no menu lateral
3. Digite o @ do perfil que deseja analisar
4. Clique em "Analisar Perfil"

### Recursos Disponíveis

#### 📊 Dashboard do Perfil
- Avatar e informações básicas
- Verificado e tipo de conta (business/creator)
- Biografia e categoria

#### 📈 Estatísticas
- **Seguidores** - Número total de seguidores
- **Seguindo** - Quantidade de perfis seguidos
- **Publicações** - Total de posts
- **Engajamento Médio** - Taxa média de engajamento

#### 📉 Gráfico de Evolução
- Evolução do engajamento nos últimos 15 posts
- Visualização em linha do tempo
- Média de engajamento destacada

#### 🎯 Top Posts
Filtre os posts por:
- **Maior Engajamento** - Posts com melhor taxa de engajamento
- **Mais Curtidas** - Posts mais curtidos
- **Mais Comentários** - Posts com mais comentários

Visualize:
- Thumbnail do post
- Tipo de mídia (foto/vídeo)
- Curtidas e comentários
- Taxa de engajamento
- Ranking (top 3 destacado)

## Estrutura de Arquivos

### Serviço Instagram API
```
lib/instagram-api.ts
```
Classe principal que faz integração com RapidAPI

### API Routes
```
app/api/instagram/profile/route.ts     # Buscar perfil
app/api/instagram/posts/route.ts       # Buscar posts
app/api/instagram/top-posts/route.ts   # Posts por hashtag
```

### Componentes
```
components/explore/
  ├── profile-header.tsx          # Header do perfil
  ├── profile-stats.tsx           # Estatísticas
  ├── engagement-chart.tsx        # Gráfico de engajamento
  ├── top-posts.tsx               # Grid de posts
  ├── content-filters.tsx         # Filtros de visualização
  ├── compare-button.tsx          # Botão comparar
  └── explore-search-form.tsx     # Formulário de busca
```

### Páginas
```
app/(dashboard)/dashboard/explore/
  ├── page.tsx                           # Página principal
  └── profile/[username]/page.tsx        # Análise de perfil
```

## Exemplos de Uso

### Exemplo 1: Analisar Concorrente
```
1. Digite: @nike
2. Visualize métricas e engajamento
3. Identifique padrões de conteúdo de sucesso
```

### Exemplo 2: Descobrir Influenciadores
```
1. Digite: @cristiano
2. Analise taxa de engajamento
3. Veja quais tipos de post performam melhor
```

### Exemplo 3: Pesquisar Inspiração
```
1. Digite: @instagram
2. Filtre por "Maior Engajamento"
3. Estude os posts mais engajados
```

## Limitações

- ⏱️ A API tem limite de requisições (depende do plano)
- 🔐 Apenas perfis públicos podem ser analisados
- 📊 Dados são em tempo real mas podem ter delay
- 🚫 Stories não estão disponíveis em todos os planos

## Melhorias Futuras

- [ ] Comparação lado a lado de perfis
- [ ] Exportação de relatórios em PDF
- [ ] Análise de hashtags
- [ ] Sugestões de horários de postagem
- [ ] Tracking de crescimento ao longo do tempo
- [ ] Integração com análise de sentimento

## Suporte

Se encontrar algum problema:

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que sua chave RapidAPI está ativa
3. Verifique se o perfil buscado é público
4. Consulte os logs no console do navegador

## Performance

Para melhor performance:
- ✅ Componentes com lazy loading
- ✅ Cache de requisições
- ✅ Otimização de imagens
- ✅ Responsivo para mobile
- ✅ Dark mode suportado

---

**Desenvolvido com ❤️ usando Next.js 16 + RapidAPI**
