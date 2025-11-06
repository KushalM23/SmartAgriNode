import { test, expect } from '@playwright/test';
import { selectNavCard } from '../utils/navigation';

test.describe('First-Time User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({ signedIn: false, user: null });
    });
  });

  test('allows a visitor to sign in, use crop recommendation, and sign out', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to SmartAgriNode' })).toBeVisible();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth/);

    await page.getByLabel('Email').fill('qa.tester@example.com');
    await page.getByLabel('Password').fill('Testing!123');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Smart Farm Dashboard' })).toBeVisible();

    await page.route('**/api/crop-recommendation', async (route, request) => {
      const payload = request.postDataJSON();
      const response = {
        recommended_crop: payload.temperature > 30 ? 'Cotton' : 'Wheat',
        confidence: 0.82
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    await selectNavCard(page, 'Crop Recommendation');
    await expect(page).toHaveURL(/\/crop-recommendation/);

    await page.fill('input[name="N"]', '90');
    await page.fill('input[name="P"]', '40');
    await page.fill('input[name="K"]', '50');
    await page.fill('input[name="temperature"]', '27');
    await page.fill('input[name="humidity"]', '70');
    await page.fill('input[name="ph"]', '6.5');
    await page.fill('input[name="rainfall"]', '120');
    await page.getByRole('button', { name: 'Get Recommendations' }).click();

    await expect(page.locator('.result-title')).toHaveText(/Recommendation/i);
    await expect(page.locator('.result-highlight')).toHaveText(/Wheat/i);

    await page.fill('input[name="temperature"]', '34');
    await page.getByRole('button', { name: 'Get Recommendations' }).click();
    await expect(page.locator('.result-highlight')).toHaveText(/Cotton/i);

    await page.getByRole('button', { name: /qa.tester@example.com/i }).click();
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
