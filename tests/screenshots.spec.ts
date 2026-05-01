import { test } from '@playwright/test';
import path from 'path';

const targets = [
  { route: '/', file: 'home.png' },
  { route: '/data', file: 'data.png' },
  { route: '/cumulative-recorder', file: 'cumulative-recorder.png' },
  { route: '/sim', file: 'sim.png' },
  { route: '/session-live', file: 'session-live.png' },
];

const outDir = path.join(__dirname, '..', 'docs', 'assets', 'screenshots');

test.describe('screenshots', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const { route, file } of targets) {
    test(`capture ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(outDir, file),
        fullPage: false,
      });
    });
  }
});
