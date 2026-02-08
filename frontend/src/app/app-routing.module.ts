import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DataElementsPageComponent } from './pages/data-elements-page/data-elements-page.component';
import { ApplicationsPageComponent } from './pages/applications-page/applications-page.component';
import { EucsPageComponent } from './pages/eucs-page/eucs-page.component';
import { EndpointsPageComponent } from './pages/endpoints-page/endpoints-page.component';
import { DqRulesPageComponent } from './pages/dq-rules-page/dq-rules-page.component';
import { DqExceptionsPageComponent } from './pages/dq-exceptions-page/dq-exceptions-page.component';
import { DataConcernsPageComponent } from './pages/data-concerns-page/data-concerns-page.component';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { BulkPageComponent } from './pages/bulk-page/bulk-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AdminDomainsPageComponent } from './pages/admin-domains-page/admin-domains-page.component';
import { AdminUsersPageComponent } from './pages/admin-users-page/admin-users-page.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AdminSettingsPageComponent } from './pages/admin-settings-page/admin-settings-page.component';
import { ProcessModelsPageComponent } from './pages/process-models-page/process-models-page.component';
import { DataFeedsPageComponent } from './pages/data-feeds-page/data-feeds-page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomePageComponent },
      { path: 'data-elements', component: DataElementsPageComponent },
      { path: 'applications', component: ApplicationsPageComponent },
      { path: 'eucs', component: EucsPageComponent },
      { path: 'endpoints', component: EndpointsPageComponent },
      { path: 'data-quality-rules', component: DqRulesPageComponent },
      { path: 'data-quality-exceptions', component: DqExceptionsPageComponent },
      { path: 'data-concerns', component: DataConcernsPageComponent },
      { path: 'metrics', component: MetricsPageComponent },
      { path: 'process-models', component: ProcessModelsPageComponent },
      { path: 'data-feeds', component: DataFeedsPageComponent },
      {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'domains' },
          { path: 'domains', component: AdminDomainsPageComponent },
          { path: 'user-management', component: AdminUsersPageComponent },
          { path: 'users', redirectTo: 'user-management', pathMatch: 'full' },
          { path: 'settings', component: AdminSettingsPageComponent },
          { path: 'bulk', component: BulkPageComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
