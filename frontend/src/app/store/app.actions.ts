/**
 * NgRx actions: setters for state slices, and load/create/update/delete requests that effects handle.
 * Load actions (e.g. loadDomains, loadDataElements) trigger API calls; set actions update the store.
 */
import { createAction, props } from '@ngrx/store';
import { Domain, DomainTreeNode, DomainCreate, DomainUpdate, User, UserCreate, UserUpdate, DataElement, Application, EUC, Endpoint, DataQualityRule, DataQualityException, DataConcern, Metrics } from '../core/api.service';

export const setDomains = createAction('[App] Set Domains', props<{ domains: Domain[] }>());
export const setCurrentDomainId = createAction('[App] Set Current Domain Id', props<{ id: number | null }>());
export const setDataElements = createAction('[App] Set Data Elements', props<{ dataElements: DataElement[] }>());
export const setApplications = createAction('[App] Set Applications', props<{ applications: Application[] }>());
export const setEucs = createAction('[App] Set EUCs', props<{ eucs: EUC[] }>());
export const setEndpoints = createAction('[App] Set Endpoints', props<{ endpoints: Endpoint[] }>());
export const setDataQualityRules = createAction('[App] Set Data Quality Rules', props<{ dataQualityRules: DataQualityRule[] }>());
export const setDataQualityExceptions = createAction('[App] Set Data Quality Exceptions', props<{ dataQualityExceptions: DataQualityException[] }>());
export const setDataConcerns = createAction('[App] Set Data Concerns', props<{ dataConcerns: DataConcern[] }>());
export const setMetrics = createAction('[App] Set Metrics', props<{ metrics: Metrics }>());
export const setLoading = createAction('[App] Set Loading', props<{ key: string; loading: boolean }>());
export const setError = createAction('[App] Set Error', props<{ error: string | null }>());

export type DomainScope = 'owned' | 'upstream' | 'downstream';

export const loadDomains = createAction('[App] Load Domains');
export const loadDataElements = createAction('[App] Load Data Elements', props<{ domainId: number; scope?: DomainScope }>());
export const loadApplications = createAction('[App] Load Applications', props<{ domainId: number; scope?: DomainScope }>());
export const loadEucs = createAction('[App] Load EUCs', props<{ domainId: number; scope?: DomainScope }>());
export const loadEndpoints = createAction('[App] Load Endpoints', props<{ domainId?: number; applicationId?: number; scope?: DomainScope }>());
export const loadDataQualityRules = createAction('[App] Load Data Quality Rules', props<{ domainId?: number; dataElementId?: number }>());
export const loadDataQualityExceptions = createAction('[App] Load Data Quality Exceptions', props<{ domainId?: number; dataElementId?: number }>());
export const loadDataConcerns = createAction('[App] Load Data Concerns', props<{ domainId: number }>());
export const loadMetrics = createAction('[App] Load Metrics', props<{ domainId?: number }>());

export const loadDomainsTree = createAction('[App] Load Domains Tree');
export const setDomainsTree = createAction('[App] Set Domains Tree', props<{ tree: DomainTreeNode[] }>());
export const setAdminDomainsError = createAction('[App] Set Admin Domains Error', props<{ error: string | null }>());
export const createDomainRequest = createAction('[App] Create Domain Request', props<{ body: DomainCreate }>());
export const updateDomainRequest = createAction('[App] Update Domain Request', props<{ id: number; body: DomainUpdate }>());
export const deleteDomainRequest = createAction('[App] Delete Domain Request', props<{ id: number }>());

export const loadUsers = createAction('[App] Load Users');
export const setUsers = createAction('[App] Set Users', props<{ users: User[] }>());
export const setAdminUsersError = createAction('[App] Set Admin Users Error', props<{ error: string | null }>());
export const createUserRequest = createAction('[App] Create User Request', props<{ body: UserCreate }>());
export const updateUserRequest = createAction('[App] Update User Request', props<{ id: number; body: UserUpdate }>());
export const deleteUserRequest = createAction('[App] Delete User Request', props<{ id: number }>());
