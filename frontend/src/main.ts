import '@angular/compiler';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ModuleRegistry as AgGridModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ModuleRegistry as AgChartsModuleRegistry, AllCommunityModule as AgChartsAllCommunity } from 'ag-charts-community';

import { AppModule } from './app/app.module';

AgGridModuleRegistry.registerModules([AllCommunityModule]);
AgChartsModuleRegistry.registerModules([AgChartsAllCommunity]);

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
