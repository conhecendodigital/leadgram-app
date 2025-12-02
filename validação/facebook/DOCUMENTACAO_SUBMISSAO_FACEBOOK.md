# Documentacao para Submissao - Facebook App Review
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

### Categoria
```
Business and Pages Management
```

### Descricao Curta (1 frase)
```
Plataforma de gerenciamento de conteudo e analytics para criadores do Instagram.
```

### Descricao Completa (copiar e colar)
```
O Leadgram e uma plataforma web desenvolvida para criadores de conteudo que desejam organizar, analisar e gerenciar suas publicacoes do Instagram de forma profissional.

PRINCIPAIS FUNCIONALIDADES:

1. Banco de Ideias de Conteudo
   - Organizacao de ideias por funil de vendas
   - Sistema de tags e categorias
   - Planejamento de publicacoes

2. Integracao com Instagram Business
   - Visualizacao de todos os posts publicados
   - Importacao automatica de conteudo
   - Sincronizacao em tempo real

3. Analytics e Metricas
   - Dashboard completo com metricas de engajamento
   - Impressoes, alcance, curtidas e comentarios
   - Graficos de evolucao ao longo do tempo
   - Identificacao dos melhores horarios para postar
   - Analise dos melhores dias da semana

4. Exploracao de Conteudo
   - Pesquisa de perfis e hashtags
   - Descoberta de tendencias

PUBLICO-ALVO:
Criadores de conteudo, influenciadores digitais, gestores de midias sociais e pequenos negocios que utilizam Instagram como principal canal de comunicacao.

SEGURANCA E PRIVACIDADE:
- Dados nunca sao compartilhados com terceiros
- Usuario pode excluir conta e dados a qualquer momento
- Cumprimos LGPD e politicas do Facebook/Meta
- Conexao segura via HTTPS
```

---

## 2. URLs OBRIGATORIAS

### URL do App
```
https://formulareal.online
```

### Politica de Privacidade
```
https://formulareal.online/legal/privacy
```

### Termos de Uso
```
https://formulareal.online/legal/terms
```

### Instrucoes de Exclusao de Dados (Data Deletion)
```
https://formulareal.online/legal/data-deletion
```

### Callback URL (OAuth Redirect)
```
https://formulareal.online/api/instagram/callback
```

---

## 3. JUSTIFICATIVAS DAS PERMISSOES

### instagram_basic
```
Precisamos acessar informacoes basicas do perfil do Instagram do usuario para exibir o nome de usuario e foto de perfil na plataforma. Isso permite que o usuario identifique qual conta esta conectada e gerencie sua conexao. Os dados sao exibidos apenas para o proprio usuario na area de configuracoes e no cabecalho do dashboard.

Uso especifico:
- Exibir nome do perfil conectado no header do app
- Mostrar foto de perfil na area de configuracoes
- Confirmar qual conta Instagram esta vinculada
```

### instagram_manage_insights
```
Solicitamos acesso as metricas e insights dos posts do Instagram para fornecer analises de desempenho ao usuario. Nosso app exibe dashboards completos com metricas como curtidas, comentarios, alcance, impressoes e taxa de engajamento.

Uso especifico:
- Dashboard de Analytics com metricas dos ultimos 30 dias
- Graficos de evolucao de alcance ao longo do tempo
- Calculo de taxa de engajamento por post
- Identificacao do melhor horario para postar
- Ranking dos melhores dias da semana para publicar
- Media diaria de impressoes e alcance
- Total de comentarios e interacoes

Isso ajuda criadores de conteudo a entenderem o desempenho de suas publicacoes e melhorarem sua estrategia de conteudo.
```

### pages_show_list
```
Precisamos listar as paginas do Facebook vinculadas ao usuario para identificar contas Instagram Business/Creator conectadas a essas paginas. Contas Instagram Business obrigatoriamente precisam estar vinculadas a uma Pagina do Facebook, e esta permissao nos permite fazer essa associacao corretamente.

Uso especifico:
- Identificar qual Pagina do Facebook esta conectada ao Instagram Business
- Permitir que o usuario selecione a conta correta caso tenha multiplas paginas
- Garantir a sincronizacao correta dos dados entre Facebook e Instagram
```

### pages_read_engagement (se aplicavel)
```
Solicitamos acesso as metricas de engajamento das paginas para complementar as analises de desempenho. Isso nos permite fornecer uma visao mais completa das interacoes do usuario em todas as plataformas conectadas.

Uso especifico:
- Metricas complementares de engajamento
- Analise cruzada entre Facebook e Instagram
- Relatorios mais completos de performance
```

