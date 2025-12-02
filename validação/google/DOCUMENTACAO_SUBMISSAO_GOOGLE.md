# Documentacao para Submissao - Google OAuth Verification
## Leadgram - Gerenciamento de Conteudo para Criadores

**Data:** 02/12/2025
**App:** Leadgram
**URL:** https://formulareal.online

---

## 1. INFORMACOES BASICAS DO APP

### Nome do App
```
Leadgram
```

### Tipo de Aplicacao
```
Web application
```

### Descricao do App (copiar e colar)
```
Leadgram is a content management platform designed for content creators who want to organize, analyze, and manage their social media content professionally.

The Google Drive integration allows users to:
1. Upload videos created through our platform to their personal Google Drive
2. Organize content in automatic folders by date/category
3. List and manage videos previously uploaded through the app
4. Maintain secure backups of their content

Our app only accesses files created by Leadgram itself - we never access or read other files in the user's Drive. Users have full control over uploads and can disconnect at any time.

Target audience: Content creators, digital influencers, social media managers, and small businesses.
```

### Descricao em Portugues (alternativa)
```
O Leadgram e uma plataforma de gerenciamento de conteudo desenvolvida para criadores que desejam organizar, analisar e gerenciar seu conteudo de midias sociais de forma profissional.

A integracao com Google Drive permite aos usuarios:
1. Fazer upload de videos criados atraves da nossa plataforma para o Google Drive pessoal
2. Organizar conteudo em pastas automaticas por data/categoria
3. Listar e gerenciar videos enviados anteriormente pelo app
4. Manter backups seguros de seu conteudo

Nosso app apenas acessa arquivos criados pelo proprio Leadgram - nunca acessamos ou lemos outros arquivos no Drive do usuario. Os usuarios tem controle total sobre uploads e podem desconectar a qualquer momento.
```

---

## 2. URLs OBRIGATORIAS

### Homepage
```
https://formulareal.online
```

### Politica de Privacidade (Privacy Policy)
```
https://formulareal.online/legal/privacy
```

### Termos de Servico (Terms of Service)
```
https://formulareal.online/legal/terms
```

### Authorized Redirect URI (OAuth Callback)
```
https://formulareal.online/api/google-drive/callback
```

### Authorized JavaScript Origin
```
https://formulareal.online
```

---

## 3. SCOPES SOLICITADOS E JUSTIFICATIVAS

### Scope: drive.file
**URI:** `https://www.googleapis.com/auth/drive.file`
**Tipo:** Sensitive (requer verificacao)

**Justificativa em Ingles (recomendado):**
```
We request the drive.file scope to allow users to upload video content created through our platform to their personal Google Drive.

Specific use cases:
1. VIDEO UPLOAD: Users can upload videos they create/edit in Leadgram directly to their Google Drive for backup purposes
2. FOLDER CREATION: We create organized folders (e.g., "Leadgram Backups/2025/December") to keep user content organized
3. FILE LISTING: We display a list of files previously uploaded through our app so users can manage their backups
4. FILE DELETION: Users can delete files they uploaded through our app if they no longer need them

IMPORTANT SECURITY NOTES:
- We ONLY access files created by our application
- We NEVER access, read, or modify other files in the user's Drive
- The drive.file scope is the most restrictive scope that allows file uploads
- Users can revoke access at any time through our app or Google Account settings

Alternative scopes considered:
- drive.readonly: Does not allow uploads (insufficient for our needs)
- drive: Accesses ALL files (excessive and unnecessary)
- drive.file: IDEAL - Only accesses files created by our app
```

**Justificativa em Portugues (alternativa):**
```
Solicitamos o escopo drive.file para permitir que usuarios facam upload de conteudo de video criado atraves de nossa plataforma para seu Google Drive pessoal.

Casos de uso especificos:
1. UPLOAD DE VIDEO: Usuarios podem enviar videos que criam/editam no Leadgram diretamente para seu Google Drive como backup
2. CRIACAO DE PASTAS: Criamos pastas organizadas (ex: "Leadgram Backups/2025/Dezembro") para manter o conteudo organizado
3. LISTAGEM DE ARQUIVOS: Exibimos lista de arquivos enviados anteriormente pelo app para que usuarios gerenciem seus backups
4. EXCLUSAO DE ARQUIVOS: Usuarios podem excluir arquivos que enviaram pelo app se nao precisarem mais

NOTAS IMPORTANTES DE SEGURANCA:
- Apenas acessamos arquivos criados pelo nosso aplicativo
- NUNCA acessamos, lemos ou modificamos outros arquivos no Drive do usuario
- O escopo drive.file e o mais restritivo que permite uploads
- Usuarios podem revogar acesso a qualquer momento
```

