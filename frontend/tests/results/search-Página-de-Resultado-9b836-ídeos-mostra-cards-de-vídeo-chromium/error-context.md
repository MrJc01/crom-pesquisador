# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Página de Resultados (SERP) >> tab Vídeos mostra cards de vídeo
- Location: tests/search.spec.ts:38:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=CROM Official').or(locator('text=Tech Talks'))
Expected: visible
Error: strict mode violation: locator('text=CROM Official').or(locator('text=Tech Talks')) resolved to 4 elements:
    1) <p class="text-xs text-slate-400 mt-1">CROM Official</p> aka getByText('CROM Official').first()
    2) <p class="text-xs text-slate-400 mt-1">Tech Talks BR</p> aka getByText('Tech Talks BR').first()
    3) <p class="text-xs text-slate-400 mt-1">CROM Official</p> aka getByText('CROM Official').nth(1)
    4) <p class="text-xs text-slate-400 mt-1">Tech Talks BR</p> aka getByText('Tech Talks BR').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=CROM Official').or(locator('text=Tech Talks'))

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
      - button "Vídeos" [active] [ref=e42]:
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
          - article [ref=e62] [cursor=pointer]:
            - generic [ref=e63]:
              - img "Como funciona o CROM Search Engine" [ref=e64]
              - generic [ref=e65]: 15:42
            - generic [ref=e66]:
              - heading "Como funciona o CROM Search Engine" [level=3] [ref=e67]
              - paragraph [ref=e68]: CROM Official
              - paragraph [ref=e69]: 12K visualizações
          - article [ref=e70] [cursor=pointer]:
            - generic [ref=e71]:
              - img "Privacidade na internet - Por que importa" [ref=e72]
              - generic [ref=e73]: 22:10
            - generic [ref=e74]:
              - heading "Privacidade na internet - Por que importa" [level=3] [ref=e75]
              - paragraph [ref=e76]: Tech Talks BR
              - paragraph [ref=e77]: 45K visualizações
          - article [ref=e78] [cursor=pointer]:
            - generic [ref=e79]:
              - img "Construindo um crawler em Go" [ref=e80]
              - generic [ref=e81]: 31:05
            - generic [ref=e82]:
              - heading "Construindo um crawler em Go" [level=3] [ref=e83]
              - paragraph [ref=e84]: GoDev Brasil
              - paragraph [ref=e85]: 8.2K visualizações
          - article [ref=e86] [cursor=pointer]:
            - generic [ref=e87]:
              - img "Como funciona o CROM Search Engine" [ref=e88]
              - generic [ref=e89]: 15:42
            - generic [ref=e90]:
              - heading "Como funciona o CROM Search Engine" [level=3] [ref=e91]
              - paragraph [ref=e92]: CROM Official
              - paragraph [ref=e93]: 12K visualizações
          - article [ref=e94] [cursor=pointer]:
            - generic [ref=e95]:
              - img "Privacidade na internet - Por que importa" [ref=e96]
              - generic [ref=e97]: 22:10
            - generic [ref=e98]:
              - heading "Privacidade na internet - Por que importa" [level=3] [ref=e99]
              - paragraph [ref=e100]: Tech Talks BR
              - paragraph [ref=e101]: 45K visualizações
          - article [ref=e102] [cursor=pointer]:
            - generic [ref=e103]:
              - img "Construindo um crawler em Go" [ref=e104]
              - generic [ref=e105]: 31:05
            - generic [ref=e106]:
              - heading "Construindo um crawler em Go" [level=3] [ref=e107]
              - paragraph [ref=e108]: GoDev Brasil
              - paragraph [ref=e109]: 8.2K visualizações
        - generic [ref=e111]:
          - heading "Pesquisas relacionadas" [level=2] [ref=e112]
          - generic [ref=e113]:
            - link "motor de busca privado" [ref=e114] [cursor=pointer]:
              - /url: /search?q=motor%20de%20busca%20privado
              - img [ref=e115]
              - text: motor de busca privado
            - link "alternativas ao google" [ref=e118] [cursor=pointer]:
              - /url: /search?q=alternativas%20ao%20google
              - img [ref=e119]
              - text: alternativas ao google
            - link "busca descentralizada" [ref=e122] [cursor=pointer]:
              - /url: /search?q=busca%20descentralizada
              - img [ref=e123]
              - text: busca descentralizada
            - link "privacidade na internet" [ref=e126] [cursor=pointer]:
              - /url: /search?q=privacidade%20na%20internet
              - img [ref=e127]
              - text: privacidade na internet
            - link "DuckDuckGo vs Brave" [ref=e130] [cursor=pointer]:
              - /url: /search?q=DuckDuckGo%20vs%20Brave
              - img [ref=e131]
              - text: DuckDuckGo vs Brave
            - link "como indexar a web" [ref=e134] [cursor=pointer]:
              - /url: /search?q=como%20indexar%20a%20web
              - img [ref=e135]
              - text: como indexar a web
      - complementary [ref=e138]:
        - generic [ref=e139]:
          - img [ref=e141]
          - generic [ref=e144]:
            - heading "CROM Search" [level=2] [ref=e145]
            - paragraph [ref=e146]: Motor de Busca · Software Livre
            - paragraph [ref=e147]: Motor de busca soberano focado em privacidade e descentralização. Qualquer pessoa pode hospedar sua instância.
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]: Licença
                - generic [ref=e151]: MIT
              - generic [ref=e152]:
                - generic [ref=e153]: Linguagem
                - generic [ref=e154]: Go, TypeScript
              - generic [ref=e155]:
                - generic [ref=e156]: Website
                - link "crom.me" [ref=e157] [cursor=pointer]:
                  - /url: "#"
              - generic [ref=e158]:
                - generic [ref=e159]: Repositório
                - link "GitHub" [ref=e160] [cursor=pointer]:
                  - /url: "#"
  - contentinfo [ref=e161]:
    - navigation [ref=e162]:
      - link "Termos" [ref=e163] [cursor=pointer]:
        - /url: "#"
      - link "Privacidade" [ref=e164] [cursor=pointer]:
        - /url: "#"
      - link "Contato" [ref=e165] [cursor=pointer]:
        - /url: "#"
      - link "Preferências" [ref=e166] [cursor=pointer]:
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
> 41 |     await expect(page.locator('text=CROM Official').or(page.locator('text=Tech Talks'))).toBeVisible();
     |                                                                                          ^ Error: expect(locator).toBeVisible() failed
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