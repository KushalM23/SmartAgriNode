import { chromium } from 'playwright';
import { playAudit } from 'playwright-lighthouse';

const targetUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173';

async function run() {
  console.log(`Running Lighthouse audit against ${targetUrl}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  await playAudit({
    page,
    thresholds: {
      performance: 0.9,
      accessibility: 0.9,
      seo: 0.9,
      'best-practices': 0.9
    },
    disableDeviceEmulation: true,
    lighthouseConfig: {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: { disabled: true }
      }
    },
    reports: {
      formats: {
        html: 'tests/performance/lighthouse-report.html',
        json: 'tests/performance/lighthouse-report.json'
      }
    }
  });

  await browser.close();
  console.log('Lighthouse audit complete. Reports saved to tests/performance/.');
}

run().catch((error) => {
  console.error('Lighthouse audit failed:', error);
  process.exitCode = 1;
});
