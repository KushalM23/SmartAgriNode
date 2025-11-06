import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      window.__mockClerk?.setState?.({
        signedIn: true,
        user: { id: 'a11y-user', username: 'inclusion@example.com' }
      });
    });
  });

  const paths = ['/', '/dashboard', '/crop-recommendation', '/weed-detection'];

  for (const path of paths) {
    test(`meets baseline WCAG rules on ${path}`, async ({ page }, testInfo) => {
      if (path !== '/') {
        await page.goto(path);
      }

      const axe = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      const results = await axe.analyze();

      await testInfo.attach(`axe-${path.replace('/', '') || 'home'}`, {
        contentType: 'application/json',
        body: JSON.stringify(results, null, 2)
      });

      expect(results.violations, `Accessibility issues on ${path}`).toEqual([]);
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
