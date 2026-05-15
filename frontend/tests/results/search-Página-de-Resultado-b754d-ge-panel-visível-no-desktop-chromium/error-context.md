# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Página de Resultados (SERP) >> knowledge panel visível no desktop
- Location: tests/search.spec.ts:24:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=CROM Search')
Expected: visible
Error: strict mode violation: locator('text=CROM Search') resolved to 2 elements:
    1) <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">Repositório oficial do CROM Search Engine. Sem ra…</p> aka getByText('Repositório oficial do CROM')
    2) <h2 class="text-xl font-bold mb-0.5">CROM Search</h2> aka getByRole('heading', { name: 'CROM Search' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=CROM Search')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "CROM" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "CROM" [ref=e7]
      - generic [ref=e10]:
        - img [ref=e11]
        - textbox "Pesquisar na web..." [ref=e14]: crom
        - button [ref=e15]:
          - img [ref=e16]
      - generic [ref=e20]:
        - link "Configurações" [ref=e21] [cursor=pointer]:
          - /url: /settings
          - img [ref=e22]
          - text: Configurações
        - button "Alternar tema" [ref=e25]:
          - img [ref=e26]
    - navigation [ref=e28]:
      - button "Chat IA" [ref=e29]:
        - img [ref=e30]
        - text: Chat IA
      - button "Todos" [ref=e33]:
        - img [ref=e34]
        - text: Todos
      - button "Imagens" [ref=e37]:
        - img [ref=e38]
        - text: Imagens
      - button "Vídeos" [ref=e42]:
        - img [ref=e43]
        - text: Vídeos
      - button "Notícias" [ref=e46]:
        - img [ref=e47]
        - text: Notícias
      - button "Código" [ref=e50]:
        - img [ref=e51]
        - text: Código
  - main [ref=e55]:
    - generic [ref=e56]:
      - generic [ref=e57]:
        - paragraph [ref=e58]:
          - text: Aproximadamente
          - strong [ref=e59]: 1,240
          - text: resultados em
          - strong [ref=e60]: 0.04s
        - generic [ref=e61]:
          - article [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]:
                - generic [ref=e65]: D
                - generic [ref=e66]:
                  - paragraph [ref=e67]: Documentação CROM
                  - paragraph [ref=e68]: crom.me › docs › introdução
              - link "Introdução ao Motor de Busca CROM — Documentação Oficial" [ref=e69] [cursor=pointer]:
                - /url: https://crom.me
              - paragraph [ref=e70]: O CROM é um motor de busca soberano, construído com foco em privacidade e descentralização.
              - generic [ref=e71]:
                - link "Instalação" [ref=e72] [cursor=pointer]:
                  - /url: "#"
                - link "API Reference" [ref=e73] [cursor=pointer]:
                  - /url: "#"
                - link "Contribuir" [ref=e74] [cursor=pointer]:
                  - /url: "#"
            - link "Ver detalhes do link" [ref=e75] [cursor=pointer]:
              - /url: /link/1-0
              - img [ref=e76]
          - article [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e80]:
                - generic [ref=e81]: G
                - generic [ref=e82]:
                  - paragraph [ref=e83]: GitHub
                  - paragraph [ref=e84]: github.com › crom-project › crom-search
              - 'link "crom-project/crom-search: Motor de busca descentralizado" [ref=e85] [cursor=pointer]':
                - /url: https://github.com
              - paragraph [ref=e86]: "Repositório oficial do CROM Search Engine. Sem rastreadores, sem anúncios. Stars: 2.4k · Forks: 342"
            - link "Ver detalhes do link" [ref=e87] [cursor=pointer]:
              - /url: /link/1-1
              - img [ref=e88]
          - article [ref=e90]:
            - generic [ref=e91]:
              - generic [ref=e92]:
                - generic [ref=e93]: W
                - generic [ref=e94]:
                  - paragraph [ref=e95]: Wikipedia
                  - paragraph [ref=e96]: pt.wikipedia.org › wiki › Motor_de_busca
              - link "Motor de busca — Wikipédia, a enciclopédia livre" [ref=e97] [cursor=pointer]:
                - /url: https://pt.wikipedia.org
              - paragraph [ref=e98]: Um motor de busca é um sistema de software projetado para realizar pesquisas na World Wide Web...
            - link "Ver detalhes do link" [ref=e99] [cursor=pointer]:
              - /url: /link/1-2
              - img [ref=e100]
          - article [ref=e102]:
            - generic [ref=e103]:
              - generic [ref=e104]:
                - generic [ref=e105]: D
                - generic [ref=e106]:
                  - paragraph [ref=e107]: Dev.to
                  - paragraph [ref=e108]: dev.to › crom › construindo-motor-busca
              - link "Construindo um motor de busca do zero com Go e Elasticsearch" [ref=e109] [cursor=pointer]:
                - /url: https://dev.to
              - paragraph [ref=e110]: Neste artigo, exploramos como construir um motor de busca completo com Go e Elasticsearch...
            - link "Ver detalhes do link" [ref=e111] [cursor=pointer]:
              - /url: /link/1-3
              - img [ref=e112]
          - article [ref=e114]:
            - generic [ref=e115]:
              - generic [ref=e116]:
                - generic [ref=e117]: C
                - generic [ref=e118]:
                  - paragraph [ref=e119]: CROM Blog
                  - paragraph [ref=e120]: blog.crom.me › privacidade-digital
              - 'link "Por que a soberania digital importa: o manifesto CROM" [ref=e121] [cursor=pointer]':
                - /url: https://blog.crom.me
              - paragraph [ref=e122]: A soberania digital é o direito de cada indivíduo controlar seus próprios dados...
            - link "Ver detalhes do link" [ref=e123] [cursor=pointer]:
              - /url: /link/1-4
              - img [ref=e124]
        - generic [ref=e127]:
          - heading "Pesquisas relacionadas" [level=2] [ref=e128]
          - generic [ref=e129]:
            - link "motor de busca privado" [ref=e130] [cursor=pointer]:
              - /url: /search?q=motor%20de%20busca%20privado
              - img [ref=e131]
              - text: motor de busca privado
            - link "alternativas ao google" [ref=e134] [cursor=pointer]:
              - /url: /search?q=alternativas%20ao%20google
              - img [ref=e135]
              - text: alternativas ao google
            - link "busca descentralizada" [ref=e138] [cursor=pointer]:
              - /url: /search?q=busca%20descentralizada
              - img [ref=e139]
              - text: busca descentralizada
            - link "privacidade na internet" [ref=e142] [cursor=pointer]:
              - /url: /search?q=privacidade%20na%20internet
              - img [ref=e143]
              - text: privacidade na internet
            - link "DuckDuckGo vs Brave" [ref=e146] [cursor=pointer]:
              - /url: /search?q=DuckDuckGo%20vs%20Brave
              - img [ref=e147]
              - text: DuckDuckGo vs Brave
            - link "como indexar a web" [ref=e150] [cursor=pointer]:
              - /url: /search?q=como%20indexar%20a%20web
              - img [ref=e151]
              - text: como indexar a web
      - complementary [ref=e154]:
        - generic [ref=e155]:
          - img [ref=e157]
          - generic [ref=e160]:
            - heading "CROM Search" [level=2] [ref=e161]
            - paragraph [ref=e162]: Motor de Busca · Software Livre
            - paragraph [ref=e163]: Motor de busca soberano focado em privacidade e descentralização. Qualquer pessoa pode hospedar sua instância.
            - generic [ref=e164]:
              - generic [ref=e165]:
                - generic [ref=e166]: Licença
                - generic [ref=e167]: MIT
              - generic [ref=e168]:
                - generic [ref=e169]: Linguagem
                - generic [ref=e170]: Go, TypeScript
              - generic [ref=e171]:
                - generic [ref=e172]: Website
                - link "crom.me" [ref=e173] [cursor=pointer]:
                  - /url: "#"
              - generic [ref=e174]:
                - generic [ref=e175]: Repositório
                - link "GitHub" [ref=e176] [cursor=pointer]:
                  - /url: "#"
  - contentinfo [ref=e177]:
    - navigation [ref=e178]:
      - link "Termos" [ref=e179] [cursor=pointer]:
        - /url: "#"
      - link "Privacidade" [ref=e180] [cursor=pointer]:
        - /url: "#"
      - link "Contato" [ref=e181] [cursor=pointer]:
        - /url: "#"
      - link "Preferências" [ref=e182] [cursor=pointer]:
        - /url: /settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Página de Resultados (SERP)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/search?q=crom');
  6  |     await page.waitForTimeout(1000); // mock API delay
  7  |   });
  8  | 
  9  |   test('header com logo, search e tabs carregam', async ({ page }) => {
  10 |     await expect(page.locator('img[alt="CROM"]')).toBeVisible();
  11 |     await expect(page.locator('input')).toHaveValue('crom');
  12 |     await expect(page.locator('button:has-text("Todos")')).toBeVisible();
  13 |     await expect(page.locator('button:has-text("Chat IA")')).toBeVisible();
  14 |     await page.screenshot({ path: 'tests/screenshots/serp-loaded.png', fullPage: true });
  15 |   });
  16 | 
  17 |   test('resultados aparecem com cards', async ({ page }) => {
  18 |     const cards = page.locator('.result-line');
  19 |     await expect(cards.first()).toBeVisible();
  20 |     const count = await cards.count();
  21 |     expect(count).toBeGreaterThanOrEqual(3);
  22 |   });
  23 | 
  24 |   test('knowledge panel visível no desktop', async ({ page }) => {
> 25 |     await expect(page.locator('text=CROM Search')).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  26 |     await expect(page.locator('text=Motor de Busca')).toBeVisible();
  27 |     await page.screenshot({ path: 'tests/screenshots/serp-knowledge-panel.png' });
  28 |   });
  29 | 
  30 |   test('tab Imagens mostra grid', async ({ page }) => {
  31 |     await page.click('button:has-text("Imagens")');
  32 |     await page.waitForTimeout(200);
  33 |     const images = page.locator('img[loading="lazy"]');
  34 |     await expect(images.first()).toBeVisible();
  35 |     await page.screenshot({ path: 'tests/screenshots/serp-images.png' });
  36 |   });
  37 | 
  38 |   test('tab Vídeos mostra cards de vídeo', async ({ page }) => {
  39 |     await page.click('button:has-text("Vídeos")');
  40 |     await page.waitForTimeout(200);
  41 |     await expect(page.locator('text=CROM Official').or(page.locator('text=Tech Talks'))).toBeVisible();
  42 |     await page.screenshot({ path: 'tests/screenshots/serp-videos.png' });
  43 |   });
  44 | 
  45 |   test('tab Notícias mostra artigos', async ({ page }) => {
  46 |     await page.click('button:has-text("Notícias")');
  47 |     await page.waitForTimeout(200);
  48 |     await expect(page.locator('text=TechBR').or(page.locator('text=InfoMoney'))).toBeVisible();
  49 |     await page.screenshot({ path: 'tests/screenshots/serp-news.png' });
  50 |   });
  51 | 
  52 |   test('tab Código mostra snippets', async ({ page }) => {
  53 |     await page.click('button:has-text("Código")');
  54 |     await page.waitForTimeout(200);
  55 |     await expect(page.locator('text=crawler.go').or(page.locator('text=inverted.go'))).toBeVisible();
  56 |     await page.screenshot({ path: 'tests/screenshots/serp-code.png' });
  57 |   });
  58 | 
  59 |   test('Chat IA abre e recebe mensagens', async ({ page }) => {
  60 |     await page.click('button:has-text("Chat IA")');
  61 |     await page.waitForTimeout(300);
  62 |     await expect(page.locator('text=CROM IA')).toBeVisible();
  63 |     await expect(page.locator('text=assistente IA')).toBeVisible();
  64 | 
  65 |     // Envia mensagem
  66 |     await page.fill('input[placeholder="Pergunte algo..."]', 'O que é o CROM?');
  67 |     await page.click('button[type="submit"]:last-of-type');
  68 |     await page.waitForTimeout(2500); // espera resposta mock
  69 | 
  70 |     const messages = page.locator('[class*="rounded-xl"][class*="p-3"]');
  71 |     const count = await messages.count();
  72 |     expect(count).toBeGreaterThanOrEqual(3); // welcome + user + response
  73 |     await page.screenshot({ path: 'tests/screenshots/serp-chat.png' });
  74 |   });
  75 | 
  76 |   test('pesquisas relacionadas visíveis', async ({ page }) => {
  77 |     await expect(page.locator('text=Pesquisas relacionadas')).toBeVisible();
  78 |     await expect(page.locator('a:has-text("motor de busca privado")')).toBeVisible();
  79 |   });
  80 | 
  81 |   test('infinite scroll carrega mais resultados', async ({ page }) => {
  82 |     const initialCount = await page.locator('.result-line').count();
  83 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  84 |     await page.waitForTimeout(1500);
  85 |     const newCount = await page.locator('.result-line').count();
  86 |     expect(newCount).toBeGreaterThanOrEqual(initialCount);
  87 |     await page.screenshot({ path: 'tests/screenshots/serp-infinite-scroll.png', fullPage: true });
  88 |   });
  89 | 
  90 |   test('logo volta para home', async ({ page }) => {
  91 |     await page.click('img[alt="CROM"]');
  92 |     await page.waitForURL('/');
  93 |     await expect(page).toHaveURL('/');
  94 |   });
  95 | });
  96 | 
```