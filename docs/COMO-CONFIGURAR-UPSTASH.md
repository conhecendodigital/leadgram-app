# 🔧 COMO CONFIGURAR UPSTASH REDIS

**Tempo estimado:** 15 minutos
**Dificuldade:** Fácil
**Status atual:** ⚠️ PENDENTE - Rate limiting desabilitado

---

## ⚠️ POR QUE ISSO É IMPORTANTE?

Sem o Upstash Redis configurado:
- ❌ Rate limiting está **DESABILITADO**
- ❌ APIs vulneráveis a **brute force attacks**
- ❌ Qualquer pessoa pode fazer **requests ilimitadas**

Com Upstash Redis:
- ✅ Rate limiting **funciona corretamente**
- ✅ Protege contra **ataques de força bruta**
- ✅ Funciona em **serverless** (Vercel)
- ✅ **Gratuito** para começar

---

## 📝 PASSO A PASSO

### ETAPA 1: Criar Conta Upstash (2 min)

1. Acesse: https://upstash.com
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Escolha um método de login:
   - GitHub (recomendado - mais rápido)
   - Google
   - Email

### ETAPA 2: Criar Redis Database (3 min)

1. Após login, você verá o dashboard da Upstash
2. Clique em **"Create Database"**
3. Selecione **"Redis"** (não Kafka)
4. Configure:
   ```
   Name: leadgram-rate-limit
   Type: Regional (mais barato, suficiente)
   Region: Escolha o mais próximo do seu servidor Vercel
          (Ex: us-east-1 se deploy está na região US East)
   Eviction: No eviction (padrão)
   TLS: Enabled (padrão - mais seguro)
   ```
5. Clique em **"Create"**

### ETAPA 3: Copiar Credenciais (2 min)

1. Na página do database criado, você verá:
   ```
   REST URL: https://xxxxxxx.upstash.io
   REST Token: AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxB
   ```

2. **IMPORTANTE:** Copie exatamente como mostrado:
   - `UPSTASH_REDIS_URL` = O valor de "REST URL"
   - `UPSTASH_REDIS_TOKEN` = O valor de "REST Token"

### ETAPA 4: Adicionar no Vercel (5 min)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **leadgram-app**
3. Vá em **Settings** (topo da página)
4. No menu lateral, clique em **Environment Variables**
5. Adicione a primeira variável:
   ```
   Name: UPSTASH_REDIS_URL
   Value: [Cole a REST URL que você copiou]
   Environment: Production, Preview, Development (selecione todos)
   ```
6. Clique em **"Add"**
7. Adicione a segunda variável:
   ```
   Name: UPSTASH_REDIS_TOKEN
   Value: [Cole o REST Token que você copiou]
   Environment: Production, Preview, Development (selecione todos)
   ```
8. Clique em **"Add"**

### ETAPA 5: Fazer Redeploy (3 min)

**Opção A - Automático (recomendado):**
1. Vá em **Deployments** (topo da página)
2. Clique nos 3 pontinhos do último deployment
3. Clique em **"Redeploy"**
4. Confirme clicando em **"Redeploy"** novamente

**Opção B - Via Git:**
```bash
# Fazer um commit vazio para forçar redeploy
git commit --allow-empty -m "chore: Trigger redeploy após config Upstash"
git push origin main
```

Aguarde 2-3 minutos para o deploy completar.

---

## ✅ COMO VERIFICAR SE FUNCIONOU

### Método 1: Verificar Logs do Vercel

1. Vá em **Deployments** no Vercel
2. Clique no último deployment (deve estar "Ready")
3. Vá em **Logs** ou **Runtime Logs**
4. Procure por:
   - ❌ Se aparecer `WARNING: Upstash Redis not configured` → NÃO funcionou
   - ✅ Se NÃO aparecer essa mensagem → Funcionou!

### Método 2: Testar Rate Limiting

1. Acesse sua aplicação em produção
2. Vá para a página de login
3. Tente fazer login com senha errada **6 vezes seguidas**
4. Na 6ª tentativa, você deve ver:
   ```
   Rate limit excedido
   Muitas requisições. Tente novamente mais tarde.
   ```
5. Se aparecer essa mensagem: ✅ **FUNCIONOU!**

### Método 3: Verificar no Upstash Dashboard

1. Acesse: https://console.upstash.com
2. Clique no database **leadgram-rate-limit**
3. Vá em **Data Browser**
4. Procure por chaves começando com `rate-limit:`
5. Se aparecerem chaves: ✅ **FUNCIONOU!**

---

## 🐛 PROBLEMAS COMUNS

### Problema 1: "Invalid credentials"
**Causa:** Token ou URL copiado incorretamente

