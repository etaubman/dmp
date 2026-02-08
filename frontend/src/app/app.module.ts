/**
 * Root Angular module (AppModule).
 *
 * Declares all app components (no standalone components per project convention).
 * Configures:
 * - NgRx store with app reducer and effects
 * - HTTP client with AuthInterceptor for attaching tokens
 * - AG Grid / AG Charts for tables and charts
 * - NgDiagram for process model diagrams
 * - App routing
 *
 * Layout: LayoutComponent wraps main routes; AdminLayoutComponent wraps admin child routes.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AgGridModule } from 'ag-grid-angular';
import { AgChartsModule } from 'ag-charts-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { appReducer } from './store/app.reducer';
import { AppEffects } from './store/app.effects';

import { LayoutComponent } from './layout/layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DomainSelectorComponent } from './layout/domain-selector/domain-selector.component';
import { DetailModalComponent } from './shared/detail-modal/detail-modal.component';
import { DetailPanelComponent } from './shared/detail-panel/detail-panel.component';
import { ConceptMetricsComponent } from './shared/concept-metrics/concept-metrics.component';
import { TimePeriodSwitchComponent } from './shared/time-period-switch/time-period-switch.component';
import { LineageModalComponent } from './shared/lineage-modal/lineage-modal.component';
import { DataConcernDetailModalComponent } from './shared/data-concern-detail-modal/data-concern-detail-modal.component';
import { NgDiagramComponent } from 'ng-diagram';

import { DataElementsPageComponent } from './pages/data-elements-page/data-elements-page.component';
import { KebabActionsCellComponent } from './shared/kebab-actions-cell/kebab-actions-cell.component';
import { LineageButtonCellComponent } from './pages/data-elements-page/lineage-button-cell/lineage-button-cell.component';
import { DataConcernsCountCellComponent } from './pages/data-elements-page/data-concerns-count-cell/data-concerns-count-cell.component';
import { EndpointsCountCellComponent } from './pages/data-elements-page/endpoints-count-cell/endpoints-count-cell.component';
import { DqRulesCountCellComponent } from './pages/data-elements-page/dq-rules-count-cell/dq-rules-count-cell.component';
import { SorCountCellComponent } from './pages/data-elements-page/sor-count-cell/sor-count-cell.component';
import { EndpointDetailModalComponent } from './shared/endpoint-detail-modal/endpoint-detail-modal.component';
import { DqRuleDetailModalComponent } from './shared/dq-rule-detail-modal/dq-rule-detail-modal.component';
import { DataElementDetailModalComponent } from './shared/data-element-detail-modal/data-element-detail-modal.component';
import { CdeCountCellComponent } from './pages/endpoints-page/cde-count-cell/cde-count-cell.component';
import { EndpointConcernsCountCellComponent } from './pages/endpoints-page/endpoint-concerns-count-cell/endpoint-concerns-count-cell.component';
import { EndpointDqRulesCountCellComponent } from './pages/endpoints-page/endpoint-dq-rules-count-cell/endpoint-dq-rules-count-cell.component';
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
import { AdminSettingsPageComponent } from './pages/admin-settings-page/admin-settings-page.component';
import { ProcessModelsPageComponent } from './pages/process-models-page/process-models-page.component';
import { DataFeedsPageComponent } from './pages/data-feeds-page/data-feeds-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { AuthInterceptor } from './core/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    AdminLayoutComponent,
    DomainSelectorComponent,
    DetailModalComponent,
    DetailPanelComponent,
    ConceptMetricsComponent,
    TimePeriodSwitchComponent,
    LineageModalComponent,
    DataConcernDetailModalComponent,
    KebabActionsCellComponent,
    LineageButtonCellComponent,
    DataConcernsCountCellComponent,
    EndpointsCountCellComponent,
    DqRulesCountCellComponent,
    SorCountCellComponent,
    EndpointDetailModalComponent,
    DqRuleDetailModalComponent,
    DataElementDetailModalComponent,
    CdeCountCellComponent,
    EndpointConcernsCountCellComponent,
    EndpointDqRulesCountCellComponent,
    DataElementsPageComponent,
    ApplicationsPageComponent,
    EucsPageComponent,
    EndpointsPageComponent,
    DqRulesPageComponent,
    DqExceptionsPageComponent,
    DataConcernsPageComponent,
    MetricsPageComponent,
    ProcessModelsPageComponent,
    DataFeedsPageComponent,
    BulkPageComponent,
    HomePageComponent,
    AdminDomainsPageComponent,
    AdminUsersPageComponent,
    AdminSettingsPageComponent,
    LoginPageComponent,
  ],
  providers: [
    // Attach auth token to outgoing HTTP requests
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    AgGridModule,
    AgChartsModule,
    NgDiagramComponent,
    AppRoutingModule,
    StoreModule.forRoot({ app: appReducer }),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
