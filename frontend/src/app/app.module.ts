import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { appReducer } from './store/app.reducer';
import { AppEffects } from './store/app.effects';

import { LayoutComponent } from './layout/layout.component';
import { DomainSelectorComponent } from './layout/domain-selector/domain-selector.component';
import { DetailModalComponent } from './shared/detail-modal/detail-modal.component';

import { DataElementsPageComponent } from './pages/data-elements-page/data-elements-page.component';
import { ApplicationsPageComponent } from './pages/applications-page/applications-page.component';
import { EucsPageComponent } from './pages/eucs-page/eucs-page.component';
import { EndpointsPageComponent } from './pages/endpoints-page/endpoints-page.component';
import { DqRulesPageComponent } from './pages/dq-rules-page/dq-rules-page.component';
import { DqExceptionsPageComponent } from './pages/dq-exceptions-page/dq-exceptions-page.component';
import { DataConcernsPageComponent } from './pages/data-concerns-page/data-concerns-page.component';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { BulkPageComponent } from './pages/bulk-page/bulk-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DomainSelectorComponent,
    DetailModalComponent,
    DataElementsPageComponent,
    ApplicationsPageComponent,
    EucsPageComponent,
    EndpointsPageComponent,
    DqRulesPageComponent,
    DqExceptionsPageComponent,
    DataConcernsPageComponent,
    MetricsPageComponent,
    BulkPageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    StoreModule.forRoot({ app: appReducer }),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
