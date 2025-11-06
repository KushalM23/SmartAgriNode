import { test, expect } from '@playwright/test';
import { selectNavCard } from '../utils/navigation';

test.describe('Responsive Experience Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({ signedIn: true, user: { id: 'responsive-user', username: 'responsive@example.com' } });
    });
  });

  test('adapts layout and interactions across breakpoints', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.hero-section')).toBeVisible();

    await page.setViewportSize({ width: 834, height: 1194 });
    await expect(page.locator('.card-nav')).toBeVisible();

    await page.setViewportSize({ width: 414, height: 896 });
    await selectNavCard(page, 'Weed Detection');

  await expect(page).toHaveURL(/\/weed-detection/);
  await expect(page.getByRole('heading', { name: 'Weed Detection' })).toBeVisible();

    const { width: viewportWidth = 0 } = page.viewportSize() ?? {};
    const scrollWidth = await page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 64);
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
