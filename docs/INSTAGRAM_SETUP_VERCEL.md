# 🔧 Configuração do Instagram na Vercel

Este documento explica como configurar as variáveis de ambiente necessárias para a conexão com o Instagram funcionar em produção.

---

## ❌ Problema Atual

Ao tentar conectar o Instagram em produção, você vê:
```
❌ Erro ao conectar
Erro desconhecido
```

Isso acontece porque as **variáveis de ambiente** não estão configuradas na Vercel.

---

## ✅ Solução: Adicionar Variáveis na Vercel

### **Passo 1: Acessar Configurações**

1. Acesse: https://vercel.com/conhecendodigital/leadgram-app/settings/environment-variables
2. Ou vá em: **Settings** → **Environment Variables**

### **Passo 2: Adicionar as Variáveis**

Adicione cada uma das variáveis abaixo:

#### **1. NEXT_PUBLIC_FACEBOOK_APP_ID**
```
Key: NEXT_PUBLIC_FACEBOOK_APP_ID
Value: 3132195023594652
Environments: ✅ Production, Preview, Development
```

#### **2. FACEBOOK_APP_SECRET**
```
Key: FACEBOOK_APP_SECRET
Value: 280f6e043a7d84affd2a986f110684da
Environments: ✅ Production, Preview, Development
```

#### **3. NEXT_PUBLIC_APP_URL** ⚠️ **IMPORTANTE**
```
Key: NEXT_PUBLIC_APP_URL
Value: https://formulareal.online
Environments: ✅ Production
```

**⚠️ ATENÇÃO**: Esta variável é diferente em cada ambiente:
- **Production**: `https://formulareal.online`
- **Preview**: `https://seu-preview-url.vercel.app`
- **Development**: `http://localhost:3000`

Recomendo configurar apenas para **Production** por enquanto.

---

### **Passo 3: Configurar Redirect URI no Facebook**

⚠️ **CRÍTICO**: O Facebook precisa saber qual URL vai receber o callback.

1. Acesse: https://developers.facebook.com/apps/3132195023594652/settings/basic/
2. Vá em **"App Domains"**:
   - Adicione: `formulareal.online`
3. Vá em **"Login do Facebook para..."** → **"Configurações"**
4. Em **"URIs de redirecionamento do OAuth válidos"**:
   - Adicione: `https://formulareal.online/api/instagram/callback`
5. Clique em **"Salvar alterações"**

---

### **Passo 4: Fazer Redeploy**

Depois de adicionar as variáveis:

1. Acesse: https://vercel.com/conhecendodigital/leadgram-app
2. Vá em **"Deployments"**
3. Clique nos **3 pontinhos** do último deployment
4. Clique em **"Redeploy"**
5. Aguarde 2-3 minutos

---

## 🧪 Testar

Depois do redeploy:

1. Acesse: https://formulareal.online/dashboard/instagram
2. Clique em **"Conectar via Facebook"**
3. Autorize as permissões
4. Você deve ver: **"Instagram conectado com sucesso!"** ✅

Se ainda houver erro, a mensagem agora vai mostrar **exatamente qual variável está faltando**!

---

## 📋 Checklist Completo

Antes de testar, confirme:

### Na Vercel
- [ ] `NEXT_PUBLIC_FACEBOOK_APP_ID` configurada
- [ ] `FACEBOOK_APP_SECRET` configurada
- [ ] `NEXT_PUBLIC_APP_URL` = `https://formulareal.online` (Production)
- [ ] Redeploy feito após adicionar variáveis

### No Facebook Developers
- [ ] App Domain: `formulareal.online` adicionado
- [ ] OAuth Redirect URI: `https://formulareal.online/api/instagram/callback` adicionado
- [ ] Mudanças salvas

### Pré-requisitos da Conta
- [ ] Conta Instagram convertida para **Instagram Business**
- [ ] Instagram Business conectado a uma **Página do Facebook**
- [ ] Você é **Admin** da Página do Facebook

---

## ❓ Troubleshooting

### **Erro: "Código de autorização não recebido"**
- Verifique OAuth Redirect URI no Facebook

### **Erro: "NEXT_PUBLIC_APP_URL não configurado"**
- Variável não foi adicionada na Vercel
- Ou redeploy não foi feito

### **Erro: "Nenhuma página do Facebook encontrada"**
- Você precisa criar uma Página do Facebook
- Link: https://www.facebook.com/pages/creation

### **Erro: "Nenhuma conta Instagram Business conectada"**
- Conecte seu Instagram Business à Página do Facebook
- Guia: https://help.instagram.com/502981923235522

---

## 📚 Links Úteis

- **Vercel Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Facebook App Dashboard**: https://developers.facebook.com/apps/3132195023594652/
- **Instagram Business Setup**: https://help.instagram.com/502981923235522
- **Criar Página Facebook**: https://www.facebook.com/pages/creation

---

**Última atualização**: 2025-11-11
**Autor**: Claude Code + Guilherme
