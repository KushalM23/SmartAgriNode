import { test, expect } from '@playwright/test';

test.describe('State Management Regression Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({ signedIn: true, user: { id: 'regression-user', username: 'regression@example.com' } });
    });
    await page.route('**/api/crop-recommendation', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recommended_crop: 'Barley', confidence: 0.73 })
      });
    });
  });

  test('does not leak recommendation results across navigation', async ({ page }) => {
    await page.goto('/crop-recommendation');

    await page.fill('input[name="N"]', '70');
    await page.fill('input[name="P"]', '30');
    await page.fill('input[name="K"]', '40');
    await page.fill('input[name="temperature"]', '23');
    await page.fill('input[name="humidity"]', '60');
    await page.fill('input[name="ph"]', '6.0');
    await page.fill('input[name="rainfall"]', '100');
    await page.getByRole('button', { name: 'Get Recommendations' }).click();

    await expect(page.getByText('Barley').first()).toBeVisible();

    await page.goto('/dashboard');
    await page.goto('/crop-recommendation');

    await expect(page.locator('.result-card')).toHaveCount(0);
  });

  test('signing out clears mock auth state', async ({ page }) => {
    await page.getByRole('button', { name: /regression@example.com/ }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
