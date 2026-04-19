import { test, expect } from '@playwright/test';

test.describe('OperantKit Frontend Data Visualization UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data');
  });

  test('should display Experiment Data Visualization page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Experiment Data Visualization' })).toBeVisible();
  });

  test('should display session data table', async ({ page }) => {
    // Check for DataTable title
    await expect(page.getByRole('heading', { name: /Session Data: s1/ })).toBeVisible();

    // Check for some key info in the table
    await expect(page.locator('p:has-text("Experiment ID: exp1")')).toBeVisible();
    await expect(page.locator('p:has-text("Participant ID: p1")')).toBeVisible();
    await expect(page.locator('p:has-text("Schedule: FR 5")')).toBeVisible();

    // Check for Behavior Events Log table header
    await expect(page.getByRole('heading', { name: 'Behavior Events Log' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Time")')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Type")')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Value")')).toBeVisible();

    // Check for at least one row of data (mock data should generate some events)
    await expect(page.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('should display Cumulative Record Chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cumulative Record' })).toBeVisible();

    // Check for the presence of the chart container (recharts uses SVG)
    const cumulativeChartContainer = page.getByTestId('cumulative-record-chart-container');
    await expect(cumulativeChartContainer.locator('.recharts-wrapper')).toBeVisible();
    await expect(cumulativeChartContainer.locator('.recharts-surface[role="application"]')).toBeVisible(); // Check for main chart SVG
    await expect(cumulativeChartContainer.locator('.recharts-surface[role="application"] path')).toHaveCount(2); // Check for the two path elements (responses and reinforcers)

    // Check for X and Y axis labels (or just the axis presence)
    await expect(page.locator('.recharts-cartesian-axis-line')).toHaveCount(2); // X and Y axis lines
    await expect(page.locator('.recharts-label:has-text("Time (seconds)")')).toBeVisible();
    await expect(page.locator('.recharts-label:has-text("Cumulative Responses")')).toBeVisible();
    await expect(page.locator('.recharts-label:has-text("Cumulative Reinforcers")')).toBeVisible();

    // Check for legend
    await expect(page.locator('.recharts-legend-wrapper')).toBeVisible();
    await expect(page.locator('.recharts-legend-item:has-text("Responses")')).toBeVisible();
    await expect(page.locator('.recharts-legend-item:has-text("Reinforcers")')).toBeVisible();
  });

  test('should display Response Rate Chart', async ({ page }) => {
    // Check for Response Rate Chart title
    await expect(page.getByRole('heading', { name: /Response Rate \(5-min intervals\)/ })).toBeVisible();

    // Check for the presence of the chart container (recharts uses SVG)
    const responseRateChartContainer = page.getByTestId('response-rate-chart-container');
    await expect(responseRateChartContainer.locator('.recharts-wrapper')).toBeVisible();
    await expect(responseRateChartContainer.locator('.recharts-surface[role="application"]')).toBeVisible(); // Check for main chart SVG
    await expect(responseRateChartContainer.locator('.recharts-surface[role="application"] rect')).not.toHaveCount(0); // Check that at least some rect elements exist

    // Check for X and Y axis labels
    await expect(page.locator('.recharts-cartesian-axis-line')).toHaveCount(2); // X and Y axis lines
    await expect(page.locator('.recharts-label:has-text("Time (minutes in 5-min blocks)")')).toBeVisible();
    await expect(page.locator('.recharts-label:has-text("Responses per minute")')).toBeVisible();

    // Check for legend
    await expect(page.locator('.recharts-legend-wrapper')).toBeVisible();
    await expect(page.locator('.recharts-legend-item:has-text("Response Rate")')).toBeVisible();
  });
});
