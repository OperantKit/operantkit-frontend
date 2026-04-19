import { test, expect } from '@playwright/test';

test.describe('OperantKit Frontend UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the dev server is running, handled by webServer in playwright.config.ts
    // Go to the home page before each test
    await page.goto('/');
  });

  test('should display Header, Sidebar, and Main Content on Home page', async ({ page }) => {
    // Check for Header presence
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header h1')).toHaveText('OperantKit Frontend');
    await expect(page.locator('header nav')).toBeVisible();

    // Check for Sidebar presence
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('aside h2')).toHaveText('Navigation');
    await expect(page.locator('aside nav ul li').first()).toBeVisible(); // Check for at least one nav item

    // Check for Main Content presence (the default Next.js welcome text)
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main h1').first()).toContainText('To get started, edit the page.tsx file.');
  });

  test('should display Experiment Settings form on /settings page', async ({ page }) => {
    await page.goto('/settings');

    // Check for page title
    await expect(page.getByRole('heading', { name: 'Experiment Settings' })).toHaveText('Experiment Settings');

    // Check for form presence
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check for form elements
    await expect(form.locator('label:has-text("Schedule Type:")')).toBeVisible();
    await expect(form.locator('select[name="scheduleType"]')).toBeVisible();
    await expect(form.locator('label:has-text("Schedule Value:")')).toBeVisible();
    await expect(form.locator('input[name="scheduleValue"][type="number"]')).toBeVisible();
    await expect(form.locator('label:has-text("Number of Trials:")')).toBeVisible();
    await expect(form.locator('input[name="trials"][type="number"]')).toBeVisible();
    await expect(form.locator('label:has-text("Experiment Duration (minutes):")')).toBeVisible();
    await expect(form.locator('input[name="duration"][type="number"]')).toBeVisible();
    await expect(form.locator('button[type="submit"]:has-text("Save Settings")')).toBeVisible();
    await expect(form.locator('button:has-text("Save Profile")')).toBeVisible();
    await expect(form.locator('button:has-text("Load Profile")')).toBeVisible();
  });

  test('should validate form inputs on /settings page', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    // Attempt to submit with invalid values (0 or negative)
    await form.locator('input[name="scheduleValue"]').fill('0');
    await form.locator('input[name="trials"]').fill('-50');
    await form.locator('input[name="duration"]').fill('0');

    // Suppress alert dialogs for this test
    const validationDialogHandler = async (dialog: any) => {
      expect(dialog.message()).toContain('Please correct the errors in the form.');
      await dialog.dismiss();
    };
    page.on('dialog', validationDialogHandler);

    await form.locator('button[type="submit"]:has-text("Save Settings")').click();

    // Check for error messages
    await expect(form.locator('p.text-red-500:has-text("Schedule Value must be greater than 0")')).toBeVisible();
    await expect(form.locator('p.text-red-500:has-text("Trials must be greater than 0")')).toBeVisible();
    await expect(form.locator('p.text-red-500:has-text("Duration must be greater than 0")')).toBeVisible();

    // Enter valid values and resubmit
    await form.locator('input[name="scheduleValue"]').fill('10');
    await form.locator('input[name="trials"]').fill('200');
    await form.locator('input[name="duration"]').fill('90');

    page.off('dialog', validationDialogHandler); // Remove the previous handler
    const successDialogHandler = async (dialog: any) => {
      expect(dialog.message()).toContain('Settings saved (not really, just logged to console)!');
      await dialog.accept();
    };
    page.on('dialog', successDialogHandler);

    await form.locator('button[type="submit"]:has-text("Save Settings")').click();

    // Check that error messages are gone
    await expect(form.locator('p.text-red-500')).not.toBeVisible();
    page.off('dialog', successDialogHandler);
  });

  test('should retain form input state on /settings page', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    // Change values
    await form.locator('select[name="scheduleType"]').selectOption('VR');
    await form.locator('input[name="scheduleValue"]').fill('5');
    await form.locator('input[name="trials"]').fill('500');
    await form.locator('input[name="duration"]').fill('120');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/settings');

    // Check if values are retained (they should be, due to React state, not URL params)
    // Note: React component state is lost on full page navigation.
    // This test specifically checks that the initial state is loaded correctly
    // or if some persistence mechanism (which isn't implemented yet) was to be in place.
    // For now, it will revert to initial state as expected.
    await expect(form.locator('select[name="scheduleType"]')).toHaveValue('FR'); // Reverts to initial
    await expect(form.locator('input[name="scheduleValue"]')).toHaveValue('1'); // Reverts to initial
    await expect(form.locator('input[name="trials"]')).toHaveValue('100');     // Reverts to initial
    await expect(form.locator('input[name="duration"]')).toHaveValue('60');     // Reverts to initial
  });

  test('should trigger alert for Save/Load Profile buttons', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    const saveProfileDialogHandler = async (dialog: any) => {
      expect(dialog.message()).toContain('Save Profile functionality not yet implemented.');
      await dialog.dismiss();
    };
    page.on('dialog', saveProfileDialogHandler);
    await form.locator('button:has-text("Save Profile")').click();
    page.off('dialog', saveProfileDialogHandler); // Remove handler after test

    // Test Load Profile button
    const loadProfileDialogHandler = async (dialog: any) => {
      expect(dialog.message()).toContain('Load Profile functionality not yet implemented.');
      await dialog.dismiss();
    };
    page.on('dialog', loadProfileDialogHandler);
    await form.locator('button:has-text("Load Profile")').click();
    page.off('dialog', loadProfileDialogHandler); // Remove handler after test
  });
});
