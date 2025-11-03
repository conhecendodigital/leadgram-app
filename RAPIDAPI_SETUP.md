# 🔧 Configuração da RapidAPI Instagram Scraper

## ❌ Erro: "Endpoint does not exist"

Se você está vendo erros como:
```
Endpoint '/v1.2/user-info' does not exist
Endpoint '/v1.2/user-posts' does not exist
```

Isso significa que os endpoints configurados no código não correspondem à API do Instagram que você está usando na RapidAPI.

## 📝 Como Descobrir os Endpoints Corretos

### Passo 1: Identifique sua API no RapidAPI

1. Acesse [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)
2. Vá em "My Subscriptions" ou "My Apps"
3. Encontre qual API do Instagram você está inscrito
4. Anote o **host** da API (exemplo: `instagram-scraper-api2.p.rapidapi.com`)

### Passo 2: Verifique os Endpoints Disponíveis

Na página da sua API no RapidAPI, procure pelos endpoints relacionados a:
- **User Info** / **Profile** / **User Details**
- **User Posts** / **Posts** / **Media**
- **Hashtag Posts** (opcional)

Anote o **caminho exato** de cada endpoint. Exemplos comuns:

| API | User Info | User Posts | Hashtag Posts |
|-----|-----------|------------|---------------|
| Instagram Scraper API2 (v1) | `v1/info` | `v1/posts` | `v1/hashtag` |
| Instagram Scraper API2 (v1.2) | `v1.2/user-info` | `v1.2/user-posts` | `v1.2/hashtag-posts` |
| Instagram Scraper (sem versão) | `info` | `posts` | `hashtag` |
| Instagram API | `user-info` | `user-posts` | `hashtag-posts` |

### Passo 3: Atualize o Código

Edite o arquivo `lib/instagram-api.ts` e atualize os endpoints:

```typescript
// Linha ~126 - Buscar perfil
const data = await this.fetchFromRapidAPI('SEU_ENDPOINT_AQUI', {
  username_or_id_or_url: username
})

// Linha ~151 - Buscar posts
const data = await this.fetchFromRapidAPI('SEU_ENDPOINT_AQUI', {
  username_or_id_or_url: username,
  count: count.toString(),
})

// Linha ~195 - Buscar posts por hashtag
const data = await this.fetchFromRapidAPI('SEU_ENDPOINT_AQUI', {
  hashtag_name: hashtag,
  count: count.toString(),
})
```

### Passo 4: Verifique os Parâmetros

Algumas APIs usam nomes diferentes para os parâmetros:

| Parâmetro | Variações Comuns |
|-----------|------------------|
| Username | `username`, `username_or_id_or_url`, `user`, `ig_username` |
| Count | `count`, `limit`, `amount` |
| Hashtag | `hashtag`, `hashtag_name`, `tag` |

Consulte a documentação da sua API no RapidAPI para confirmar os nomes corretos.

## 🔍 APIs Populares do Instagram na RapidAPI

### 1. Instagram Scraper API2
- **Host**: `instagram-scraper-api2.p.rapidapi.com`
- **Endpoints típicos**: `v1/info`, `v1/posts`, `v1/hashtag`
- **Link**: https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2

### 2. Instagram Scraper (junioroangel)
- **Host**: `instagram-scraper-api.p.rapidapi.com`
- **Endpoints típicos**: `info`, `posts`, `hashtag`
- **Link**: https://rapidapi.com/junioroangel/api/instagram-scraper

### 3. Instagram API - Fast & Reliable
- **Host**: Varia
- **Endpoints típicos**: `user/info`, `user/posts`
- **Link**: https://rapidapi.com/mediacrawlers-mediacrawlers-default/api/instagram-api-fast-reliable-data-scraper

## ✅ Teste seus Endpoints

Depois de atualizar o código:

1. Faça o build:
   ```bash
   npm run build
   ```

2. Teste localmente acessando `/dashboard/explore`

3. Se funcionar localmente, faça o commit e push:
   ```bash
   git add lib/instagram-api.ts
   git commit -m "fix: Update RapidAPI endpoints"
   git push
   ```

## 💡 Dica: Use o Console de Teste da RapidAPI

Na página da sua API no RapidAPI, há um console de teste onde você pode:
1. Testar endpoints diretamente
2. Ver exemplos de código
3. Verificar a resposta JSON
4. Copiar os nomes corretos dos endpoints e parâmetros

## 📧 Precisa de Ajuda?

Se ainda não funcionar:
1. Verifique os logs da aplicação para ver o erro exato
2. Confirme que `RAPIDAPI_KEY` e `RAPIDAPI_HOST` estão corretos no `.env.local`
3. Verifique se sua conta RapidAPI tem créditos disponíveis
4. Teste o endpoint manualmente usando o console da RapidAPI
