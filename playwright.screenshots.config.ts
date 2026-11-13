import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Regenerates the README images in docs/assets/screenshots/.
 * Run with `npm run screenshots`; `npm test` does not run this spec.
 * Images are 1280x720 CSS pixels at device scale factor 2 (2560x1440 files).
 */
export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: 'screenshots.spec.ts',
  reporter: 'list',
  projects: [
    {
      name: 'screenshots',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2,
      },
    },
  ],
});
