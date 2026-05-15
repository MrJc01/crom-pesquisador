# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Configurações >> toggle de tema funciona
- Location: tests/settings.spec.ts:17:3

# Error details

```
Error: page.click: Element is not visible
Call log:
  - waiting for locator('input[value="light"]')
    - locator resolved to <input type="radio" name="theme" value="light" class="hidden peer"/>
  - attempting click action
    - scrolling into view if needed

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "CROM" [ref=e5] [cursor=pointer]:
      - /url: /
      - img "CROM" [ref=e6]
    - heading "Configurações" [level=1] [ref=e7]
    - link "Histórico" [ref=e8] [cursor=pointer]:
      - /url: /history
      - img [ref=e9]
      - text: Histórico
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - img [ref=e15]
        - heading "Aparência" [level=2] [ref=e21]
      - paragraph [ref=e22]: Personalize o visual.
      - generic [ref=e23]:
        - paragraph [ref=e25]: Tema
        - generic [ref=e26]:
          - generic [ref=e33] [cursor=pointer]: Claro
          - generic [ref=e40] [cursor=pointer]: Escuro
          - generic [ref=e44] [cursor=pointer]: Sistema
    - generic [ref=e45]:
      - generic [ref=e46]:
        - img [ref=e47]
        - heading "Privacidade" [level=2] [ref=e49]
      - paragraph [ref=e50]: Dados salvos localmente no navegador.
      - generic [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]:
            - paragraph [ref=e54]: Histórico local
            - paragraph [ref=e55]: Buscas recentes para sugestões.
          - checkbox [checked] [ref=e57]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - paragraph [ref=e61]: Autocompletar
            - paragraph [ref=e62]: Sugestões ao digitar.
          - checkbox [checked] [ref=e64]
        - generic [ref=e66]:
          - paragraph [ref=e68]: Limpar dados
          - button "Limpar tudo" [ref=e69]
    - generic [ref=e70]:
      - generic [ref=e71]:
        - img [ref=e72]
        - heading "Comportamento" [level=2] [ref=e75]
      - paragraph [ref=e76]: Controle o CROM.
      - generic [ref=e77]:
        - generic [ref=e78]:
          - paragraph [ref=e80]: Abrir em nova aba
          - checkbox [ref=e82]
        - generic [ref=e84]:
          - paragraph [ref=e86]: Resultados por página
          - combobox [ref=e87] [cursor=pointer]:
            - option "10" [selected]
            - option "20"
            - option "30"
            - option "50"
    - generic [ref=e88]:
      - generic [ref=e89]:
        - img [ref=e90]
        - heading "Região & Idioma" [level=2] [ref=e93]
      - paragraph [ref=e94]: Filtrar por região e idioma.
      - generic [ref=e95]:
        - generic [ref=e96]:
          - paragraph [ref=e98]: Idioma
          - combobox [ref=e99] [cursor=pointer]:
            - option "Português" [selected]
            - option "English"
            - option "Español"
            - option "Todos"
        - generic [ref=e100]:
          - paragraph [ref=e102]: Região
          - combobox [ref=e103] [cursor=pointer]:
            - option "Brasil" [selected]
            - option "Portugal"
            - option "EUA"
            - option "Global"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Configurações', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/settings');
  6   |   });
  7   | 
  8   |   test('página carrega com todas as seções', async ({ page }) => {
  9   |     await expect(page.locator('h1:has-text("Configurações")')).toBeVisible();
  10  |     await expect(page.locator('h2:has-text("Aparência")')).toBeVisible();
  11  |     await expect(page.locator('h2:has-text("Privacidade")')).toBeVisible();
  12  |     await expect(page.locator('h2:has-text("Comportamento")')).toBeVisible();
  13  |     await expect(page.locator('h2:has-text("Região")')).toBeVisible();
  14  |     await page.screenshot({ path: 'tests/screenshots/settings-loaded.png', fullPage: true });
  15  |   });
  16  | 
  17  |   test('toggle de tema funciona', async ({ page }) => {
> 18  |     await page.click('input[value="light"]', { force: true });
      |                ^ Error: page.click: Element is not visible
  19  |     await expect(page.locator('html')).not.toHaveClass(/dark/);
  20  |     await page.screenshot({ path: 'tests/screenshots/settings-light.png' });
  21  |     await page.click('input[value="dark"]', { force: true });
  22  |     await expect(page.locator('html')).toHaveClass(/dark/);
  23  |   });
  24  | 
  25  |   test('toggles de privacidade funcionam', async ({ page }) => {
  26  |     // Os toggles usam .toggle-input class
  27  |     const toggles = page.locator('.toggle-input');
  28  |     const count = await toggles.count();
  29  |     expect(count).toBeGreaterThanOrEqual(2);
  30  | 
  31  |     // Toggle the first one (history)
  32  |     const historyToggle = toggles.first();
  33  |     const wasChecked = await historyToggle.isChecked();
  34  |     await historyToggle.click({ force: true });
  35  |     if (wasChecked) {
  36  |       await expect(historyToggle).not.toBeChecked();
  37  |     } else {
  38  |       await expect(historyToggle).toBeChecked();
  39  |     }
  40  |   });
  41  | 
  42  |   test('selects de idioma e região funcionam', async ({ page }) => {
  43  |     const selects = page.locator('select');
  44  |     const count = await selects.count();
  45  |     expect(count).toBeGreaterThanOrEqual(3); // resultsPerPage + language + region
  46  |   });
  47  | 
  48  |   test('link para histórico existe e navega', async ({ page }) => {
  49  |     const historyLink = page.locator('a:has-text("Histórico")');
  50  |     await expect(historyLink).toBeVisible();
  51  |     await historyLink.click();
  52  |     await page.waitForURL('/history');
  53  |   });
  54  | 
  55  |   test('botão limpar dados existe', async ({ page }) => {
  56  |     await expect(page.locator('button:has-text("Limpar tudo")')).toBeVisible();
  57  |   });
  58  | });
  59  | 
  60  | test.describe('Histórico', () => {
  61  |   test('página carrega com estado vazio', async ({ page }) => {
  62  |     // Clear localStorage first
  63  |     await page.goto('/');
  64  |     await page.evaluate(() => localStorage.clear());
  65  |     await page.goto('/history');
  66  |     await expect(page.locator('h1:has-text("Histórico")')).toBeVisible();
  67  |     await expect(page.locator('text=Nenhuma pesquisa')).toBeVisible();
  68  |     await page.screenshot({ path: 'tests/screenshots/history-empty.png', fullPage: true });
  69  |   });
  70  | 
  71  |   test('pesquisa é registrada no histórico', async ({ page }) => {
  72  |     await page.goto('/');
  73  |     await page.fill('input', 'teste historico');
  74  |     await page.keyboard.press('Enter');
  75  |     await page.waitForURL(/search/);
  76  |     await page.waitForTimeout(1500);
  77  | 
  78  |     await page.goto('/history');
  79  |     await page.waitForTimeout(500);
  80  |     await expect(page.locator('text=teste historico')).toBeVisible();
  81  |     await page.screenshot({ path: 'tests/screenshots/history-with-entry.png', fullPage: true });
  82  |   });
  83  | 
  84  |   test('filtros por tab visíveis', async ({ page }) => {
  85  |     await page.goto('/history');
  86  |     await expect(page.locator('button:has-text("Todas")')).toBeVisible();
  87  |     await expect(page.locator('button:has-text("Imagens")')).toBeVisible();
  88  |   });
  89  | 
  90  |   test('busca no histórico funciona', async ({ page }) => {
  91  |     await page.goto('/history');
  92  |     const searchInput = page.locator('input[placeholder="Buscar no histórico..."]');
  93  |     await expect(searchInput).toBeVisible();
  94  |   });
  95  | 
  96  |   test('botão limpar tudo visível após ter entradas', async ({ page }) => {
  97  |     // Make a search first
  98  |     await page.goto('/');
  99  |     await page.fill('input', 'entry para limpar');
  100 |     await page.keyboard.press('Enter');
  101 |     await page.waitForURL(/search/);
  102 |     await page.waitForTimeout(1500);
  103 | 
  104 |     await page.goto('/history');
  105 |     await page.waitForTimeout(500);
  106 |     await expect(page.locator('button:has-text("Limpar tudo")')).toBeVisible();
  107 |     await page.screenshot({ path: 'tests/screenshots/history-clear-btn.png' });
  108 |   });
  109 | });
  110 | 
```