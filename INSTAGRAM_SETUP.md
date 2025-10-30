# Guia Completo - Configuração Instagram Basic Display

## ⚠️ Erro "Invalid platform app"

Este erro acontece quando:
- O App ID está errado
- O App Secret está errado
- O Redirect URI não está registrado
- O app não está configurado corretamente
- Você não está adicionado como testador

## 📋 Passo a Passo Completo

### 1. Criar App no Meta for Developers

1. Acesse: https://developers.facebook.com/apps
2. Clique em **"Create App"** (Criar App)
3. Selecione o tipo: **"Consumer"** (Consumidor)
4. Clique em **"Next"** (Avançar)

### 2. Configurar App Básico

1. **Display Name**: Leadgram (ou qualquer nome)
2. **App Contact Email**: seu-email@exemplo.com
3. Clique em **"Create App"** (Criar App)

### 3. Adicionar Instagram Basic Display

1. No dashboard do app, role até encontrar **"Add Product"**
2. Procure por **"Instagram Basic Display"**
3. Clique em **"Set Up"** (Configurar)

### 4. Configurar Instagram Basic Display

1. Clique em **"Basic Display"** no menu lateral
2. Role até **"User Token Generator"** (Gerador de Token de Usuário)
3. Clique em **"Create New App"** (Criar Novo App)

### 5. Preencher Informações do App

Preencha os campos obrigatórios:

**Valid OAuth Redirect URIs** (IMPORTANTE):
```
http://localhost:3000/api/instagram/callback
```

⚠️ **ATENÇÃO**:
- Copie exatamente este URL
- NÃO adicione barra no final
- Use `http` para localhost (não `https`)
- Se for produção, use: `https://seu-dominio.com/api/instagram/callback`

**Deauthorize Callback URL**:
```
http://localhost:3000/api/instagram/callback
```

**Data Deletion Request URL**:
```
http://localhost:3000/api/instagram/callback
```

4. Clique em **"Save Changes"** (Salvar Alterações)

### 6. Copiar Credenciais

1. No topo da página, você verá:
   - **Instagram App ID** (ID do App do Instagram)
   - **Instagram App Secret** (Segredo do App do Instagram)

2. Clique em **"Show"** (Mostrar) ao lado do App Secret
3. Copie ambos os valores

### 7. Adicionar ao .env.local

Abra o arquivo `.env.local` na raiz do projeto e adicione:

```env
# Instagram OAuth Configuration
NEXT_PUBLIC_INSTAGRAM_APP_ID=seu-instagram-app-id
INSTAGRAM_APP_SECRET=seu-instagram-app-secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

⚠️ **IMPORTANTE**:
- Use o **Instagram App ID**, NÃO o Facebook App ID
- Ambos estão na mesma página, mas são diferentes
- O Instagram App ID geralmente é maior (mais dígitos)

### 8. Adicionar Usuário de Teste

**CRÍTICO**: Você precisa adicionar testadores!

1. Ainda em **Instagram Basic Display**, role até **"Instagram Testers"**
2. Clique em **"Add Instagram Testers"**
3. Digite seu **@username** do Instagram
4. Clique em **"Submit"** (Enviar)

5. **No Instagram**:
   - Vá em **Configurações** > **Apps and Websites** (Apps e Sites)
   - Ou acesse: https://www.instagram.com/accounts/manage_access/
   - Você verá uma solicitação do seu app
   - Clique em **"Authorize"** (Autorizar)

⚠️ Se você não fizer isso, vai dar erro "Invalid platform app"!

### 9. Configurar Modo do App

1. Volte para o **Dashboard** do app
2. No topo, você verá o status: **"In Development"** (Em Desenvolvimento)
3. Isso está correto para testes!
4. **NÃO mude para "Live"** ainda

### 10. Testar a Integração

1. Reinicie o servidor Next.js:
```bash
npm run dev
```

2. Acesse:
```
http://localhost:3000/dashboard/instagram
```

3. Clique em **"Conectar com Instagram"**

4. Você deve ver uma tela do Instagram pedindo permissões

5. Autorize e pronto! ✅

## 🔍 Verificação Rápida

Execute este checklist:

- [ ] App criado no Meta for Developers
- [ ] Instagram Basic Display adicionado
- [ ] Redirect URI configurado: `http://localhost:3000/api/instagram/callback`
- [ ] Instagram App ID copiado corretamente
- [ ] Instagram App Secret copiado corretamente
- [ ] Variáveis adicionadas no `.env.local`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Você foi adicionado como testador
- [ ] Você aceitou o convite no Instagram
- [ ] App está em modo "Development"

## 🐛 Problemas Comuns

### "Invalid platform app"
- ✅ Verifique se usou o **Instagram App ID** (não o Facebook App ID)
- ✅ Verifique se adicionou o redirect URI exatamente como mostrado
- ✅ Verifique se foi adicionado como testador E aceitou

### "Redirect URI mismatch"
- ✅ Verifique se o redirect URI no código é EXATAMENTE igual ao registrado
- ✅ Não pode ter barra no final
- ✅ Deve ser `http://localhost:3000/api/instagram/callback`

### "Application not found"
- ✅ O App ID está errado
- ✅ Copie novamente da página do Instagram Basic Display

### "Invalid scope"
- ✅ O código já está correto: `user_profile,user_media`
- ✅ Se você mudou algo, reverta

### Não aparece solicitação no Instagram
- ✅ Você precisa PRIMEIRO adicionar o testador no Meta Developers
- ✅ DEPOIS aceitar no Instagram em Apps and Websites
- ✅ Pode demorar alguns minutos

## 📸 Onde Encontrar

### Instagram App ID vs Facebook App ID

Na página **Instagram Basic Display**, você verá:

```
Instagram App ID: 1234567890123456  ← Use este
Instagram App Secret: abc123def456    ← Use este
```

**NÃO USE o App ID que aparece no topo da página do Facebook!**

### Como saber se é o ID certo?

- Instagram App ID tem ~16 dígitos
- É mostrado na página "Instagram Basic Display"
- Começa com números diferentes do Facebook App ID

## 🎯 Exemplo Completo de .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Instagram (IMPORTANTE: Use os valores corretos!)
NEXT_PUBLIC_INSTAGRAM_APP_ID=1234567890123456
INSTAGRAM_APP_SECRET=abc123def456xyz789
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

## 🚀 Produção

Quando for para produção:

1. Adicione o redirect URI de produção no Meta Developers:
```
https://seu-dominio.com/api/instagram/callback
```

2. Atualize o `.env.local` (ou variáveis de ambiente):
```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=https://seu-dominio.com/api/instagram/callback
```

3. Mude o app para modo "Live" no Meta Developers

4. Faça o processo de revisão do Instagram (se necessário)

## 💡 Dicas

- Sempre use o **Instagram App ID** da página Instagram Basic Display
- O redirect URI é CASE SENSITIVE (diferencia maiúsculas/minúsculas)
- Teste sempre em modo anônimo primeiro
- Limpe cookies se der problema
- Verifique os logs do navegador (F12)

## ✅ Funcionou?

Se funcionou, você verá:
1. Tela do Instagram pedindo permissões
2. Sua conta conectada no dashboard
3. Estatísticas do Instagram aparecendo

Parabéns! 🎉

## ❌ Ainda não funcionou?

1. Abra o Console do navegador (F12)
2. Vá em "Network" (Rede)
3. Clique em "Conectar com Instagram"
4. Veja qual erro aparece
5. Copie o erro e verifique no troubleshooting

Ou me envie o erro que aparece! 😊
