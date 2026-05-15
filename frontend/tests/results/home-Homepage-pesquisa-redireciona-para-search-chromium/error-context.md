# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Homepage >> pesquisa redireciona para /search
- Location: tests/home.spec.ts:25:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /q=crom\+search/
Received string:  "http://127.0.0.1:3000/search?q=crom%20search"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    5 × unexpected value "http://127.0.0.1:3000/search?q=crom%20search"

```

```yaml
- banner:
  - link "CROM":
    - /url: /
    - img "CROM"
  - textbox "Pesquisar na web...": crom search
  - button
  - link "Configurações":
    - /url: /settings
  - button "Alternar tema"
  - navigation:
    - button "Chat IA"
    - button "Todos"
    - button "Imagens"
    - button "Vídeos"
    - button "Notícias"
    - button "Código"
- main:
  - paragraph:
    - text: Aproximadamente
    - strong: 1,240
    - text: resultados em
    - strong: 0.04s
  - article:
    - text: D
    - paragraph: Documentação CROM
    - paragraph: crom.me › docs › introdução
    - link "Introdução ao Motor de Busca CROM — Documentação Oficial":
      - /url: https://crom.me
    - paragraph: O CROM é um motor de busca soberano, construído com foco em privacidade e descentralização.
    - link "Instalação":
      - /url: "#"
    - link "API Reference":
      - /url: "#"
    - link "Contribuir":
      - /url: "#"
    - link "Ver detalhes do link":
      - /url: /link/1-0
  - article:
    - text: G
    - paragraph: GitHub
    - paragraph: github.com › crom-project › crom-search
    - 'link "crom-project/crom-search: Motor de busca descentralizado"':
      - /url: https://github.com
    - paragraph: "Repositório oficial do CROM Search Engine. Sem rastreadores, sem anúncios. Stars: 2.4k · Forks: 342"
    - link "Ver detalhes do link":
      - /url: /link/1-1
  - article:
    - text: W
    - paragraph: Wikipedia
    - paragraph: pt.wikipedia.org › wiki › Motor_de_busca
    - link "Motor de busca — Wikipédia, a enciclopédia livre":
      - /url: https://pt.wikipedia.org
    - paragraph: Um motor de busca é um sistema de software projetado para realizar pesquisas na World Wide Web...
    - link "Ver detalhes do link":
      - /url: /link/1-2
  - article:
    - text: D
    - paragraph: Dev.to
    - paragraph: dev.to › crom › construindo-motor-busca
    - link "Construindo um motor de busca do zero com Go e Elasticsearch":
      - /url: https://dev.to
    - paragraph: Neste artigo, exploramos como construir um motor de busca completo com Go e Elasticsearch...
    - link "Ver detalhes do link":
      - /url: /link/1-3
  - article:
    - text: C
    - paragraph: CROM Blog
    - paragraph: blog.crom.me › privacidade-digital
    - 'link "Por que a soberania digital importa: o manifesto CROM"':
      - /url: https://blog.crom.me
    - paragraph: A soberania digital é o direito de cada indivíduo controlar seus próprios dados...
    - link "Ver detalhes do link":
      - /url: /link/1-4
  - heading "Pesquisas relacionadas" [level=2]
  - link "motor de busca privado":
    - /url: /search?q=motor%20de%20busca%20privado
  - link "alternativas ao google":
    - /url: /search?q=alternativas%20ao%20google
  - link "busca descentralizada":
    - /url: /search?q=busca%20descentralizada
  - link "privacidade na internet":
    - /url: /search?q=privacidade%20na%20internet
  - link "DuckDuckGo vs Brave":
    - /url: /search?q=DuckDuckGo%20vs%20Brave
  - link "como indexar a web":
    - /url: /search?q=como%20indexar%20a%20web
  - complementary:
    - heading "CROM Search" [level=2]
    - paragraph: Motor de Busca · Software Livre
    - paragraph: Motor de busca soberano focado em privacidade e descentralização. Qualquer pessoa pode hospedar sua instância.
    - text: Licença MIT Linguagem Go, TypeScript Website
    - link "crom.me":
      - /url: "#"
    - text: Repositório
    - link "GitHub":
      - /url: "#"
- contentinfo:
  - navigation:
    - link "Termos":
      - /url: "#"
    - link "Privacidade":
      - /url: "#"
    - link "Contato":
      - /url: "#"
    - link "Preferências":
      - /url: /settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Homepage', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('carrega com logo e barra de pesquisa', async ({ page }) => {
  9  |     await expect(page.locator('img[alt="CROM"]')).toBeVisible();
  10 |     await expect(page.locator('input[placeholder="Pesquisar na web..."]')).toBeVisible();
  11 |     await page.screenshot({ path: 'tests/screenshots/home-loaded.png', fullPage: true });
  12 |   });
  13 | 
  14 |   test('tema toggle funciona', async ({ page }) => {
  15 |     // Começa em dark
  16 |     await expect(page.locator('html')).toHaveClass(/dark/);
  17 |     await page.screenshot({ path: 'tests/screenshots/home-dark.png' });
  18 | 
  19 |     // Clica no toggle
  20 |     await page.click('button[title="Alternar tema"]');
  21 |     await expect(page.locator('html')).not.toHaveClass(/dark/);
  22 |     await page.screenshot({ path: 'tests/screenshots/home-light.png' });
  23 |   });
  24 | 
  25 |   test('pesquisa redireciona para /search', async ({ page }) => {
  26 |     await page.fill('input[placeholder="Pesquisar na web..."]', 'crom search');
  27 |     await page.keyboard.press('Enter');
  28 |     await page.waitForURL(/\/search\?q=crom/);
> 29 |     await expect(page).toHaveURL(/q=crom\+search/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  30 |   });
  31 | 
  32 |   test('autocomplete aparece ao digitar', async ({ page }) => {
  33 |     await page.fill('input[placeholder="Pesquisar na web..."]', 'motor');
  34 |     await page.waitForTimeout(300);
  35 |     const suggestions = page.locator('[class*="absolute"] button');
  36 |     await expect(suggestions.first()).toBeVisible();
  37 |     await page.screenshot({ path: 'tests/screenshots/home-autocomplete.png' });
  38 |   });
  39 | 
  40 |   test('botão limpar aparece e funciona', async ({ page }) => {
  41 |     const input = page.locator('input[placeholder="Pesquisar na web..."]');
  42 |     await input.fill('teste');
  43 |     const clearBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
  44 |     await expect(clearBtn).toBeVisible();
  45 |     await clearBtn.click();
  46 |     await expect(input).toHaveValue('');
  47 |   });
  48 | 
  49 |   test('links de navegação existem', async ({ page }) => {
  50 |     await expect(page.locator('a:has-text("Projetos")')).toBeVisible();
  51 |     await expect(page.locator('a:has-text("Sobre")')).toBeVisible();
  52 |     await expect(page.locator('a:has-text("Docs")')).toBeVisible();
  53 |     await expect(page.locator('a[title="Configurações"]')).toBeVisible();
  54 |   });
  55 | 
  56 |   test('footer de privacidade visível', async ({ page }) => {
  57 |     await expect(page.locator('text=Zero tracking')).toBeVisible();
  58 |     await expect(page.locator('a:has-text("Preferências")')).toBeVisible();
  59 |   });
  60 | });
  61 | 
```