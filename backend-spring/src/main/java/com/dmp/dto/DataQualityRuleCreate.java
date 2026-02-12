package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class DataQualityRuleCreate {
    @JsonProperty("domain_id") private Integer domainId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("endpoint_id") private Integer endpointId;
    @NotBlank private String name;
    private String description;
    @JsonProperty("rule_type") private String ruleType;
    @JsonProperty("exception_threshold_pct") private Integer exceptionThresholdPct;
    @JsonProperty("flagged_for_monitoring") private boolean flaggedForMonitoring;

    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getEndpointId() { return endpointId; } public void setEndpointId(Integer endpointId) { this.endpointId = endpointId; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getRuleType() { return ruleType; } public void setRuleType(String ruleType) { this.ruleType = ruleType; }
    public Integer getExceptionThresholdPct() { return exceptionThresholdPct; } public void setExceptionThresholdPct(Integer exceptionThresholdPct) { this.exceptionThresholdPct = exceptionThresholdPct; }
    public boolean isFlaggedForMonitoring() { return flaggedForMonitoring; } public void setFlaggedForMonitoring(boolean flaggedForMonitoring) { this.flaggedForMonitoring = flaggedForMonitoring; }
}
