import { test, expect } from '@playwright/test';

test.describe('PromptFlow E2E', () => {
  test.skip('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/api/v1/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe('ok');
  });

  test.skip('landing page redirects to /id/generate when unauthed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(id|en)\/(generate|login)/);
  });

  test.skip('login form rejects empty', async ({ page }) => {
    await page.goto('/id/login');
    await page.click('button[type=submit]');
    await expect(page.locator('input:invalid')).toHaveCount(2);
  });
});
