import { test, expect } from '@playwright/test';

test('página carrega React', async ({ page }) => {
  const response = await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Status:', response?.status());
  await page.waitForSelector('#root > *', { timeout: 10000 });
  const title = await page.title();
  console.log('Title:', title);
  const content = await page.textContent('body');
  console.log('Body length:', content?.length);
  await page.screenshot({ path: 'tests/screenshots/debug-home.png', fullPage: true });
  expect(title).toContain('CROM');
});
