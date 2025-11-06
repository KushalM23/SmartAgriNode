import type { PlaywrightTestConfig, Project } from '@playwright/test';
import { devices } from '@playwright/test';

const viewports = [
  { name: 'mobile-375x667', viewport: { width: 375, height: 667 }, isMobile: true },
  { name: 'mobile-414x896', viewport: { width: 414, height: 896 }, isMobile: true },
  { name: 'tablet-768x1024', viewport: { width: 768, height: 1024 }, isMobile: false },
  { name: 'tablet-834x1194', viewport: { width: 834, height: 1194 }, isMobile: false },
  { name: 'desktop-1280x720', viewport: { width: 1280, height: 720 }, isMobile: false },
  { name: 'desktop-1920x1080', viewport: { width: 1920, height: 1080 }, isMobile: false },
  { name: 'desktop-2560x1440', viewport: { width: 2560, height: 1440 }, isMobile: false },
  { name: 'ultrawide-3440x1440', viewport: { width: 3440, height: 1440 }, isMobile: false }
];

const browserMatrix = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], headless: true }
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], headless: true }
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], headless: true }
  }
];

const matrixProjects: Project[] = browserMatrix.flatMap((browser) =>
  viewports.map<Project>((viewport) => ({
    name: `${browser.name}-${viewport.name}`,
    testDir: 'tests/e2e',
    use: {
      ...browser.use,
      viewport: viewport.viewport,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    }
  }))
);

const config: PlaywrightTestConfig = {
  testDir: 'tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    trace: 'on-first-retry'
  },
  projects: [
    ...matrixProjects,
    {
      name: 'critical',
      testDir: 'tests/e2e/critical-paths',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
        screenshot: 'only-on-failure',
        video: 'on-first-retry'
      }
    },
    {
      name: 'accessibility',
      testDir: 'tests/e2e/accessibility',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
        screenshot: 'only-on-failure'
      }
    },
    {
      name: 'visual',
      testDir: 'tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
        screenshot: 'off'
      }
    }
  ],
  webServer: {
    command:
      process.env.PLAYWRIGHT_WEB_SERVER ||
      'npx cross-env VITE_USE_MOCK_CLERK=true VITE_CLERK_PUBLISHABLE_KEY=pk_test_dummy npm run dev -- --host 127.0.0.1 --port 5173',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 2 * 60 * 1000
  }
};

export default config;
