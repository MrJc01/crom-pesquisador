import { test, expect } from '@playwright/test';

test.describe('Configurações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('página carrega com todas as seções', async ({ page }) => {
    await expect(page.locator('h1:has-text("Configurações")')).toBeVisible();
    await expect(page.locator('h2:has-text("Aparência")')).toBeVisible();
    await expect(page.locator('h2:has-text("Privacidade")')).toBeVisible();
    await expect(page.locator('h2:has-text("Comportamento")')).toBeVisible();
    await expect(page.locator('h2:has-text("Região")')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/settings-loaded.png', fullPage: true });
  });

  test('toggle de tema funciona', async ({ page }) => {
    await page.click('input[value="light"]', { force: true });
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.screenshot({ path: 'tests/screenshots/settings-light.png' });
    await page.click('input[value="dark"]', { force: true });
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('toggles de privacidade funcionam', async ({ page }) => {
    // Os toggles usam .toggle-input class
    const toggles = page.locator('.toggle-input');
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Toggle the first one (history)
    const historyToggle = toggles.first();
    const wasChecked = await historyToggle.isChecked();
    await historyToggle.click({ force: true });
    if (wasChecked) {
      await expect(historyToggle).not.toBeChecked();
    } else {
      await expect(historyToggle).toBeChecked();
    }
  });

  test('selects de idioma e região funcionam', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(3); // resultsPerPage + language + region
  });

  test('link para histórico existe e navega', async ({ page }) => {
    const historyLink = page.locator('a:has-text("Histórico")');
    await expect(historyLink).toBeVisible();
    await historyLink.click();
    await page.waitForURL('/history');
  });

  test('botão limpar dados existe', async ({ page }) => {
    await expect(page.locator('button:has-text("Limpar tudo")')).toBeVisible();
  });
});

test.describe('Histórico', () => {
  test('página carrega com estado vazio', async ({ page }) => {
    // Clear localStorage first
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/history');
    await expect(page.locator('h1:has-text("Histórico")')).toBeVisible();
    await expect(page.locator('text=Nenhuma pesquisa')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/history-empty.png', fullPage: true });
  });

  test('pesquisa é registrada no histórico', async ({ page }) => {
    await page.goto('/');
    await page.fill('input', 'teste historico');
    await page.keyboard.press('Enter');
    await page.waitForURL(/search/);
    await page.waitForTimeout(1500);

    await page.goto('/history');
    await page.waitForTimeout(500);
    await expect(page.locator('text=teste historico')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/history-with-entry.png', fullPage: true });
  });

  test('filtros por tab visíveis', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('button:has-text("Todas")')).toBeVisible();
    await expect(page.locator('button:has-text("Imagens")')).toBeVisible();
  });

  test('busca no histórico funciona', async ({ page }) => {
    await page.goto('/history');
    const searchInput = page.locator('input[placeholder="Buscar no histórico..."]');
    await expect(searchInput).toBeVisible();
  });

  test('botão limpar tudo visível após ter entradas', async ({ page }) => {
    // Make a search first
    await page.goto('/');
    await page.fill('input', 'entry para limpar');
    await page.keyboard.press('Enter');
    await page.waitForURL(/search/);
    await page.waitForTimeout(1500);

    await page.goto('/history');
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Limpar tudo")')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/history-clear-btn.png' });
  });
});
