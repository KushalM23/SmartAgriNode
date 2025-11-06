import { test, expect } from '@playwright/test';
import { selectNavCard } from '../utils/navigation';

test.describe('Power User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({
        signedIn: true,
        user: { id: 'power-user', username: 'power.user@example.com' }
      });
    });
  });

  test('supports rapid recommendations and dashboard interactions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to SmartAgriNode' })).toBeVisible();
    await selectNavCard(page, 'Dashboard');
    await page.waitForURL(/\/dashboard/);

    const tabLabels = ['Temperature', 'Humidity', 'Rainfall'];
    for (const label of tabLabels) {
      await page.getByRole('button', { name: label }).click();
    }

    await page.route('**/api/crop-recommendation', async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommended_crop: body.N > 100 ? 'Sugarcane' : 'Maize',
          confidence: 0.91
        })
      });
    });

    await selectNavCard(page, 'Crop Recommendation');
    await page.waitForURL(/\/crop-recommendation/);

    const payloads = [
      { N: '80', P: '35', K: '45', temperature: '24', humidity: '68', ph: '6.4', rainfall: '110' },
      { N: '120', P: '40', K: '60', temperature: '26', humidity: '72', ph: '6.8', rainfall: '150' },
      { N: '95', P: '30', K: '55', temperature: '29', humidity: '65', ph: '6.2', rainfall: '140' }
    ];

    for (const values of payloads) {
      await test.step(`submit payload with N=${values.N}`, async () => {
        for (const [name, value] of Object.entries(values)) {
          await page.fill(`input[name="${name}"]`, value);
        }
        await page.getByRole('button', { name: 'Get Recommendations' }).click();
        await expect(page.locator('.result-title')).toHaveText(/Recommendation/i);
      });
    }

    await expect(page.locator('.result-highlight').first()).toBeVisible();
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
