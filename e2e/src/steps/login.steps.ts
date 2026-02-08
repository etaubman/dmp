import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { E2EWorld } from '../support/world';

Given('the app is running at {string}', async function (this: E2EWorld, url: string) {
  this.baseUrl = url.replace(/^"|"$/g, '');
  await this.initBrowser();
});

When('I open the login page', async function (this: E2EWorld) {
  await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

When(
  'I enter email {string} and password {string}',
  async function (this: E2EWorld, email: string, password: string) {
    const e = email.replace(/^"|"$/g, '');
    const p = password.replace(/^"|"$/g, '');
    await this.page.getByLabel('Email').fill(e);
    await this.page.getByLabel('Password').fill(p);
  }
);

When('I click {string}', async function (this: E2EWorld, text: string) {
  await this.page.getByRole('button', { name: text }).click();
});

Then('I should be on the home page', async function (this: E2EWorld) {
  await expect(this.page).toHaveURL(/\/(\?.*)?$/);
});

Then('I should see the main layout with sidebar', async function (this: E2EWorld) {
  await expect(this.page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
  await expect(this.page.getByRole('link', { name: 'Critical Data Elements' })).toBeVisible();
});

Then('I should see the login form', async function (this: E2EWorld) {
  await expect(this.page.getByLabel('Email')).toBeVisible();
  await expect(this.page.getByLabel('Password')).toBeVisible();
  await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

Then('I should see {string}', async function (this: E2EWorld, text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});

Then('I should see an auth error message', async function (this: E2EWorld) {
  await expect(this.page.locator('.text-red-400')).toBeVisible({ timeout: 5000 });
});

Then('I should remain on the login page', async function (this: E2EWorld) {
  await expect(this.page).toHaveURL(/\/login/);
});
