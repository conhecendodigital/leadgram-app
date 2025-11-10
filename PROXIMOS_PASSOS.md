# 📋 PRÓXIMOS PASSOS - LeadGram App

**Branch atual:** `feature/rapidapi-integration`
**Data:** 2025-11-10

---

## 🚨 AÇÃO URGENTE: Inscrever-se no RapidAPI

O projeto está 100% pronto, mas a API do Instagram não está funcionando porque você precisa se inscrever no RapidAPI.

---

## 📝 PASSO A PASSO COMPLETO

### **1️⃣ Acessar o RapidAPI Hub**
🔗 https://rapidapi.com/hub

- Faça login na sua conta (ou crie uma se não tiver)
- Após login, você verá o dashboard do RapidAPI

---

### **2️⃣ Procurar API do Instagram**

Na barra de busca do RapidAPI, procure por: **"Instagram Scraper"**

Você verá várias opções. Escolha UMA das seguintes:

#### ⭐ **OPÇÃO 1 - RECOMENDADA**
**Instagram Scraper API2** (by social-api1-instagram)
- 🔗 Link direto: https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2
- 📊 Plano gratuito: **100 requests/mês**
- 🏷️ Host: `instagram-scraper-api2.p.rapidapi.com`
- 📍 Endpoints: `v1/info`, `v1/posts`, `v1/hashtag`

#### 🔄 **OPÇÃO 2 - ALTERNATIVA**
**Instagram Scraper** (by junioroangel)
- 🔗 Link direto: https://rapidapi.com/junioroangel/api/instagram-scraper
- 📊 Plano gratuito: **50 requests/mês**
- 🏷️ Host: `instagram-scraper-api.p.rapidapi.com`
- 📍 Endpoints: `info`, `posts`, `hashtag`

---

### **3️⃣ Inscrever-se na API**

1. Clique no botão **"Subscribe to Test"** ou **"Pricing"**
2. Você verá vários planos disponíveis
3. Escolha o plano **BASIC** (geralmente é gratuito)
4. Clique em **"Subscribe"**
5. Confirme a assinatura

✅ Pronto! Você está inscrito.

---

### **4️⃣ Copiar suas Credenciais**

Na página da API que você acabou de assinar:

1. Procure a seção **"Code Snippets"** ou **"Endpoints"**
2. Você verá exemplos de código
3. Nos exemplos, encontre dois valores importantes:

**A) Host da API** (exemplo):
```
x-rapidapi-host: instagram-scraper-api2.p.rapidapi.com
```
📋 Copie apenas: `instagram-scraper-api2.p.rapidapi.com`

**B) Sua API Key** (exemplo):
```
x-rapidapi-key: abc123def456ghi789jkl012mno345pqr678
```
📋 Copie toda a chave: `abc123def456ghi789jkl012mno345pqr678`

---

### **5️⃣ Atualizar o arquivo .env.local**

1. Abra o arquivo `.env.local` no seu projeto
2. Encontre as linhas:
```env
RAPIDAPI_KEY=9688f8b372msh14e4b84cc5a1f59p154e6bjsn75f3d5c755e6
RAPIDAPI_HOST=instagram-scraper-api2.p.rapidapi.com
```

3. **Substitua** pelos valores que você copiou:
```env
RAPIDAPI_KEY=SUA_NOVA_CHAVE_AQUI
RAPIDAPI_HOST=SEU_NOVO_HOST_AQUI
```

4. **SALVE O ARQUIVO** (Ctrl+S)

---

### **6️⃣ Ajustar os Endpoints (SE NECESSÁRIO)**

⚠️ **APENAS SE você escolheu a OPÇÃO 2 (Instagram Scraper by junioroangel)**

Se escolheu a **OPÇÃO 1**, **PULE ESTE PASSO**.

#### Para OPÇÃO 2, você precisa ajustar 3 linhas de código:

**Arquivo:** `lib/instagram-api.ts`

**Linha 133** - Trocar de:
```typescript
const data = await this.fetchFromRapidAPI('v1.2/user-info', {
```
Para:
```typescript
const data = await this.fetchFromRapidAPI('info', {
```

**Linha 158** - Trocar de:
```typescript
const data = await this.fetchFromRapidAPI('v1.2/user-posts', {
```
Para:
```typescript
const data = await this.fetchFromRapidAPI('posts', {
```

**Linha 202** - Trocar de:
```typescript
const data = await this.fetchFromRapidAPI('v1.2/hashtag-posts', {
```
Para:
```typescript
const data = await this.fetchFromRapidAPI('hashtag', {
```

