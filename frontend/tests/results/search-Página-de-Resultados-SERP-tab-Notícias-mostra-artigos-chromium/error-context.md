# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Página de Resultados (SERP) >> tab Notícias mostra artigos
- Location: tests/search.spec.ts:45:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=TechBR').or(locator('text=InfoMoney'))
Expected: visible
Error: strict mode violation: locator('text=TechBR').or(locator('text=InfoMoney')) resolved to 4 elements:
    1) <span class="text-xs font-semibold text-brand-500">TechBR</span> aka getByText('TechBR').first()
    2) <span class="text-xs font-semibold text-brand-500">InfoMoney</span> aka getByText('InfoMoney').first()
    3) <span class="text-xs font-semibold text-brand-500">TechBR</span> aka getByText('TechBR').nth(1)
    4) <span class="text-xs font-semibold text-brand-500">InfoMoney</span> aka getByText('InfoMoney').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=TechBR').or(locator('text=InfoMoney'))

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
      - button "Notícias" [active] [ref=e46]:
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
              - generic [ref=e64]: TechBR
              - generic [ref=e65]: · 2h atrás
            - heading "Novo motor de busca brasileiro promete privacidade total" [level=3] [ref=e66]
            - paragraph [ref=e67]: O projeto CROM lança versão beta do motor de busca focado em soberania digital...
          - article [ref=e68] [cursor=pointer]:
            - generic [ref=e69]:
              - generic [ref=e70]: InfoMoney
              - generic [ref=e71]: · 5h atrás
            - heading "Alternativas ao Google crescem 340% em 2026" [level=3] [ref=e72]
            - paragraph [ref=e73]: Buscadores como DuckDuckGo, Brave Search e CROM ganham adoção massiva...
          - article [ref=e74] [cursor=pointer]:
            - generic [ref=e75]:
              - generic [ref=e76]: Olhar Digital
              - generic [ref=e77]: · 1 dia atrás
            - 'heading "Open-source e privacidade: o futuro da busca" [level=3] [ref=e78]'
            - paragraph [ref=e79]: Análise das principais soluções open-source para busca descentralizada...
          - article [ref=e80] [cursor=pointer]:
            - generic [ref=e81]:
              - generic [ref=e82]: TechBR
              - generic [ref=e83]: · 2h atrás
            - heading "Novo motor de busca brasileiro promete privacidade total" [level=3] [ref=e84]
            - paragraph [ref=e85]: O projeto CROM lança versão beta do motor de busca focado em soberania digital...
          - article [ref=e86] [cursor=pointer]:
            - generic [ref=e87]:
              - generic [ref=e88]: InfoMoney
              - generic [ref=e89]: · 5h atrás
            - heading "Alternativas ao Google crescem 340% em 2026" [level=3] [ref=e90]
            - paragraph [ref=e91]: Buscadores como DuckDuckGo, Brave Search e CROM ganham adoção massiva...
          - article [ref=e92] [cursor=pointer]:
            - generic [ref=e93]:
              - generic [ref=e94]: Olhar Digital
              - generic [ref=e95]: · 1 dia atrás
            - 'heading "Open-source e privacidade: o futuro da busca" [level=3] [ref=e96]'
            - paragraph [ref=e97]: Análise das principais soluções open-source para busca descentralizada...
          - article [ref=e98] [cursor=pointer]:
            - generic [ref=e99]:
              - generic [ref=e100]: TechBR
              - generic [ref=e101]: · 2h atrás
            - heading "Novo motor de busca brasileiro promete privacidade total" [level=3] [ref=e102]
            - paragraph [ref=e103]: O projeto CROM lança versão beta do motor de busca focado em soberania digital...
          - article [ref=e104] [cursor=pointer]:
            - generic [ref=e105]:
              - generic [ref=e106]: InfoMoney
              - generic [ref=e107]: · 5h atrás
            - heading "Alternativas ao Google crescem 340% em 2026" [level=3] [ref=e108]
            - paragraph [ref=e109]: Buscadores como DuckDuckGo, Brave Search e CROM ganham adoção massiva...
          - article [ref=e110] [cursor=pointer]:
            - generic [ref=e111]:
              - generic [ref=e112]: Olhar Digital
              - generic [ref=e113]: · 1 dia atrás
            - 'heading "Open-source e privacidade: o futuro da busca" [level=3] [ref=e114]'
            - paragraph [ref=e115]: Análise das principais soluções open-source para busca descentralizada...
        - generic [ref=e117]:
          - heading "Pesquisas relacionadas" [level=2] [ref=e118]
          - generic [ref=e119]:
            - link "motor de busca privado" [ref=e120] [cursor=pointer]:
              - /url: /search?q=motor%20de%20busca%20privado
              - img [ref=e121]
              - text: motor de busca privado
            - link "alternativas ao google" [ref=e124] [cursor=pointer]:
              - /url: /search?q=alternativas%20ao%20google
              - img [ref=e125]
              - text: alternativas ao google
            - link "busca descentralizada" [ref=e128] [cursor=pointer]:
              - /url: /search?q=busca%20descentralizada
              - img [ref=e129]
              - text: busca descentralizada
            - link "privacidade na internet" [ref=e132] [cursor=pointer]:
              - /url: /search?q=privacidade%20na%20internet
              - img [ref=e133]
              - text: privacidade na internet
            - link "DuckDuckGo vs Brave" [ref=e136] [cursor=pointer]:
              - /url: /search?q=DuckDuckGo%20vs%20Brave
              - img [ref=e137]
              - text: DuckDuckGo vs Brave
            - link "como indexar a web" [ref=e140] [cursor=pointer]:
              - /url: /search?q=como%20indexar%20a%20web
              - img [ref=e141]
              - text: como indexar a web
      - complementary [ref=e144]:
        - generic [ref=e145]:
          - img [ref=e147]
          - generic [ref=e150]:
            - heading "CROM Search" [level=2] [ref=e151]
            - paragraph [ref=e152]: Motor de Busca · Software Livre
            - paragraph [ref=e153]: Motor de busca soberano focado em privacidade e descentralização. Qualquer pessoa pode hospedar sua instância.
            - generic [ref=e154]:
              - generic [ref=e155]:
                - generic [ref=e156]: Licença
                - generic [ref=e157]: MIT
              - generic [ref=e158]:
                - generic [ref=e159]: Linguagem
                - generic [ref=e160]: Go, TypeScript
              - generic [ref=e161]:
                - generic [ref=e162]: Website
                - link "crom.me" [ref=e163] [cursor=pointer]:
                  - /url: "#"
              - generic [ref=e164]:
                - generic [ref=e165]: Repositório
                - link "GitHub" [ref=e166] [cursor=pointer]:
                  - /url: "#"
  - contentinfo [ref=e167]:
    - navigation [ref=e168]:
      - link "Termos" [ref=e169] [cursor=pointer]:
        - /url: "#"
      - link "Privacidade" [ref=e170] [cursor=pointer]:
        - /url: "#"
      - link "Contato" [ref=e171] [cursor=pointer]:
        - /url: "#"
      - link "Preferências" [ref=e172] [cursor=pointer]:
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
> 48 |     await expect(page.locator('text=TechBR').or(page.locator('text=InfoMoney'))).toBeVisible();
     |                                                                                  ^ Error: expect(locator).toBeVisible() failed
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