---

### Scope: userinfo.email
**URI:** `https://www.googleapis.com/auth/userinfo.email`
**Tipo:** Non-sensitive

**Justificativa:**
```
We request the userinfo.email scope to identify which Google account is connected to our application.

Specific use cases:
1. Display the connected Google account email in the user interface
2. Allow users to verify they connected the correct account
3. Support users who may have multiple Google accounts

This is a non-sensitive scope and is used solely for identification purposes within our app interface.
```

---

### Scope: userinfo.profile (se usado)
**URI:** `https://www.googleapis.com/auth/userinfo.profile`
**Tipo:** Non-sensitive

**Justificativa:**
```
We request basic profile information to personalize the user experience by displaying their name and profile picture when their Google account is connected.

This information is only displayed within our app to help users identify which account is connected.
```

---

## 4. VERIFICACAO DE DOMINIO

### Passo a Passo - Google Search Console

1. Acesse https://search.google.com/search-console
2. Clique em "Adicionar propriedade"
3. Selecione "Prefixo de URL"
4. Digite: `https://formulareal.online`
5. Escolha metodo de verificacao:

**Opcao A - Meta Tag HTML (mais facil):**
```html
<meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
```
Adicionar no `<head>` do arquivo `app/layout.tsx`

**Opcao B - Arquivo HTML:**
- Baixe o arquivo de verificacao
- Faca upload na pasta `public/` do projeto
- Deploy no Vercel

**Opcao C - DNS TXT Record:**
- Adicione registro TXT no DNS do dominio
- Valor fornecido pelo Google

6. Apos verificar, vincule no Google Cloud Console:
   - APIs & Services > OAuth consent screen
   - Authorized domains > Add domain

---

## 5. OAUTH CONSENT SCREEN - CONFIGURACAO

### User Type
```
External
```

### App Information
| Campo | Valor |
|-------|-------|
| App name | Leadgram |
| User support email | [seu-email@dominio.com] |
| App logo | Upload do logo 120x120 PNG |

### App Domain
| Campo | Valor |
|-------|-------|
| Application home page | https://formulareal.online |
| Application privacy policy | https://formulareal.online/legal/privacy |
| Application terms of service | https://formulareal.online/legal/terms |

### Authorized Domains
```
formulareal.online
```

### Developer Contact Information
```
[seu-email@dominio.com]
```

---

## 6. VIDEO DEMONSTRATIVO (SE NECESSARIO)

O Google pode solicitar um video demonstrativo. Se solicitado:

### Requisitos do Video
- **Duracao:** 3-5 minutos
- **Resolucao:** Minimo 1280x720
- **Formato:** MP4, MOV ou link YouTube (nao listado)
- **Audio:** Opcional (pode ser sem audio)

### Roteiro do Video Google Drive

```
0:00 - 0:30  | Login no app (formulareal.online)
0:30 - 1:00  | Navegar ate area de conexao Google Drive
1:00 - 1:30  | Clicar em "Conectar Google Drive"
1:30 - 2:00  | Mostrar tela de permissoes do Google (consent screen)
2:00 - 2:30  | Autorizar e voltar ao app
2:30 - 3:30  | Fazer upload de um video para o Drive
3:30 - 4:00  | Mostrar pasta criada no Google Drive do usuario
4:00 - 4:30  | Mostrar lista de videos enviados no app
4:30 - 5:00  | Demonstrar desconexao/revogacao de acesso
```

### O que mostrar em cada scope

| Scope | O que demonstrar |
|-------|------------------|
| drive.file | Upload de arquivo, pasta criada, listagem de arquivos |
| userinfo.email | Email da conta conectada visivel na interface |

---

## 7. DOCUMENTACAO DE SEGURANCA

### Security Assessment (se solicitado pelo Google)

