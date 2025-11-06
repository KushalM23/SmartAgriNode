import { test, expect } from '@playwright/test';
import { selectNavCard } from '../utils/navigation';

test.describe('Navigation & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({ signedIn: true, user: { id: 'nav-user', username: 'navigator@example.com' } });
    });
  });

  test('navigates between primary routes and respects history state', async ({ page }) => {
    const destinations = [
      { label: 'Dashboard', url: '/dashboard', heading: 'Smart Farm Dashboard' },
      { label: 'Crop Recommendation', url: '/crop-recommendation', heading: 'Crop Recommendation' },
      { label: 'Weed Detection', url: '/weed-detection', heading: 'Weed Detection' }
    ];

    for (const { label, url, heading } of destinations) {
      await selectNavCard(page, label);
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }

    await page.goBack();
    await expect(page).toHaveURL('/crop-recommendation');

    await page.goForward();
    await expect(page).toHaveURL('/weed-detection');
  });

  test('handles query params in auth route', async ({ page }) => {
    await page.goto('/auth?mode=sign-up');
    await expect(page).toHaveURL(/mode=sign-up/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    await page.goto('/auth?mode=sign-in');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('shows graceful fallback for unknown routes', async ({ page }) => {
    await page.goto('/totally-unknown');
    await expect(page.locator('.card-nav')).toBeVisible();
    await expect(page).toHaveURL('/totally-unknown');
  });
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
