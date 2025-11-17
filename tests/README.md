# Tests

Este diretorio contem os testes automatizados do Leadgram.

## Estrutura

```
tests/
  e2e/              # Testes End-to-End com Playwright
    smoke.spec.ts   # Smoke tests basicos
    dashboard.spec.ts # Testes especificos do dashboard
```

## Rodando os Testes

### Todos os testes
```bash
npm test
```

### Somente smoke tests
```bash
npm run test:smoke
```

### Com UI interativa
```bash
npm run test:ui
```

### Com navegador visivel (headed mode)
```bash
npm run test:headed
```

### Ver relatorio de testes
```bash
npm run test:report
```

## Playwright

Usamos Playwright para testes E2E. Ele automaticamente:
- Inicia o servidor de desenvolvimento (`npm run dev`)
- Roda os testes no Chromium
- Tira screenshots em caso de falha
- Gera relatorio HTML

### Configuracao

Ver `playwright.config.ts` na raiz do projeto.

### Instalando browsers

Se for a primeira vez rodando, instale os browsers:

```bash
npx playwright install
```

## Escrevendo Testes

### Exemplo basico

```typescript
import { test, expect } from '@playwright/test'

test('should load page', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/Leadgram/)
})
```

### Boas praticas

1. **Use data attributes para seletores**: `data-testid`, `data-tour`, etc
2. **Escreva testes independentes**: Cada teste deve funcionar sozinho
3. **Use beforeEach para setup comum**: Autenticacao, navegacao, etc
4. **Mantenha testes rapidos**: Use mocks quando possivel
5. **Teste o comportamento do usuario**: Nao teste implementacao

## CI/CD

Em ambiente de CI (GitHub Actions, etc):
- Testes rodam com `--workers=1` (sem paralelismo)
- Retry automatico ate 2 vezes em caso de falha
- Screenshots e traces salvos automaticamente

## Debug

Para debugar testes:

```bash
# Abre o Playwright Inspector
npx playwright test --debug

# Roda um teste especifico
npx playwright test smoke.spec.ts --debug
```

## Mais informacoes

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