```
SECURITY PRACTICES - LEADGRAM

1. OAUTH IMPLEMENTATION
   - We use standard OAuth 2.0 authorization code flow
   - State parameter is used to prevent CSRF attacks
   - Tokens are stored securely in our database (Supabase with RLS)
   - Access tokens are never exposed to the client-side

2. TOKEN STORAGE
   - Access tokens and refresh tokens are stored in Supabase
   - Row Level Security (RLS) ensures users can only access their own tokens
   - Tokens are encrypted at rest by Supabase
   - We use refresh tokens to maintain access without re-authentication

3. DATA HANDLING
   - We only access files created by our application (drive.file scope)
   - User data is never shared with third parties
   - Users can delete their data at any time
   - We comply with LGPD (Brazilian General Data Protection Law)

4. HTTPS
   - All communications use HTTPS
   - Our domain (formulareal.online) has valid SSL certificate
   - No sensitive data is transmitted over unencrypted connections

5. ACCESS REVOCATION
   - Users can disconnect Google Drive from within our app
   - Upon disconnection, we delete stored tokens
   - Users can also revoke access from Google Account settings

6. DATA DELETION
   - Users can request complete account deletion
   - All user data including tokens is permanently deleted
   - Data deletion URL: https://formulareal.online/legal/data-deletion
```

---

## 8. CHECKLIST ANTES DE SUBMETER

### Google Cloud Console
- [ ] Projeto criado
- [ ] Google Drive API habilitada
- [ ] OAuth 2.0 Client ID criado (Web application)
- [ ] Client ID e Client Secret configurados no Vercel

### OAuth Consent Screen
- [ ] User type: External
- [ ] App name: Leadgram
- [ ] User support email preenchido
- [ ] App logo uploaded (120x120 PNG)
- [ ] Homepage URL: https://formulareal.online
- [ ] Privacy Policy URL: https://formulareal.online/legal/privacy
- [ ] Terms of Service URL: https://formulareal.online/legal/terms
- [ ] Authorized domains: formulareal.online
- [ ] Developer contact email preenchido

### Scopes
- [ ] drive.file adicionado
- [ ] userinfo.email adicionado
- [ ] Justificativas preparadas

### Verificacao de Dominio
- [ ] Dominio verificado no Google Search Console
- [ ] Dominio adicionado em Authorized Domains no OAuth consent screen

### Credenciais OAuth
- [ ] Authorized redirect URI: https://formulareal.online/api/google-drive/callback
- [ ] Authorized JavaScript origin: https://formulareal.online

---

## 9. PASSO A PASSO PARA SUBMETER

1. Acesse https://console.cloud.google.com
2. Selecione seu projeto
3. Va em **APIs & Services > OAuth consent screen**
4. Revise todas as informacoes
5. Clique em **"Publish App"** (sai do modo teste)
6. Se usar scopes sensiveis (drive.file), clique em **"Submit for Verification"**
7. Preencha o formulario:
   - Descricao detalhada do uso de cada scope
   - Justificativas (use os textos acima)
   - Video demonstrativo (se solicitado)
8. Submeta e aguarde

---

## 10. APOS SUBMISSAO

### Prazos
- **Scopes nao-sensiveis:** Aprovacao rapida ou automatica
- **Scopes sensiveis (drive.file):** 4-6 semanas
- **Scopes restritos:** Pode exigir auditoria de terceiros

### Acompanhamento
- Monitore email para notificacoes do Google
- Responda rapidamente a perguntas
- Faca ajustes se solicitado

### Se Aprovado
- O app sai do modo "Testing" e vai para "Published"
- Qualquer usuario pode autorizar o app
- O limite de 100 usuarios de teste e removido

### Se Rejeitado
- Leia o feedback detalhado
- Faca as correcoes solicitadas
- Resubmeta com as alteracoes

---

## 11. NOTAS IMPORTANTES

### Modo de Teste vs Publicado

| Aspecto | Modo Teste | Publicado |
|---------|------------|-----------|
| Usuarios | Maximo 100 (adicionados manualmente) | Ilimitado |
| Consent screen | Mostra aviso "App nao verificado" | Sem aviso |
| Verificacao | Nao necessaria | Necessaria para scopes sensiveis |

### Aviso "App nao verificado"
Enquanto o app estiver em modo teste ou pendente de verificacao, usuarios verao:
- "This app isn't verified"
- "Continue" (opcao avancada)

Apos aprovacao, este aviso desaparece.

---

## 12. CONTATOS

**Email de Suporte:** [seu-email@dominio.com]
**Email de Privacidade:** [privacy@dominio.com]
**Email do Desenvolvedor:** [dev@dominio.com]

---

## 13. LINKS UTEIS

- Google Cloud Console: https://console.cloud.google.com
- OAuth Verification FAQ: https://support.google.com/cloud/answer/9110914
- Google Search Console: https://search.google.com/search-console
- Scopes do Drive: https://developers.google.com/drive/api/guides/api-specific-auth

---

**Documento preparado para verificacao OAuth do Google**
**Leadgram - 2025**
