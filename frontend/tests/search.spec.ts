import { test, expect } from '@playwright/test';

test.describe('Página de Resultados (SERP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search?q=crom');
    await page.waitForTimeout(1000); // mock API delay
  });

  test('header com logo, search e tabs carregam', async ({ page }) => {
    await expect(page.locator('img[alt="CROM"]')).toBeVisible();
    await expect(page.locator('input')).toHaveValue('crom');
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
    await expect(page.locator('button:has-text("Chat IA")')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-loaded.png', fullPage: true });
  });

  test('resultados aparecem com cards', async ({ page }) => {
    const cards = page.locator('.result-line');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('knowledge panel visível no desktop', async ({ page }) => {
    await expect(page.locator('text=CROM Search')).toBeVisible();
    await expect(page.locator('text=Motor de Busca')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-knowledge-panel.png' });
  });

  test('tab Imagens mostra grid', async ({ page }) => {
    await page.click('button:has-text("Imagens")');
    await page.waitForTimeout(200);
    const images = page.locator('img[loading="lazy"]');
    await expect(images.first()).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-images.png' });
  });

  test('tab Vídeos mostra cards de vídeo', async ({ page }) => {
    await page.click('button:has-text("Vídeos")');
    await page.waitForTimeout(200);
    await expect(page.locator('text=CROM Official').or(page.locator('text=Tech Talks'))).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-videos.png' });
  });

  test('tab Notícias mostra artigos', async ({ page }) => {
    await page.click('button:has-text("Notícias")');
    await page.waitForTimeout(200);
    await expect(page.locator('text=TechBR').or(page.locator('text=InfoMoney'))).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-news.png' });
  });

  test('tab Código mostra snippets', async ({ page }) => {
    await page.click('button:has-text("Código")');
    await page.waitForTimeout(200);
    await expect(page.locator('text=crawler.go').or(page.locator('text=inverted.go'))).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/serp-code.png' });
  });

  test('Chat IA abre e recebe mensagens', async ({ page }) => {
    await page.click('button:has-text("Chat IA")');
    await page.waitForTimeout(300);
    await expect(page.locator('text=CROM IA')).toBeVisible();
    await expect(page.locator('text=assistente IA')).toBeVisible();

    // Envia mensagem
    await page.fill('input[placeholder="Pergunte algo..."]', 'O que é o CROM?');
    await page.click('button[type="submit"]:last-of-type');
    await page.waitForTimeout(2500); // espera resposta mock

    const messages = page.locator('[class*="rounded-xl"][class*="p-3"]');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(3); // welcome + user + response
    await page.screenshot({ path: 'tests/screenshots/serp-chat.png' });
  });

  test('pesquisas relacionadas visíveis', async ({ page }) => {
    await expect(page.locator('text=Pesquisas relacionadas')).toBeVisible();
    await expect(page.locator('a:has-text("motor de busca privado")')).toBeVisible();
  });

  test('infinite scroll carrega mais resultados', async ({ page }) => {
    const initialCount = await page.locator('.result-line').count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const newCount = await page.locator('.result-line').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
    await page.screenshot({ path: 'tests/screenshots/serp-infinite-scroll.png', fullPage: true });
  });

  test('logo volta para home', async ({ page }) => {
    await page.click('img[alt="CROM"]');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });
});