---

## 4. INSTRUCOES DE TESTE PARA O REVISOR

### Como Testar o Leadgram

**Passo 1: Acessar o App**
- Acesse https://formulareal.online
- Voce vera a tela de login

**Passo 2: Criar Conta ou Usar Conta de Teste**
- Clique em "Criar conta" para registrar-se
- Ou utilize as credenciais de teste abaixo (se fornecidas)

**Passo 3: Conectar Instagram**
- Apos login, clique em "Instagram" no menu lateral
- Clique no botao "Conectar via Facebook"
- Autorize as permissoes solicitadas
- Voce sera redirecionado de volta ao app

**Passo 4: Verificar Funcionalidades**
- Dashboard: Veja o resumo da conta conectada
- Analytics: Visualize metricas detalhadas (impressoes, alcance, engajamento)
- Posts: Veja todos os posts importados do Instagram
- Explorar: Pesquise perfis e hashtags (requer creditos de API)

**Passo 5: Testar Desconexao**
- Va em Configuracoes > Instagram
- Clique em "Desconectar Instagram"
- Confirme a desconexao

### Requisitos para Teste
- Conta Instagram Business ou Creator
- Pagina do Facebook vinculada ao Instagram
- Ser administrador da Pagina

---

## 5. CONTA DE TESTE (OPCIONAL)

### Opcao A: Credenciais de Teste
Se voce quiser fornecer uma conta de teste, preencha abaixo:

```
Email: [SEU_EMAIL_DE_TESTE]
Senha: [SUA_SENHA_DE_TESTE]

Instagram de teste conectado: @[USUARIO_INSTAGRAM]
```

### Opcao B: Adicionar Revisor como Testador
Alternativamente, adicione o revisor do Facebook como testador:
1. Va em Facebook Developers > Seu App > Roles > Test Users
2. Adicione o revisor como testador
3. Ele podera testar com a propria conta

**NOTA:** Se preferir nao fornecer conta de teste, o revisor pode solicitar posteriormente. Recomendamos ter uma conta pronta para agilizar o processo.

---

## 6. MATERIAIS INCLUSOS NESTA PASTA

| Arquivo | Descricao |
|---------|-----------|
| login.png | Screenshot da tela de login |
| conect_instagram.png | Screenshot da pagina de conexao Instagram |
| posts.png | Screenshot da listagem de posts |
| metricas.png | Screenshot do dashboard de Analytics |
| *.mp4 | Video demonstrativo do app (2:36) |
| DOCUMENTACAO_SUBMISSAO_FACEBOOK.md | Este documento |

---

## 7. CHECKLIST ANTES DE SUBMETER

- [ ] Logo 1024x1024 cadastrado no Facebook Developers
- [ ] URLs verificadas e funcionando:
  - [ ] https://formulareal.online
  - [ ] https://formulareal.online/legal/privacy
  - [ ] https://formulareal.online/legal/terms
  - [ ] https://formulareal.online/legal/data-deletion
- [ ] Video demonstrativo pronto
- [ ] Screenshots prontos (4 imagens)
- [ ] Descricao do app copiada
- [ ] Justificativas das permissoes copiadas
- [ ] Dominio verificado no Facebook Developers
- [ ] Callback URL configurada

---

## 8. PASSO A PASSO PARA SUBMETER

1. Acesse https://developers.facebook.com/apps
2. Selecione seu app (Leadgram / Lead Engine)
3. Va em **App Review > Permissions and Features**
4. Para cada permissao necessaria:
   - Clique em "Request"
   - Cole a justificativa correspondente
   - Faca upload do video demonstrativo
   - Adicione os screenshots
5. Preencha informacoes adicionais se solicitado
6. Clique em "Submit for Review"

---

## 9. APOS SUBMISSAO

- **Prazo de resposta:** 3-7 dias uteis (pode variar)
- **Acompanhe:** Facebook Developers > App Review > Submissions
- **Se rejeitado:** Leia o feedback, ajuste e resubmeta
- **Se aprovado:** As permissoes serao liberadas automaticamente

---

## 10. CONTATOS

**Email de Suporte:** [seu-email@dominio.com]
**Email de Privacidade:** [privacy@dominio.com]

---

**Documento preparado para submissao ao Facebook App Review**
**Leadgram - 2025**
