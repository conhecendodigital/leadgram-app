# 📋 Próximos Passos - Leadgram

**Última atualização:** 17 de Janeiro de 2025

---

## ✅ Concluído Recentemente

### Integração Google Drive (17/01/2025)
- [x] Autenticação OAuth2 com Google Drive
- [x] Upload de vídeos com qualidade original
- [x] Criação automática de pastas e subpastas
- [x] Interface de upload com drag-and-drop
- [x] Prévias e lista de vídeos enviados
- [x] Campo Status habilitado ao criar ideia

---

## 🚀 Próximas Features Prioritárias

### 1. Páginas Legais (ALTA PRIORIDADE)
**Objetivo:** Cumprir requisitos legais e preparar para publicação do app OAuth

**Tasks:**
- [ ] Criar página de Política de Privacidade
- [ ] Criar página de Termos de Uso
- [ ] Criar página de Política de Cookies
- [ ] Adicionar links no footer
- [ ] Revisar com advogado/compliance

**Notas:**
- Necessário para publicar o app OAuth do Google (atualmente em modo de teste)
- Importante para LGPD/GDPR compliance

---

### 2. Publicação do App OAuth Google
**Objetivo:** Permitir que qualquer usuário conecte o Google Drive

**Tasks:**
- [ ] Aguardar conclusão das páginas legais
- [ ] Submeter app para verificação do Google
- [ ] Adicionar logo do app
- [ ] Preencher formulário de verificação
- [ ] Aguardar aprovação (pode levar semanas)

**Alternativa:** Manter em modo de teste e adicionar até 100 usuários manualmente

---

### 3. Melhorias na Análise de Páginas
**Referência:** `docs/archive/ANALISE_PAGINAS.md`

**Tasks pendentes:**
- [ ] Implementar sistema de busca avançada
- [ ] Adicionar filtros por data
- [ ] Exportação de dados em CSV/Excel
- [ ] Gráficos de performance por período

---

## 🔧 Manutenções e Otimizações

### Infraestrutura
- [ ] Configurar variáveis de ambiente em produção (Vercel)
  - Adicionar `GOOGLE_CLIENT_ID`
  - Adicionar `GOOGLE_CLIENT_SECRET`
- [ ] Revisar limites de API do Google Drive
- [ ] Monitorar uso de storage no Supabase

### Segurança
- [ ] Implementar rate limiting no upload de vídeos
- [ ] Adicionar validação de tamanho máximo de arquivo
- [ ] Revisar permissões RLS no Supabase

### Performance
- [ ] Otimizar queries do Supabase
- [ ] Implementar cache de conexões do Drive
- [ ] Lazy loading de componentes pesados

---

## 📚 Documentação Arquivada

Documentações antigas foram organizadas em `docs/archive/`:
- ANALISE_PAGINAS.md
- INSTRUCOES_MIGRATIONS.md
- INTEGRACAO_RAPIDAPI_CONCLUIDA.md
- LIMPEZA_PROJETO.md
- OPTIMIZATIONS.md
- RELATORIO_COMPLETO_CONFIGURACOES.md
- RESUMO_2025-01-11.md
- UPLOAD_SETUP.md
- trabalho.md

---

## 🐛 Bugs Conhecidos

*Nenhum bug crítico reportado no momento.*

---

## 💡 Ideias Futuras (Backlog)

- Sistema de notificações push
- Integração com TikTok API
- Agendamento de posts
- Templates de ideias
- Colaboração em equipe
- Dashboard de analytics avançado

---

## 📝 Notas Importantes

### Google Drive Integration
- OAuth está em **modo de teste** - usuários precisam ser adicionados manualmente
- Email do desenvolvedor precisa estar na lista de testadores
- Limite atual: 100 usuários de teste
- Para produção: necessário processo de verificação do Google

### Variáveis de Ambiente
Certifique-se de configurar no Vercel:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Nota:** Use as credenciais reais do Google Cloud Console (OAuth 2.0 Client ID)

### Migração do Banco
Última migração: `20250117000000_google_drive_integration.sql`
- Tabela: `google_drive_accounts`
- Colunas adicionadas em `ideas`: `drive_folder_id`, `drive_video_ids`

---

**🎯 Foco Imediato:** Páginas Legais → Deploy → Publicação OAuth
