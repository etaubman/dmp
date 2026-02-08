/**
 * Global NgRx app state shape.
 *
 * - domains / currentDomainId: list of domains and the one selected in the domain selector.
 * - adminDomainsTree / adminDomainsError: tree for admin domain management and any error.
 * - adminUsers / adminUsersError: user list and error for admin user management.
 * - authUser / authError: current logged-in user and login error message.
 * - dataElements, applications, eucs, endpoints, dataQualityRules, dataQualityExceptions,
 *   dataConcerns: domain-scoped (or filter-scoped) entity lists; effects load these via API.
 * - metrics: aggregate counts for the current domain (or global).
 * - loading: map of loading keys (e.g. 'domains', 'dataElements') to boolean; used for spinners.
 * - error: general app error message (e.g. from domain load failure).
 */
import { Domain, DomainTreeNode, User, DataElement, Application, EUC, Endpoint, DataQualityRule, DataQualityException, DataConcern, Metrics } from '../core/api.service';
import type { AuthUser } from '../core/models';

export interface AppState {
  domains: Domain[];
  currentDomainId: number | null;
  adminDomainsTree: DomainTreeNode[] | null;
  adminDomainsError: string | null;
  adminUsers: User[];
  adminUsersError: string | null;
  authUser: AuthUser | null;
  authError: string | null;
  dataElements: DataElement[];
  applications: Application[];
  eucs: EUC[];
  endpoints: Endpoint[];
  dataQualityRules: DataQualityRule[];
  dataQualityExceptions: DataQualityException[];
  dataConcerns: DataConcern[];
  metrics: Metrics | null;
  /** Keys match effect loadingKey (e.g. 'domains', 'dataElements'). True while a load is in progress. */
  loading: { [key: string]: boolean };
  error: string | null;
}

export const initialAppState: AppState = {
  domains: [],
  currentDomainId: null,
  adminDomainsTree: null,
  adminDomainsError: null,
  adminUsers: [],
  adminUsersError: null,
  authUser: null,
  authError: null,
  dataElements: [],
  applications: [],
  eucs: [],
  endpoints: [],
  dataQualityRules: [],
  dataQualityExceptions: [],
  dataConcerns: [],
  metrics: null,
  loading: {},
  error: null,
};
