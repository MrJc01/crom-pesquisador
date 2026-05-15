# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Página de Resultados (SERP) >> tab Código mostra snippets
- Location: tests/search.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=crawler.go').or(locator('text=inverted.go'))
Expected: visible
Error: strict mode violation: locator('text=crawler.go').or(locator('text=inverted.go')) resolved to 4 elements:
    1) <div class="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">internal/crawler/crawler.go</div> aka getByText('internal/crawler/crawler.go').first()
    2) <div class="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">pkg/index/inverted.go</div> aka getByText('pkg/index/inverted.go').first()
    3) <div class="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">internal/crawler/crawler.go</div> aka getByText('internal/crawler/crawler.go').nth(1)
    4) <div class="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">pkg/index/inverted.go</div> aka getByText('pkg/index/inverted.go').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=crawler.go').or(locator('text=inverted.go'))

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
      - button "Código" [active] [ref=e50]:
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
              - generic [ref=e64]: crom-project/crom-search
              - generic [ref=e65]: Go
            - generic [ref=e66]: internal/crawler/crawler.go
            - code [ref=e68]: "func (c *Crawler) Fetch(url string) (*Page, error) { resp, err := c.client.Get(url) if err != nil { return nil, err } defer resp.Body.Close() return c.parse(resp.Body) }"
          - article [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]: crom-project/crom-index
              - generic [ref=e72]: Go
            - generic [ref=e73]: pkg/index/inverted.go
            - code [ref=e75]: "func (idx *InvertedIndex) Add(docID uint64, tokens []string) { for _, token := range tokens { idx.postings[token] = append(idx.postings[token], docID) } }"
          - article [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: crom-project/crom-search
              - generic [ref=e79]: Go
            - generic [ref=e80]: internal/crawler/crawler.go
            - code [ref=e82]: "func (c *Crawler) Fetch(url string) (*Page, error) { resp, err := c.client.Get(url) if err != nil { return nil, err } defer resp.Body.Close() return c.parse(resp.Body) }"
          - article [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e85]: crom-project/crom-index
              - generic [ref=e86]: Go
            - generic [ref=e87]: pkg/index/inverted.go
            - code [ref=e89]: "func (idx *InvertedIndex) Add(docID uint64, tokens []string) { for _, token := range tokens { idx.postings[token] = append(idx.postings[token], docID) } }"
        - generic [ref=e91]:
          - heading "Pesquisas relacionadas" [level=2] [ref=e92]
          - generic [ref=e93]:
            - link "motor de busca privado" [ref=e94] [cursor=pointer]:
              - /url: /search?q=motor%20de%20busca%20privado
              - img [ref=e95]
              - text: motor de busca privado
            - link "alternativas ao google" [ref=e98] [cursor=pointer]:
              - /url: /search?q=alternativas%20ao%20google
              - img [ref=e99]
              - text: alternativas ao google
            - link "busca descentralizada" [ref=e102] [cursor=pointer]:
              - /url: /search?q=busca%20descentralizada
              - img [ref=e103]
              - text: busca descentralizada
            - link "privacidade na internet" [ref=e106] [cursor=pointer]:
              - /url: /search?q=privacidade%20na%20internet
              - img [ref=e107]
              - text: privacidade na internet
            - link "DuckDuckGo vs Brave" [ref=e110] [cursor=pointer]:
              - /url: /search?q=DuckDuckGo%20vs%20Brave
              - img [ref=e111]
              - text: DuckDuckGo vs Brave
            - link "como indexar a web" [ref=e114] [cursor=pointer]:
              - /url: /search?q=como%20indexar%20a%20web
              - img [ref=e115]
              - text: como indexar a web
      - complementary [ref=e118]:
        - generic [ref=e119]:
          - img [ref=e121]
          - generic [ref=e124]:
            - heading "CROM Search" [level=2] [ref=e125]
            - paragraph [ref=e126]: Motor de Busca · Software Livre
            - paragraph [ref=e127]: Motor de busca soberano focado em privacidade e descentralização. Qualquer pessoa pode hospedar sua instância.
            - generic [ref=e128]:
              - generic [ref=e129]:
                - generic [ref=e130]: Licença
                - generic [ref=e131]: MIT
              - generic [ref=e132]:
                - generic [ref=e133]: Linguagem
                - generic [ref=e134]: Go, TypeScript
              - generic [ref=e135]:
                - generic [ref=e136]: Website
                - link "crom.me" [ref=e137] [cursor=pointer]:
                  - /url: "#"
              - generic [ref=e138]:
                - generic [ref=e139]: Repositório
                - link "GitHub" [ref=e140] [cursor=pointer]:
                  - /url: "#"
  - contentinfo [ref=e141]:
    - navigation [ref=e142]:
      - link "Termos" [ref=e143] [cursor=pointer]:
        - /url: "#"
      - link "Privacidade" [ref=e144] [cursor=pointer]:
        - /url: "#"
      - link "Contato" [ref=e145] [cursor=pointer]:
        - /url: "#"
      - link "Preferências" [ref=e146] [cursor=pointer]:
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
  25 |     await expect(page.locator('text=CROM Search')).toBeVisible();
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
> 55 |     await expect(page.locator('text=crawler.go').or(page.locator('text=inverted.go'))).toBeVisible();
     |                                                                                        ^ Error: expect(locator).toBeVisible() failed
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