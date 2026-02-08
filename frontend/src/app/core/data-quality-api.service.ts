import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { withOptionalParam, buildFilterParams } from './http-params';
import type {
  DataQualityRule,
  DataQualityException,
  DataQualityRuleInstance,
  DataQualityRuleInstanceDetail,
  DataQualitySqlVersion,
  DQPerformanceSummary,
  DQTrendResponse,
  RuleModRequest,
  RuleInstanceCount,
} from './models';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class DataQualityApiService {
  constructor(private http: HttpClient) {}

  getDataQualityRules(domainId?: number, dataElementId?: number): Observable<DataQualityRule[]> {
    let params = new HttpParams();
    params = withOptionalParam(params, 'domain_id', domainId);
    params = withOptionalParam(params, 'data_element_id', dataElementId);
    return this.http.get<DataQualityRule[]>(`${API}/data-quality-rules`, { params });
  }

  getDataQualityExceptions(domainId?: number, dataElementId?: number): Observable<DataQualityException[]> {
    let params = new HttpParams();
    params = withOptionalParam(params, 'domain_id', domainId);
    params = withOptionalParam(params, 'data_element_id', dataElementId);
    return this.http.get<DataQualityException[]>(`${API}/data-quality-exceptions`, { params });
  }

  getDataQualityRule(ruleId: number): Observable<DataQualityRule> {
    return this.http.get<DataQualityRule>(`${API}/data-quality-rules/${ruleId}`);
  }

  getRuleInstanceCounts(domainId: number): Observable<RuleInstanceCount[]> {
    return this.http.get<RuleInstanceCount[]>(`${API}/data-quality-rules/instance-counts`, {
      params: { domain_id: domainId },
    });
  }

  getRuleInstances(filters?: {
    rule_id?: number;
    data_element_id?: number;
    application_id?: number;
  }): Observable<DataQualityRuleInstance[]> {
    const params = filters ? buildFilterParams(filters) : new HttpParams();
    return this.http.get<DataQualityRuleInstance[]>(`${API}/data-quality-rules/instances`, { params });
  }

  getRuleInstance(instanceId: number, prettify = true): Observable<DataQualityRuleInstanceDetail> {
    const params = new HttpParams().set('prettify', String(prettify));
    return this.http.get<DataQualityRuleInstanceDetail>(
      `${API}/data-quality-rules/instances/${instanceId}`,
      { params }
    );
  }

  getRulePerformance(
    ruleId: number,
    dataElementId?: number,
    applicationId?: number
  ): Observable<DQPerformanceSummary> {
    let params = new HttpParams();
    params = withOptionalParam(params, 'data_element_id', dataElementId);
    params = withOptionalParam(params, 'application_id', applicationId);
    return this.http.get<DQPerformanceSummary>(`${API}/data-quality-rules/${ruleId}/performance`, {
      params,
    });
  }

  getRulePerformanceTrend(
    ruleId: number,
    filters?: { data_element_id?: number; application_id?: number }
  ): Observable<DQTrendResponse> {
    const params = filters ? buildFilterParams(filters) : new HttpParams();
    return this.http.get<DQTrendResponse>(
      `${API}/data-quality-rules/${ruleId}/performance/trend`,
      { params }
    );
  }

  getRuleSqlVersions(ruleId: number): Observable<DataQualitySqlVersion[]> {
    return this.http.get<DataQualitySqlVersion[]>(`${API}/data-quality-rules/${ruleId}/sql-versions`);
  }

  getRuleModRequests(ruleId: number): Observable<RuleModRequest[]> {
    return this.http.get<RuleModRequest[]>(`${API}/data-quality-rules/${ruleId}/mod-requests`);
  }

  requestRuleMod(ruleId: number): Observable<RuleModRequest> {
    return this.http.post<RuleModRequest>(`${API}/data-quality-rules/${ruleId}/request-mod`, {});
  }

  flagRuleForMonitoring(ruleId: number, flagged: boolean): Observable<{ id: number; flagged_for_monitoring: boolean }> {
    return this.http.patch<{ id: number; flagged_for_monitoring: boolean }>(
      `${API}/data-quality-rules/${ruleId}/flag-monitoring`,
      {},
      { params: { flagged } }
    );
  }

  markExceptionFalsePositive(exceptionId: number): Observable<{ id: number; is_false_positive: boolean }> {
    return this.http.patch<{ id: number; is_false_positive: boolean }>(
      `${API}/data-quality-exceptions/${exceptionId}/false-positive`,
      {}
    );
  }

  markInstanceFalsePositive(instanceId: number): Observable<{ id: number; marked_false_positive: boolean }> {
    return this.http.patch<{ id: number; marked_false_positive: boolean }>(
      `${API}/data-quality-rules/instances/${instanceId}/false-positive`,
      {}
    );
  }
}