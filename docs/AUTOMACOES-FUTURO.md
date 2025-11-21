# Automações - Planejamento Futuro

## 🎯 Visão Geral

Esta página será implementada no futuro para oferecer **automações de engajamento** aos usuários do Leadgram.

## 💡 Conceito

Diferentemente da sincronização de posts do Instagram (que já acontece automaticamente em background via cron jobs), as automações serão focadas em **interações e engajamento**.

## 🚀 Funcionalidades Planejadas

### 1. Automação de Engajamento (Prioridade)
- Responder automaticamente a comentários
- Responder DMs com mensagens personalizadas
- Curtir posts automaticamente baseado em hashtags/usuários
- Seguir/deixar de seguir usuários estrategicamente
- Enviar mensagens de boas-vindas para novos seguidores

### 2. Integração com N8n
O chefe já possui workflows prontos no n8n para automações de engajamento. A integração pode ser feita de duas formas:

#### Opção A: N8n como Backend
- Leadgram UI → N8n API → Instagram
- Vantagens: workflows já prontos, fácil customização
- Desvantagens: depende de servidor n8n rodando

#### Opção B: Integração Híbrida
- Automações simples: direto do Leadgram
- Automações complexas: via n8n
- Vantagens: melhor UX, mais controle
- Desvantagens: mais desenvolvimento

### 3. Interface Planejada

```
┌─────────────────────────────────────┐
│  Automações de Engajamento          │
├─────────────────────────────────────┤
│                                     │
│  🤖 Resposta Automática             │
│  [ Toggle ON/OFF ]                  │
│  • Responder comentários            │
│  • Responder DMs                    │
│  • Mensagem de boas-vindas          │
│                                     │
│  ❤️ Engajamento Automático          │
│  [ Toggle ON/OFF ]                  │
│  • Curtir posts por hashtag         │
│  • Seguir usuários similares        │
│                                     │
│  📊 Estatísticas                    │
│  • Comentários respondidos: 234     │
│  • DMs respondidas: 45              │
│  • Posts curtidos: 89               │
│                                     │
│  ⚙️ Configurações Avançadas         │
│  • Limite diário de ações           │
│  • Horários de funcionamento        │
│  • Palavras-chave                   │
│  • Templates de mensagens           │
│                                     │
└─────────────────────────────────────┘
```

## 🗄️ Estrutura do Banco de Dados (Futura)

```sql
-- Tabela de configurações de automação
CREATE TABLE automation_configs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- Tipos de automação
  auto_reply_comments BOOLEAN DEFAULT false,
  auto_reply_dms BOOLEAN DEFAULT false,
  auto_like BOOLEAN DEFAULT false,
  auto_follow BOOLEAN DEFAULT false,

  -- Configurações
  daily_action_limit INTEGER DEFAULT 100,
  active_hours JSONB, -- ex: {"start": "08:00", "end": "22:00"}
  keywords TEXT[], -- palavras-chave para filtros
  message_templates JSONB,

  -- Status
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de ações automatizadas
CREATE TABLE automation_actions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'comment_reply', 'dm_reply', 'like', 'follow'
  target_username TEXT,
  target_content TEXT,
  response_sent TEXT,
  status TEXT, -- 'success', 'failed', 'skipped'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de execução
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  execution_date DATE,
  total_actions INTEGER,
  successful_actions INTEGER,
  failed_actions INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📋 Checklist de Implementação (Quando for fazer)

- [ ] Conversar com o chefe sobre a integração n8n
- [ ] Definir quais automações são prioridade (fase 1)
- [ ] Criar mockups de UI/UX da página
- [ ] Implementar backend (migrations, API endpoints)
- [ ] Integrar com n8n (se aplicável)
- [ ] Implementar frontend com toggles e configurações
- [ ] Adicionar página de estatísticas/logs
- [ ] Testes com conta de desenvolvimento Instagram
- [ ] Implementar rate limiting (evitar ban do Instagram)
- [ ] Documentação para usuários

## ⚠️ Considerações Importantes

1. **Compliance Instagram**: Respeitar os limites da API do Instagram para evitar bloqueios
2. **Rate Limiting**: Implementar limites diários de ações (ex: max 50 likes/hora)
3. **Horários**: Evitar ações fora do horário comercial (parecer mais humano)
4. **Consentimento**: Usuário deve ativar explicitamente cada tipo de automação
5. **Transparência**: Mostrar claramente o que está sendo feito automaticamente

## 🔗 Referências

- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- N8n Workflows: (verificar com o chefe)
- Best Practices: evitar comportamento de bot detectável

---

**Status**: 📝 Planejamento
**Última atualização**: 2025-11-21
**Responsável**: Aguardando alinhamento com chefe sobre integração n8n
