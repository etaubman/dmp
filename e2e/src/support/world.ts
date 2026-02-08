import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';

export interface E2EWorldParams {
  baseUrl: string;
}

export class E2EWorld extends World<E2EWorldParams> {
  baseUrl: string = 'http://localhost:4200';
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions<E2EWorldParams>) {
    super(options);
    if (options.parameters?.baseUrl) {
      this.baseUrl = options.parameters.baseUrl;
    }
  }

  async initBrowser(): Promise<void> {
    if (this.browser) return;
    const headed = process.env.HEADED === '1';
    this.browser = await chromium.launch({ headless: !headed });
    this.context = await this.browser.newContext({
      baseURL: this.baseUrl,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    this.page = await this.context.newPage();
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(E2EWorld);
