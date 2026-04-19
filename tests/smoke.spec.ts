import { test, expect } from '@playwright/test';

/**
 * Minimal smoke tests for the operantkit-frontend port.
 *
 * Verifies that the production-built or dev-served app boots and that the
 * primary public routes render without throwing. Detailed UI assertions live
 * in ui.spec.ts and data.spec.ts.
 */

test.describe('smoke', () => {
  test('home page loads with no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    const response = await page.goto('/');
    expect(response, 'navigation response should exist').not.toBeNull();
    expect(response!.status(), 'home page should respond 2xx').toBeLessThan(400);

    // Body should render some content
    await expect(page.locator('body')).toBeVisible();

    expect(
      consoleErrors,
      `home page produced console errors: ${consoleErrors.join(' | ')}`,
    ).toEqual([]);
  });

  test('login page renders', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response, 'navigation response should exist').not.toBeNull();
    expect(response!.status(), '/login should respond 2xx').toBeLessThan(400);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toBeVisible();
  });
});
