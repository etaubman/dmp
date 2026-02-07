import '@angular/compiler';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import { AppModule } from './app/app.module';

ModuleRegistry.registerModules([AllCommunityModule]);

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
