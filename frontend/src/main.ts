/**
 * Application entry point (bootstrap).
 *
 * - Imports the Angular JIT compiler so templates compile at runtime.
 * - Registers AG Grid and AG Charts community modules for data grids and charts.
 * - Bootstraps the root AppModule with ngZoneEventCoalescing for fewer change detection cycles.
 */

import '@angular/compiler';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ModuleRegistry as AgGridModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ModuleRegistry as AgChartsModuleRegistry, AllCommunityModule as AgChartsAllCommunity } from 'ag-charts-community';

import { AppModule } from './app/app.module';

// Register AG Grid and AG Charts so they are available app-wide
AgGridModuleRegistry.registerModules([AllCommunityModule]);
AgChartsModuleRegistry.registerModules([AgChartsAllCommunity]);

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
