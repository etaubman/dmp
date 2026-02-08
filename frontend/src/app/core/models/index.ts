/**
 * API DTOs (request/response types) for the Data Manager Portal backend.
 *
 * Shared between ApiService (method signatures), store (AppState, actions), and components.
 * Naming follows backend API; optional fields (e.g. description) may be omitted in responses.
 */

// ——— Domain ———
export interface Domain {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
}

/** Tree node for admin domain hierarchy (L0→L1→L2→L3). */
export interface DomainTreeNode {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  level: number;
  children: DomainTreeNode[];
}

export interface DomainCreate {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface DomainUpdate {
  name?: string;
  description?: string;
  parent_id?: number | null;
}

// ——— User ———
export interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

/** Current user returned by /api/auth/me */
export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  role?: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  role?: string;
}

// ——— Data Element ———
export interface DataElement {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
  element_type?: string;
}

// ——— Application ———
export interface Application {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
}

// ——— EUC ———
export interface EUC {
  id: number;
  domain_id: number;
  name: string;
  description?: string;
  euc_type?: string;
}

// ——— Endpoint ———
export interface Endpoint {
  id: number;
  domain_id?: number;
  application_id?: number;
  name: string;
  description?: string;
}

// ——— Data Quality ———
export interface DataQualityRule {
  id: number;
  domain_id?: number;
  data_element_id?: number;
  endpoint_id?: number;
  name: string;
  description?: string;
  rule_type?: string;
}

/** System of record: application that sources a data element and the physical attribute name. */
export interface DataElementSORSummary {
  data_element_id: number;
  application_id: number;
  application_name: string;
  physical_data_attribute?: string;
}

export interface DataQualityException {
  id: number;
  rule_id: number;
  data_element_id?: number;
  description?: string;
  status?: string;
  identified_at?: string;
}

// ——— Data Concern ———
export interface DataConcern {
  id: number;
  domain_id: number;
  application_id?: number;
  euc_id?: number;
  endpoint_id?: number;
  data_element_id?: number;
  title: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ——— Metrics and Lineage ———
export interface Metrics {
  domain_id?: number;
  domains_count: number;
  data_elements_count: number;
  applications_count: number;
  eucs_count: number;
  endpoints_count: number;
  data_quality_rules_count: number;
  data_quality_exceptions_count: number;
  data_concerns_count: number;
  attestation_count?: number;
}

export interface LineageNode {
  id: string;
  type: string;
  label: string;
  data: Record<string, unknown>;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface LineageResponse {
  nodes: LineageNode[];
  edges: LineageEdge[];
}
