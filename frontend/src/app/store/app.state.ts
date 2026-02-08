/**
 * Global app state shape: domains list, current selected domain, admin tree/users,
 * and domain-scoped entity lists (data elements, applications, EUCs, endpoints, DQ rules/exceptions,
 * data concerns, metrics). Also loading flags and error message.
 */
import { Domain, DomainTreeNode, User, DataElement, Application, EUC, Endpoint, DataQualityRule, DataQualityException, DataConcern, Metrics } from '../core/api.service';

export interface AppState {
  domains: Domain[];
  currentDomainId: number | null;
  adminDomainsTree: DomainTreeNode[] | null;
  adminDomainsError: string | null;
  adminUsers: User[];
  adminUsersError: string | null;
  dataElements: DataElement[];
  applications: Application[];
  eucs: EUC[];
  endpoints: Endpoint[];
  dataQualityRules: DataQualityRule[];
  dataQualityExceptions: DataQualityException[];
  dataConcerns: DataConcern[];
  metrics: Metrics | null;
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