**Solução:**
1. Volte no Upstash Dashboard
2. Copie novamente as credenciais (use o botão de copiar)
3. Delete as variáveis no Vercel
4. Adicione novamente com os valores corretos
5. Faça redeploy

### Problema 2: "Could not connect to Redis"
**Causa:** TLS não habilitado ou região incorreta

**Solução:**
1. Verifique se TLS está habilitado no Upstash
2. Tente criar novo database com TLS habilitado
3. Use as novas credenciais

### Problema 3: Warning ainda aparece nos logs
**Causa:** Redeploy não foi feito ou variáveis não salvaram

**Solução:**
1. Verifique se as variáveis estão realmente no Vercel
2. Certifique-se que selecionou "Production" environment
3. Faça redeploy forçado (Opção B acima)
4. Aguarde deploy completar totalmente

### Problema 4: Rate limiting não funciona
**Causa:** Variáveis com nomes errados ou valores incorretos

**Solução:**
1. Verifique os nomes EXATOS:
   - `UPSTASH_REDIS_URL` (não `REDIS_URL`)
   - `UPSTASH_REDIS_TOKEN` (não `REDIS_TOKEN`)
2. Verifique que não tem espaços antes/depois dos valores
3. Verifique que copiou a **REST URL** (não a "Redis URL")

---

## 💰 CUSTOS

### Plano Gratuito (Free)
```
✅ 10,000 comandos/dia
✅ Suficiente para ~300-500 usuários ativos/dia
✅ Sem cartão de crédito necessário
✅ Nunca expira
```

### Quando Escalar?
```
Se ultrapassar 10k comandos/dia:
- Pay as you go: $0.20 por 100k comandos
- OU
- Pro Plan: $10/mês (1M comandos inclusos)
```

**Para Leadgram:** Plano gratuito é **suficiente por meses**

---

## 🔒 SEGURANÇA

### ✅ Boas Práticas

1. **Nunca commite as credenciais no código**
   - ✅ Já está correto (usamos variáveis de ambiente)

2. **Rotacione tokens periodicamente**
   - No Upstash: Settings → Reset Token
   - Atualize no Vercel
   - Faça redeploy

3. **Use TLS sempre**
   - ✅ Já habilitado por padrão

4. **Monitore uso**
   - Upstash Dashboard → Metrics
   - Veja quantos comandos está usando

### ⚠️ O Que NÃO Fazer

- ❌ Não adicione as credenciais no `.env` (elas ficam apenas no Vercel)
- ❌ Não compartilhe o token publicamente
- ❌ Não desabilite TLS

---

## 📊 MONITORAMENTO

### No Upstash Dashboard

1. **Metrics:**
   - Total Commands
   - Latency
   - Storage Used

2. **Data Browser:**
   - Ver chaves criadas
   - Verificar TTL
   - Debugar rate limiting

### No Vercel Logs

Procure por:
```
✅ Sucesso:
   (Nenhuma mensagem de warning)

❌ Erro:
   WARNING: Upstash Redis not configured
   [Upstash Redis] The 'url' property is missing
```

---

## 🎯 CHECKLIST FINAL

Antes de dar como concluído, verifique:

- [ ] Conta Upstash criada
- [ ] Database Redis criado
- [ ] `UPSTASH_REDIS_URL` copiado
- [ ] `UPSTASH_REDIS_TOKEN` copiado
- [ ] Variáveis adicionadas no Vercel
- [ ] Ambientes selecionados: Production, Preview, Development
- [ ] Redeploy realizado
- [ ] Deploy completou com sucesso (status "Ready")
- [ ] Logs NÃO mostram warning de Upstash
- [ ] Testado rate limiting (6 tentativas login)
- [ ] Rate limit bloqueou na 6ª tentativa

**Se todos marcados:** 🎉 **CONFIGURAÇÃO COMPLETA!**

---

## 📞 SUPORTE

### Se precisar de ajuda:

1. **Documentação Upstash:**
   - https://docs.upstash.com/redis

2. **Documentação Vercel:**
   - https://vercel.com/docs/environment-variables

3. **Verificar o código:**
   - Arquivo: `lib/middleware/rate-limit.ts`
   - Linhas 10-13 (configuração do cliente Redis)

---

## 🚀 APÓS CONFIGURAR

Próximas tarefas recomendadas (ver `STATUS-ATUAL.md`):

1. ✅ Rate Limiting (VOCÊ ESTÁ AQUI)
2. ⚡ CSRF Protection
3. 📋 Componente OTP reutilizável
4. 📋 Hook useLogout

---

**Criado em:** 25/11/2025
**Atualizado em:** 25/11/2025
**Status:** 📋 Aguardando configuração
