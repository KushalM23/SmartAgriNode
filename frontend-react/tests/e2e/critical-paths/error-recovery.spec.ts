import { test, expect } from '@playwright/test';
import { selectNavCard } from '../utils/navigation';

test.describe('Error Recovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({
        signedIn: true,
        user: { id: 'recovery-user', username: 'resilient@example.com' }
      });
    });
    await selectNavCard(page, 'Crop Recommendation');
    await page.waitForURL(/\/crop-recommendation/);
    await page.locator('form').waitFor();
  });

  test('shows helpful validation, handles failures, and recovers', async ({ page }) => {
    const initialValidity = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form instanceof HTMLFormElement ? form.reportValidity() : false;
    });
    expect(initialValidity).toBe(false);

    await page.route('**/api/crop-recommendation', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.fill('input[name="N"]', '-5');
    const nValidity = await page.evaluate(() => {
      const input = document.querySelector('input[name="N"]');
      return input instanceof HTMLInputElement ? input.validity.valid : null;
    });
    expect(nValidity).toBe(false);

    await page.fill('input[name="N"]', '80');
    await page.fill('input[name="P"]', '35');
    await page.fill('input[name="K"]', '45');
    await page.fill('input[name="temperature"]', '24');
    await page.fill('input[name="humidity"]', '68');
    await page.fill('input[name="ph"]', '6.4');
    await page.fill('input[name="rainfall"]', '110');

    await page.getByRole('button', { name: 'Get Recommendations' }).click();
    await expect(page.locator('.auth-error')).toHaveText('Internal server error');

    await page.unroute('**/api/crop-recommendation');
    await page.route('**/api/crop-recommendation', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recommended_crop: 'Rice', confidence: 0.76 })
      });
    });

    await page.getByRole('button', { name: 'Get Recommendations' }).click();
    await expect(page.locator('.auth-error')).toHaveCount(0);
    await expect(page.getByText('Rice').first()).toBeVisible();
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
