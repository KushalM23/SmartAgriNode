import type { Page } from '@playwright/test';

export async function openNavMenu(page: Page) {
  const nav = page.locator('.card-nav');
  const isOpen = await nav.evaluate((el) => el.classList.contains('open'));
  if (!isOpen) {
    await page.locator('.hamburger-menu').click();
    await page.locator('.card-nav.open').waitFor();
  }
}

export async function selectNavCard(page: Page, label: string) {
  await openNavMenu(page);
  const card = page.locator('.nav-card', { hasText: label }).first();
  await card.waitFor({ state: 'visible' });
  await card.click();
}
