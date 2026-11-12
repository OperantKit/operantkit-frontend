import { test, expect, type Dialog } from '@playwright/test';

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

    await expect(form.locator('label:has-text("Experiment Name")')).toBeVisible();
    await expect(form.locator('input[name="experimentName"]')).toBeVisible();
    await expect(form.locator('label:has-text("Total Trials")')).toBeVisible();
    await expect(form.locator('input[name="totalTrials"][type="number"]')).toBeVisible();
    await expect(form.locator('label:has-text("Subject ID")')).toBeVisible();
    await expect(form.locator('input[name="subjectID"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trial Conditions' })).toBeVisible();
    await expect(form.locator('label:has-text("Schedule Type")')).toBeVisible();
    await expect(form.locator('select[name="scheduleType"]')).toBeVisible();
    await expect(form.locator('label:has-text("Ratio (FR)")')).toBeVisible();
    await expect(form.locator('input[name="ratio"][type="number"]')).toBeVisible();
    await expect(form.locator('label:has-text("Duration (seconds, optional)")')).toBeVisible();
    await expect(form.locator('input[name="duration"][type="number"]')).toBeVisible();
    await expect(form.locator('button:has-text("Add Trial Condition")')).toBeVisible();
    await expect(form.locator('button:has-text("Save Profile")')).toBeVisible();
  });

  test('should validate form inputs on /settings page', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    await form.locator('input[name="totalTrials"]').fill('0');
    await form.locator('input[name="ratio"]').fill('0');
    await form.locator('input[name="duration"]').fill('0');

    const validationDialogHandler = async (dialog: Dialog) => {
      expect(dialog.message()).toContain('Please correct the errors in the form before saving.');
      await dialog.dismiss();
    };
    page.on('dialog', validationDialogHandler);

    await form.locator('button:has-text("Save Profile")').click();

    await expect(form.locator('p:has-text("Total trials must be a positive number.")')).toBeVisible();
    await expect(form.locator('p:has-text("Ratio must be a positive number.")')).toBeVisible();
    await expect(form.locator('p:has-text("Duration must be a positive number.")')).toBeVisible();

    await form.locator('input[name="totalTrials"]').fill('200');
    await form.locator('input[name="ratio"]').fill('10');
    await form.locator('input[name="duration"]').fill('90');

    page.off('dialog', validationDialogHandler);
    const successDialogHandler = async (dialog: Dialog) => {
      expect(dialog.message()).toContain('Experiment settings saved successfully!');
      await dialog.accept();
    };
    page.on('dialog', successDialogHandler);

    await form.locator('button:has-text("Save Profile")').click();

    await expect(form.locator('p.text-red-600')).not.toBeVisible();
    page.off('dialog', successDialogHandler);
  });

  test('should allow editing form input state on /settings page', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    await form.locator('input[name="ratio"]').fill('5');
    await form.locator('input[name="totalTrials"]').fill('500');
    await form.locator('input[name="duration"]').fill('120');

    await expect(form.locator('select[name="scheduleType"]')).toHaveValue('FR');
    await expect(form.locator('input[name="ratio"]')).toHaveValue('5');
    await expect(form.locator('input[name="totalTrials"]')).toHaveValue('500');
    await expect(form.locator('input[name="duration"]')).toHaveValue('120');
  });

  test('should save valid profile settings', async ({ page }) => {
    await page.goto('/settings');
    const form = page.locator('form');

    const saveProfileDialogHandler = async (dialog: Dialog) => {
      expect(dialog.message()).toContain('Experiment settings saved successfully!');
      await dialog.accept();
    };
    page.on('dialog', saveProfileDialogHandler);
    await form.locator('button:has-text("Save Profile")').click();
    page.off('dialog', saveProfileDialogHandler);
  });
});
