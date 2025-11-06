import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { selectNavCard } from '../utils/navigation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleImage = path.resolve(__dirname, '../../../..', 'test_images', 'run1.jpg');

test.describe('Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({ signedIn: true, user: { id: 'interactive-user', username: 'interactive@example.com' } });
    });
  });

  test('dashboard tabs switch content', async ({ page }) => {
    await selectNavCard(page, 'Dashboard');
    await expect(page.getByRole('button', { name: 'Temperature' })).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Humidity' }).click();
    await expect(page.getByRole('button', { name: 'Humidity' })).toHaveClass(/active/);
  });

  test('weed detection supports file selection and API response', async ({ page }) => {
    await selectNavCard(page, 'Weed Detection');
    await page.waitForURL(/\/weed-detection/);

    await page.route('**/api/weed-detection', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ detections: 2, result_image: null })
      });
    });

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(sampleImage);
    await page.getByRole('button', { name: 'Detect Weeds' }).click();

    await expect(page.getByText(/2 weeds detected/)).toBeVisible();
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
