package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MetricsOut {
    @JsonProperty("domain_id") private Integer domainId;
    @JsonProperty("domains_count") private int domainsCount;
    @JsonProperty("data_elements_count") private int dataElementsCount;
    @JsonProperty("applications_count") private int applicationsCount;
    @JsonProperty("eucs_count") private int eucsCount;
    @JsonProperty("endpoints_count") private int endpointsCount;
    @JsonProperty("data_quality_rules_count") private int dataQualityRulesCount;
    @JsonProperty("data_quality_exceptions_count") private int dataQualityExceptionsCount;
    @JsonProperty("data_concerns_count") private int dataConcernsCount;
    @JsonProperty("attestation_count") private Integer attestationCount;

    public MetricsOut() {}
    public MetricsOut(Integer domainId) { this.domainId = domainId; }
    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public int getDomainsCount() { return domainsCount; } public void setDomainsCount(int domainsCount) { this.domainsCount = domainsCount; }
    public int getDataElementsCount() { return dataElementsCount; } public void setDataElementsCount(int dataElementsCount) { this.dataElementsCount = dataElementsCount; }
    public int getApplicationsCount() { return applicationsCount; } public void setApplicationsCount(int applicationsCount) { this.applicationsCount = applicationsCount; }
    public int getEucsCount() { return eucsCount; } public void setEucsCount(int eucsCount) { this.eucsCount = eucsCount; }
    public int getEndpointsCount() { return endpointsCount; } public void setEndpointsCount(int endpointsCount) { this.endpointsCount = endpointsCount; }
    public int getDataQualityRulesCount() { return dataQualityRulesCount; } public void setDataQualityRulesCount(int dataQualityRulesCount) { this.dataQualityRulesCount = dataQualityRulesCount; }
    public int getDataQualityExceptionsCount() { return dataQualityExceptionsCount; } public void setDataQualityExceptionsCount(int dataQualityExceptionsCount) { this.dataQualityExceptionsCount = dataQualityExceptionsCount; }
    public int getDataConcernsCount() { return dataConcernsCount; } public void setDataConcernsCount(int dataConcernsCount) { this.dataConcernsCount = dataConcernsCount; }
    public Integer getAttestationCount() { return attestationCount; } public void setAttestationCount(Integer attestationCount) { this.attestationCount = attestationCount; }
}
