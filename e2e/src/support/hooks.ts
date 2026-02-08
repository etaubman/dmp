import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { E2EWorld } from './world';

setDefaultTimeout(15 * 1000);

Before(async function (this: E2EWorld) {
  await this.initBrowser();
});

After(async function (this: E2EWorld) {
  await this.close();
});
