# 🔧 Guia de Troubleshooting - Leadgram

## Instagram OAuth Error: redirect_uri

### ❌ "Error validating verification code. Please make sure your redirect_uri is identical..."

**Causa**: O `redirect_uri` usado no Facebook OAuth não é idêntico ao usado no callback.

**Solução**:

1. **Remova a variável FACEBOOK_REDIRECT_URI** do seu .env (se existir)

2. **Configure apenas**: `NEXT_PUBLIC_APP_URL=https://www.formulareal.online`

3. **No Facebook Developer Console**:
   - Configurações → Básico
   - Em "URIs de redirecionamento do OAuth válidos", adicione EXATAMENTE:
     ```
     https://www.formulareal.online/api/instagram/callback
     ```

4. **No Instagram Graph API**:
   - Instagram Graph API → Configurações
   - Em "URI de redirecionamento de desautorização", adicione a mesma URL
   - Em "Domínios do aplicativo", adicione: `formulareal.online` ou `www.formulareal.online`

5. **⚠️ IMPORTANTE**:
   - A URL no Facebook DEVE ser EXATAMENTE igual à que aparece nos logs
   - Verifique se tem/não tem `www`
   - Verifique se tem/não tem `/` no final
   - Use HTTPS, não HTTP

---

## RapidAPI Error: Endpoint does not exist

### ❌ "Endpoint '/v1.2/user-info' does not exist"

**Causa**: Os endpoints v1.2 não existem na sua API do RapidAPI.

**Solução**: Consulte [RAPIDAPI_SETUP.md](./RAPIDAPI_SETUP.md) para descobrir os endpoints corretos da sua API.

**Quick Fix**: Acesse sua API no RapidAPI, verifique os endpoints e edite `lib/instagram-api.ts`

---

## Variáveis de Ambiente

### ✅ Variáveis Corretas

```env
NEXT_PUBLIC_APP_URL=https://www.formulareal.online
NEXT_PUBLIC_FACEBOOK_APP_ID=seu_app_id
FACEBOOK_APP_SECRET=seu_secret
RAPIDAPI_KEY=sua_chave
RAPIDAPI_HOST=instagram-scraper-api2.p.rapidapi.com
```

### ❌ Variável que NÃO deve usar

```env
# REMOVA ESTA do seu .env:
FACEBOOK_REDIRECT_URI=...
```

---

## Checklist Rápido

- [ ] `NEXT_PUBLIC_APP_URL` está correto (com www se necessário)
- [ ] Redirect URI no Facebook é **exatamente** `https://www.formulareal.online/api/instagram/callback`
- [ ] RapidAPI endpoints estão corretos no código
- [ ] Fez novo build e deploy após as correções
- [ ] Aguardou 5-10 minutos para o cache limpar
