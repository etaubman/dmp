import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
import { EndpointDetailModalComponent } from './shared/endpoint-detail-modal/endpoint-detail-modal.component';
import { DqRuleDetailModalComponent } from './shared/dq-rule-detail-modal/dq-rule-detail-modal.component';
import { ApplicationsPageComponent } from './pages/applications-page/applications-page.component';
import { EucsPageComponent } from './pages/eucs-page/eucs-page.component';
import { EndpointsPageComponent } from './pages/endpoints-page/endpoints-page.component';
import { DqRulesPageComponent } from './pages/dq-rules-page/dq-rules-page.component';
import { DqExceptionsPageComponent } from './pages/dq-exceptions-page/dq-exceptions-page.component';
import { DataConcernsPageComponent } from './pages/data-concerns-page/data-concerns-page.component';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { BulkPageComponent } from './pages/bulk-page/bulk-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
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
    EndpointDetailModalComponent,
    DqRuleDetailModalComponent,
    DataElementsPageComponent,
    ApplicationsPageComponent,
    EucsPageComponent,
    EndpointsPageComponent,
    DqRulesPageComponent,
    DqExceptionsPageComponent,
    DataConcernsPageComponent,
    MetricsPageComponent,
    BulkPageComponent,
    HomePageComponent,
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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
