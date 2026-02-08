/**
 * Global app state shape: domains list, current selected domain, admin tree/users,
 * auth (current user), and domain-scoped entity lists. Also loading flags and error message.
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
