import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { E2EWorld } from '../support/world';

When('I select the domain {string} from the domain selector', async function (this: E2EWorld, domainName: string) {
  await this.initBrowser();
  const selector = this.page.locator('app-domain-selector select');
  await selector.selectOption({ label: domainName });
  await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
});

Then('the data elements page should show table or empty state', async function (this: E2EWorld) {
  await this.initBrowser();
  const grid = this.page.locator('.ag-theme-quartz');
  const emptyMsg = this.page.getByText('No data elements', { exact: false });
  await expect(grid.or(emptyMsg)).toBeVisible({ timeout: 8000 });
});

Then('the applications page should show table or empty state', async function (this: E2EWorld) {
  await this.initBrowser();
  const grid = this.page.locator('.ag-theme-quartz');
  const emptyMsg = this.page.getByText('No applications', { exact: false });
  await expect(grid.or(emptyMsg)).toBeVisible({ timeout: 8000 });
});

Then('the data concerns page should show table or empty state', async function (this: E2EWorld) {
  await this.initBrowser();
  const grid = this.page.locator('.ag-theme-quartz');
  const emptyMsg = this.page.getByText('No data concerns', { exact: false });
  await expect(grid.or(emptyMsg)).toBeVisible({ timeout: 8000 });
});

Then('when the concept table is visible it should show the Domain column header', async function (this: E2EWorld) {
  await this.initBrowser();
  const grid = this.page.locator('.main-content .ag-theme-quartz').first();
  const isVisible = await grid.isVisible().catch(() => false);
  if (!isVisible) return;
  await expect(grid.getByText('Domain', { exact: true })).toBeVisible({ timeout: 3000 });
});
