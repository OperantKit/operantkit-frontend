import { test, expect } from '@playwright/test';
import path from 'path';

// Writes the README images. Run with `npm run screenshots`
// (playwright.screenshots.config.ts); `npm test` skips this file.

const targets = [
  { route: '/', file: 'home.png' },
  { route: '/data', file: 'data.png' },
  { route: '/cumulative-recorder', file: 'cumulative-recorder.png' },
  { route: '/sim', file: 'sim.png', readyText: 'WASM ready' },
  { route: '/session-live', file: 'session-live.png' },
];

const outDir = path.join(__dirname, '..', 'docs', 'assets', 'screenshots');

test.describe('screenshots', () => {
  for (const { route, file, readyText } of targets) {
    test(`capture ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle').catch(() => {});
      if (readyText) {
        await expect(page.getByText(readyText)).toBeVisible({ timeout: 15000 });
      }
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(outDir, file),
        fullPage: false,
      });
    });
  }
});
