import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('carrega com logo e barra de pesquisa', async ({ page }) => {
    await expect(page.locator('img[alt="CROM"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Pesquisar na web..."]')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/home-loaded.png', fullPage: true });
  });

  test('tema toggle funciona', async ({ page }) => {
    // Começa em dark
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({ path: 'tests/screenshots/home-dark.png' });

    // Clica no toggle
    await page.click('button[title="Alternar tema"]');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.screenshot({ path: 'tests/screenshots/home-light.png' });
  });

  test('pesquisa redireciona para /search', async ({ page }) => {
    await page.fill('input[placeholder="Pesquisar na web..."]', 'crom search');
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/search\?q=crom/);
    await expect(page).toHaveURL(/q=crom\+search/);
  });

  test('autocomplete aparece ao digitar', async ({ page }) => {
    await page.fill('input[placeholder="Pesquisar na web..."]', 'motor');
    await page.waitForTimeout(300);
    const suggestions = page.locator('[class*="absolute"] button');
    await expect(suggestions.first()).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/home-autocomplete.png' });
  });

  test('botão limpar aparece e funciona', async ({ page }) => {
    const input = page.locator('input[placeholder="Pesquisar na web..."]');
    await input.fill('teste');
    const clearBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(input).toHaveValue('');
  });

  test('links de navegação existem', async ({ page }) => {
    await expect(page.locator('a:has-text("Projetos")')).toBeVisible();
    await expect(page.locator('a:has-text("Sobre")')).toBeVisible();
    await expect(page.locator('a:has-text("Docs")')).toBeVisible();
    await expect(page.locator('a[title="Configurações"]')).toBeVisible();
  });

  test('footer de privacidade visível', async ({ page }) => {
    await expect(page.locator('text=Zero tracking')).toBeVisible();
    await expect(page.locator('a:has-text("Preferências")')).toBeVisible();
  });
});
