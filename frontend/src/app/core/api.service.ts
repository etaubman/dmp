/**
 * Thin façade over resource-focused API clients.
 *
 * All HTTP calls are delegated to domains-api, users-api, auth-api, data-elements-api,
 * applications-api, eucs-api, endpoints-api, data-quality-api, data-concerns-api,
 * metrics-api, and bulk-api services. DTOs are in core/models.
 *
 * Components and effects can inject ApiService for backward compatibility, or inject
 * the specific *-api.service for a single domain.
 */
export * from './models';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  Domain,
  DomainTreeNode,
  DomainCreate,
  DomainUpdate,
  User,
  UserCreate,
  UserUpdate,
  AuthUser,
  LoginCredentials,
  TokenResponse,
  DataElement,
  DataElementSORSummary,
  Application,
  EUC,
  Endpoint,
  DataQualityRule,
  DataQualityException,
  DataQualityRuleInstance,
  DataQualityRuleInstanceDetail,
  DataQualitySqlVersion,
  DQPerformanceSummary,
  DQTrendResponse,
  RuleModRequest,
  RuleInstanceCount,
  LineageApplication,
  DataFeed,
  DataFeedDetail,
  DataConcern,
  Metrics,
  LineageResponse,
} from './models';
import { DomainsApiService } from './domains-api.service';
import { DataFeedsApiService } from './data-feeds-api.service';
import { UsersApiService } from './users-api.service';
import { AuthApiService } from './auth-api.service';
import { DataElementsApiService } from './data-elements-api.service';
import { ApplicationsApiService } from './applications-api.service';
import { EucsApiService } from './eucs-api.service';
import { EndpointsApiService } from './endpoints-api.service';
import { DataQualityApiService } from './data-quality-api.service';
import { DataConcernsApiService } from './data-concerns-api.service';
import { MetricsApiService } from './metrics-api.service';
import { BulkApiService } from './bulk-api.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private domains: DomainsApiService,
    private users: UsersApiService,
    private auth: AuthApiService,
    private dataElements: DataElementsApiService,
    private applications: ApplicationsApiService,
    private eucs: EucsApiService,
    private endpoints: EndpointsApiService,
    private dataQuality: DataQualityApiService,
    private dataConcerns: DataConcernsApiService,
    private dataFeeds: DataFeedsApiService,
    private metrics: MetricsApiService,
    private bulk: BulkApiService,
  ) {}

  getDomains(): Observable<Domain[]> {
    return this.domains.getDomains();
  }
  getDomain(id: number): Observable<Domain> {
    return this.domains.getDomain(id);
  }
  getDomainsTree(): Observable<DomainTreeNode[]> {
    return this.domains.getDomainsTree();
  }
  createDomain(body: DomainCreate): Observable<Domain> {
    return this.domains.createDomain(body);
  }
  updateDomain(id: number, body: DomainUpdate): Observable<Domain> {
    return this.domains.updateDomain(id, body);
  }
  deleteDomain(id: number): Observable<void> {
    return this.domains.deleteDomain(id);
  }

  getUsers(): Observable<User[]> {
    return this.users.getUsers();
  }
  getUser(id: number): Observable<User> {
    return this.users.getUser(id);
  }
  createUser(body: UserCreate): Observable<User> {
    return this.users.createUser(body);
  }
  updateUser(id: number, body: UserUpdate): Observable<User> {
    return this.users.updateUser(id, body);
  }
  deleteUser(id: number): Observable<void> {
    return this.users.deleteUser(id);
  }

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.auth.login(credentials);
  }
  logout(): Observable<{ message: string }> {
    return this.auth.logout();
  }
  getMe(): Observable<AuthUser> {
    return this.auth.getMe();
  }

  getDataElements(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataElement[]> {
    return this.dataElements.getDataElements(domainId, scope);
  }
  getDataElementSorByDomain(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataElementSORSummary[]> {
    return this.dataElements.getDataElementSorByDomain(domainId, scope);
  }
  getDataElementLineage(dataElementId: number): Observable<LineageResponse> {
    return this.dataElements.getDataElementLineage(dataElementId);
  }
  getDataElementLineageApplications(dataElementId: number): Observable<LineageApplication[]> {
    return this.dataElements.getDataElementLineageApplications(dataElementId);
  }

  getApplications(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Application[]> {
    return this.applications.getApplications(domainId, scope);
  }

  getEucs(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<EUC[]> {
    return this.eucs.getEucs(domainId, scope);
  }

  getEndpoints(domainId?: number, applicationId?: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<Endpoint[]> {
    return this.endpoints.getEndpoints(domainId ?? undefined, applicationId ?? undefined, scope);
  }

  getDataQualityRules(domainId?: number, dataElementId?: number): Observable<DataQualityRule[]> {
    return this.dataQuality.getDataQualityRules(domainId, dataElementId);
  }
  getDataQualityExceptions(domainId?: number, dataElementId?: number): Observable<DataQualityException[]> {
    return this.dataQuality.getDataQualityExceptions(domainId, dataElementId);
  }
  getDataQualityRule(ruleId: number): Observable<DataQualityRule> {
    return this.dataQuality.getDataQualityRule(ruleId);
  }
  getRuleInstanceCounts(domainId: number): Observable<RuleInstanceCount[]> {
    return this.dataQuality.getRuleInstanceCounts(domainId);
  }
  getRuleInstances(filters?: { rule_id?: number; data_element_id?: number; application_id?: number }): Observable<DataQualityRuleInstance[]> {
    return this.dataQuality.getRuleInstances(filters);
  }
  getRuleInstance(instanceId: number, prettify = true): Observable<DataQualityRuleInstanceDetail> {
    return this.dataQuality.getRuleInstance(instanceId, prettify);
  }
  getRulePerformance(ruleId: number, dataElementId?: number, applicationId?: number): Observable<DQPerformanceSummary> {
    return this.dataQuality.getRulePerformance(ruleId, dataElementId, applicationId);
  }
  getRulePerformanceTrend(ruleId: number, filters?: { data_element_id?: number; application_id?: number }): Observable<DQTrendResponse> {
    return this.dataQuality.getRulePerformanceTrend(ruleId, filters);
  }
  getRuleSqlVersions(ruleId: number): Observable<DataQualitySqlVersion[]> {
    return this.dataQuality.getRuleSqlVersions(ruleId);
  }
  getRuleModRequests(ruleId: number): Observable<RuleModRequest[]> {
    return this.dataQuality.getRuleModRequests(ruleId);
  }
  requestRuleMod(ruleId: number): Observable<RuleModRequest> {
    return this.dataQuality.requestRuleMod(ruleId);
  }
  flagRuleForMonitoring(ruleId: number, flagged: boolean): Observable<{ id: number; flagged_for_monitoring: boolean }> {
    return this.dataQuality.flagRuleForMonitoring(ruleId, flagged);
  }
  markExceptionFalsePositive(exceptionId: number): Observable<{ id: number; is_false_positive: boolean }> {
    return this.dataQuality.markExceptionFalsePositive(exceptionId);
  }
  markInstanceFalsePositive(instanceId: number): Observable<{ id: number; marked_false_positive: boolean }> {
    return this.dataQuality.markInstanceFalsePositive(instanceId);
  }

  getDataConcerns(domainId: number, filters?: { application_id?: number; euc_id?: number; endpoint_id?: number; data_element_id?: number }): Observable<DataConcern[]> {
    return this.dataConcerns.getDataConcerns(domainId, filters);
  }

  getDataFeeds(domainId: number, scope: 'owned' | 'upstream' | 'downstream' = 'owned'): Observable<DataFeed[]> {
    return this.dataFeeds.getDataFeeds(domainId, scope);
  }
  getDataFeed(id: number): Observable<DataFeedDetail> {
    return this.dataFeeds.getDataFeed(id);
  }

  getMetrics(domainId?: number): Observable<Metrics> {
    return this.metrics.getMetrics(domainId);
  }

  uploadBulk(entityType: string, file: File): Observable<{ created: number; updated: number; errors: { row: number; error: string }[] }> {
    return this.bulk.uploadBulk(entityType, file);
  }
  downloadBulk(entityType: string, domainId?: number): string {
    return this.bulk.downloadBulk(entityType, domainId);
  }
}
