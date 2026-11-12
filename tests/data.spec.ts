import { test, expect } from '@playwright/test';

test.describe('OperantKit Frontend Data Visualization UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data');
  });

  test('should display Experiment Data Visualization page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Experiment Data Analysis' })).toBeVisible();
  });

  test('should display session data table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Raw Experiment Events' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Event Type")')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Timestamp")')).toBeVisible();
    await expect(page.locator('table tr th:has-text("Details")')).toBeVisible();

    await expect(page.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('should display Cumulative Record Chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cumulative Record' })).toBeVisible();

    // Check for the presence of the chart container (recharts uses SVG)
    const cumulativeChartContainer = page.getByTestId('cumulative-record-chart-container');
    await expect(cumulativeChartContainer.locator('.recharts-wrapper')).toBeVisible();
    await expect(cumulativeChartContainer.locator('.recharts-surface[role="application"]')).toBeVisible(); // Check for main chart SVG
    await expect(cumulativeChartContainer.locator('.recharts-surface[role="application"] path')).not.toHaveCount(0);

    await expect(cumulativeChartContainer.locator('.recharts-cartesian-axis-line')).toHaveCount(2);
    await expect(cumulativeChartContainer.locator('.recharts-label:has-text("Time (seconds)")')).toBeVisible();
    await expect(cumulativeChartContainer.locator('.recharts-label:has-text("Cumulative Responses")')).toBeVisible();

    await expect(cumulativeChartContainer.locator('.recharts-legend-wrapper')).toBeVisible();
    await expect(cumulativeChartContainer.locator('.recharts-legend-item:has-text("Cumulative Responses")')).toBeVisible();
    await expect(cumulativeChartContainer.locator('.recharts-legend-item:has-text("Cumulative Reinforcements")')).toBeVisible();
  });

  test('should display Response Rate Chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Response Rate Over Time' })).toBeVisible();

    const responseRateChartContainer = page.getByTestId('response-rate-chart-container');
    await expect(responseRateChartContainer.locator('.recharts-wrapper')).toBeVisible();
    await expect(responseRateChartContainer.locator('.recharts-surface[role="application"]')).toBeVisible();
    await expect(responseRateChartContainer.locator('.recharts-surface[role="application"] path')).not.toHaveCount(0);

    await expect(responseRateChartContainer.locator('.recharts-cartesian-axis-line')).toHaveCount(2);
    await expect(responseRateChartContainer.locator('.recharts-label:has-text("Time (seconds)")')).toBeVisible();
    await expect(responseRateChartContainer.locator('.recharts-label:has-text("Response Rate (res/min)")')).toBeVisible();

    await expect(responseRateChartContainer.locator('.recharts-legend-wrapper')).toBeVisible();
    await expect(responseRateChartContainer.locator('.recharts-legend-item:has-text("Response Rate")')).toBeVisible();
  });
});
