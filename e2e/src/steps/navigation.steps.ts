import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { E2EWorld } from '../support/world';

Given(
  'I am logged in as {string} with password {string}',
  async function (this: E2EWorld, email: string, password: string) {
    await this.initBrowser();
    const e = email.replace(/^"|"$/g, '');
    const p = password.replace(/^"|"$/g, '');
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await this.page.getByLabel('Email').fill(e);
    await this.page.getByLabel('Password').fill(p);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await expect(this.page).toHaveURL(/\/(\?.*)?$/, { timeout: 10000 });
  }
);

When('I click the sidebar link {string}', async function (this: E2EWorld, linkText: string) {
  const sidebar = this.page.locator('aside');
  const link = sidebar.getByRole('link', { name: linkText });
  await link.scrollIntoViewIfNeeded();
  await link.click({ timeout: 5000 });
  await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
});

Then('the URL should contain {string}', async function (this: E2EWorld, segment: string) {
  const s = segment.replace(/^"|"$/g, '');
  await expect(this.page).toHaveURL((url: URL) => url.href.includes(s));
});

Then('the URL path should be {string}', async function (this: E2EWorld, path: string) {
  const p = path.replace(/^"|"$/g, '');
  const url = new URL(this.page.url());
  expect(url.pathname).toBe(p || '/');
});

Then('I should see content for the data elements page', async function (this: E2EWorld) {
  await expect(this.page.getByRole('heading', { name: 'Critical Data Elements' })).toBeVisible({ timeout: 5000 });
});

When('I am on the {string} page', async function (this: E2EWorld, path: string) {
  const p = path.replace(/^"|"$/g, '');
  await this.page.goto(`/${p}`);
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

When('I navigate to the home page', async function (this: E2EWorld) {
  await this.page.goto('/');
  await this.page.waitForLoadState('domcontentloaded');
});