---

### **7️⃣ Validar a Configuração**

Abra o terminal e execute:

```bash
node scripts/diagnostico-rapidapi.js
```

**✅ Se funcionar, você verá:**
```
✅ CONFIGURAÇÃO OK!
Endpoint funcionando: /v1/info
✨ O RapidAPI está configurado corretamente!
```

**❌ Se ainda der erro:**
- Verifique se copiou o HOST e KEY corretamente
- Verifique se salvou o arquivo .env.local
- Verifique se realmente concluiu a assinatura no RapidAPI

---

### **8️⃣ Testar na Interface**

1. Inicie o servidor:
```bash
npm run dev
```

2. Abra o navegador em: http://localhost:3000

3. Faça login no sistema

4. Vá para: **Explorar** (ou `/dashboard/explore`)

5. Digite um username do Instagram (exemplo: `instagram`, `natgeo`, `nasa`)

6. Clique em **"Analisar Perfil"**

**✅ Se funcionar:**
- Você verá o perfil completo
- Estatísticas (seguidores, seguindo, posts)
- Grid de posts recentes
- Gráfico de engajamento

**❌ Se não funcionar:**
- Verifique os logs no terminal
- Execute novamente: `node scripts/diagnostico-rapidapi.js`
- Entre em contato comigo

---

### **9️⃣ Fazer Commit das Mudanças**

Se tudo estiver funcionando:

```bash
# Se você ajustou os endpoints (OPÇÃO 2)
git add lib/instagram-api.ts .env.local

# Commit
git commit -m "fix: Atualiza credenciais RapidAPI e ajusta endpoints"
```

---

### **🔟 Merge para Main e Push**

```bash
# Voltar para main
git checkout main

# Fazer merge da branch
git merge feature/rapidapi-integration

# Push para o repositório
git push origin main
```

---

## ✅ CHECKLIST - Confirme cada passo

- [ ] Acessei o RapidAPI Hub
- [ ] Fiz login/criei conta
- [ ] Procurei "Instagram Scraper"
- [ ] Me inscrevi em uma das APIs (OPÇÃO 1 ou 2)
- [ ] Copiei o HOST da API
- [ ] Copiei a API KEY
- [ ] Atualizei o .env.local com as novas credenciais
- [ ] Salvei o arquivo .env.local
- [ ] (Se OPÇÃO 2) Ajustei os endpoints em lib/instagram-api.ts
- [ ] Executei: `node scripts/diagnostico-rapidapi.js` ✅
- [ ] Executei: `npm run dev`
- [ ] Testei buscar um perfil na interface ✅
- [ ] Fiz commit das mudanças
- [ ] Fiz merge para main
- [ ] Fiz push para o repositório

---

## 🆘 PRECISA DE AJUDA?

### Problema: Não consigo encontrar a API Key no RapidAPI
**Solução:**
1. Vá para https://rapidapi.com/developer/dashboard
2. Clique em "My Apps" no menu lateral
3. Clique em "default-application" (ou o nome do seu app)
4. A chave estará na seção "Security"

### Problema: O diagnóstico ainda dá erro 403
**Solução:**
1. Confirme que você REALMENTE concluiu a assinatura (não apenas visitou a página)
2. Aguarde 1-2 minutos após a assinatura (pode demorar um pouco)
3. Verifique se copiou a chave correta (sem espaços extras)
4. Tente fazer logout e login novamente no RapidAPI

### Problema: O diagnóstico dá erro 429 (Too Many Requests)
**Solução:**
- Você atingiu o limite de requests do plano gratuito
- Aguarde 24 horas ou faça upgrade do plano

### Problema: Os endpoints não funcionam
**Solução:**
- Você provavelmente escolheu uma API diferente
- Execute: `node scripts/diagnostico-rapidapi.js`
- O script vai testar diferentes combinações de endpoints
- Veja qual funciona e ajuste o código conforme necessário

---

## 🎯 OBJETIVO FINAL

Quando tudo estiver funcionando:

✅ Você poderá buscar qualquer perfil público do Instagram
✅ Ver estatísticas completas (seguidores, posts, engajamento)
✅ Analisar os posts mais populares
✅ Visualizar gráficos de performance

---

## 📞 CONTATO

Se mesmo seguindo todos os passos não funcionar:
1. Execute: `node scripts/diagnostico-rapidapi.js`
2. Copie a saída completa
3. Me envie para análise

---

**BOA SORTE! 🚀**

Qualquer dúvida, é só me chamar!
