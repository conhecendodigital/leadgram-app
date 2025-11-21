# Contribuindo para o Leadgram

Obrigado por considerar contribuir para o Leadgram! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Diretrizes de Desenvolvimento](#diretrizes-de-desenvolvimento)
- [Processo de Pull Request](#processo-de-pull-request)
- [Convenções de Código](#convenções-de-código)

## Código de Conduta

Este projeto adere ao Código de Conduta do Contributor Covenant. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamento inaceitável para suporte@leadgram.com.

## Como Posso Contribuir?

### Reportando Bugs

Antes de criar um bug report, verifique se já não existe uma issue aberta sobre o problema.

**Ao reportar um bug, inclua:**

- Título claro e descritivo
- Passos detalhados para reproduzir o problema
- Comportamento esperado vs comportamento atual
- Screenshots (se aplicável)
- Informações do ambiente (OS, browser, versão do Node.js)
- Qualquer informação adicional relevante

### Sugerindo Melhorias

Feature requests são bem-vindos! Antes de sugerir uma feature:

- Verifique se já não existe uma issue/PR sobre isso
- Explique detalhadamente o problema que a feature resolveria
- Forneça exemplos de uso
- Explique por que a feature seria útil para a maioria dos usuários

### Contribuindo com Código

1. **Fork o repositório** e crie sua branch a partir da `main`
2. **Instale as dependências**: `npm install`
3. **Crie sua feature/fix** seguindo nossas convenções
4. **Teste suas mudanças** - garanta que tudo funciona
5. **Commit suas mudanças** usando Conventional Commits
6. **Push para sua branch**: `git push origin feature/minha-feature`
7. **Abra um Pull Request**

## Diretrizes de Desenvolvimento

### Setup do Ambiente

```bash
# 1. Clone seu fork
git clone https://github.com/seu-usuario/leadgram-app.git
cd leadgram-app

# 2. Adicione o upstream remote
git remote add upstream https://github.com/conhecendodigital/leadgram-app.git

# 3. Instale dependências
npm install

# 4. Configure .env.local
cp .env.example .env.local
# Preencha com suas credenciais

# 5. Rode o projeto
npm run dev
```

### Estrutura de Branches

- `main` - Branch principal, sempre estável
- `feature/*` - Novas features
- `fix/*` - Correções de bugs
- `docs/*` - Mudanças na documentação
- `refactor/*` - Refatorações

### Workflow de Desenvolvimento

1. **Sincronize seu fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Crie uma branch**:
   ```bash
   git checkout -b feature/minha-feature
   ```

3. **Faça suas mudanças**

4. **Commit** (veja convenções abaixo)

5. **Push e abra PR**

## Processo de Pull Request

### Checklist antes de abrir PR

- [ ] Código segue as convenções do projeto
- [ ] Mudanças foram testadas localmente
- [ ] Build passa sem erros (`npm run build`)
- [ ] Commit messages seguem Conventional Commits
- [ ] Documentação foi atualizada (se necessário)
- [ ] Não há conflitos com a branch main
- [ ] PR tem título descritivo

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como testar
1. Passos para testar
2. Comportamento esperado

## Screenshots (se aplicável)
...

## Checklist
- [ ] Build passa
- [ ] Código testado
- [ ] Documentação atualizada
```

### Revisão de Código

Todos os PRs passam por revisão antes de merge. Feedbacks podem incluir:

- Sugestões de melhorias
- Pedidos de clarificação
- Mudanças necessárias
- Aprovação

Seja receptivo ao feedback e faça as mudanças solicitadas.

## Convenções de Código

### TypeScript

- Use TypeScript strict mode
- Prefira interfaces a types quando possível
- Documente funções complexas com JSDoc

```typescript
/**
 * Calcula engagement rate de um post
 * @param likes - Número de curtidas
 * @param comments - Número de comentários
 * @param views - Número de visualizações
 * @returns Engagement rate em percentual
 */
function calculateEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0
  return ((likes + comments) / views) * 100
}
```

### React Components

- Use functional components com hooks
- Prefira Client Components apenas quando necessário
- Extraia lógica complexa para hooks customizados
- Use `memo` para componentes pesados

```tsx
'use client' // Apenas quando necessário

import { useState } from 'react'

interface Props {
  title: string
  onSave: (data: FormData) => void
}

export function MyComponent({ title, onSave }: Props) {
  const [data, setData] = useState<FormData>()

  return (
    <div>
      <h1>{title}</h1>
      {/* ... */}
    </div>
  )
}
```

### CSS/Tailwind

- Use Tailwind classes sempre que possível
- Para estilos customizados, use CSS modules ou globals.css
- Siga ordem consistente de classes Tailwind:
  - Layout (flex, grid, etc)
  - Tamanho (w-, h-, p-, m-)
  - Tipografia (text-, font-)
  - Cores (bg-, text-, border-)
  - Estados (hover:, focus:, active:)

```tsx
<button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all">
  Salvar
</button>
```

### API Routes

- Sempre valide inputs
- Use try-catch para error handling
- Retorne status codes apropriados
- Documente endpoints complexos

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validação
    if (!body.field) {
      return NextResponse.json(
        { error: 'Field is required' },
        { status: 400 }
      )
    }

    // Lógica
    const result = await processData(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Commit Messages

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional>

<footer opcional>
```

**Tipos:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, sem mudança de código
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `test:` Adição de testes
- `chore:` Tarefas de manutenção

**Exemplos:**

```bash
feat(ideas): adiciona filtro por plataforma

- Implementa dropdown de filtro
- Adiciona lógica de filtragem
- Atualiza testes

Closes #123
```

```bash
fix(instagram): corrige sync de posts duplicados

Mudou de instagram_post_id para instagram_media_id

Fixes #456
```

### Testes

Embora não tenhamos testes automatizados ainda, teste manualmente:

1. **Funcionalidade básica** - Feature funciona como esperado
2. **Edge cases** - Testa casos extremos (vazio, muito grande, etc)
3. **Responsividade** - Testa em mobile e desktop
4. **Performance** - Verifica se não há lentidão
5. **Erros** - Testa comportamento com erros

## Perguntas?

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/conhecendodigital/leadgram-app/discussions)
- Entre em contato: suporte@leadgram.com
- Pergunte no [Discord](https://discord.gg/leadgram) (quando disponível)

## Agradecimentos

Obrigado por contribuir para o Leadgram! Sua ajuda torna o projeto melhor para todos. 🎉
