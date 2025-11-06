import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', size: { width: 1280, height: 720 } },
  { name: 'tablet', size: { width: 834, height: 1194 } },
  { name: 'mobile', size: { width: 414, height: 896 } }
];

test.describe('Visual Regression - Key Pages', () => {
  for (const viewport of viewports) {
    test(`home renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto('/');
      await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, { fullPage: true, animations: 'disabled' });
    });

    test(`dashboard renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.evaluate(() => {
        window.__mockClerk?.setState?.({ signedIn: true, user: { id: 'visual-user', username: 'visual@example.com' } });
      });
      await page.reload();
      await page.setViewportSize(viewport.size);
      await page.goto('/dashboard');
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, { fullPage: true, animations: 'disabled' });
    });
  }
});

declare global {
  interface Window {
    __mockClerk?: {
      setState?: (state: { signedIn?: boolean; user?: unknown }) => void;
    };
  }
}
