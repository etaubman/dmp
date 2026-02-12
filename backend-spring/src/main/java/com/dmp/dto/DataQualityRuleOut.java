package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataQualityRuleOut {
    private Integer id;
    @JsonProperty("domain_id") private Integer domainId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("endpoint_id") private Integer endpointId;
    private String name;
    private String description;
    @JsonProperty("rule_type") private String ruleType;
    @JsonProperty("exception_threshold_pct") private Integer exceptionThresholdPct;
    @JsonProperty("flagged_for_monitoring") private boolean flaggedForMonitoring;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;
    @JsonProperty("updated_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    public DataQualityRuleOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getEndpointId() { return endpointId; } public void setEndpointId(Integer endpointId) { this.endpointId = endpointId; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getRuleType() { return ruleType; } public void setRuleType(String ruleType) { this.ruleType = ruleType; }
    public Integer getExceptionThresholdPct() { return exceptionThresholdPct; } public void setExceptionThresholdPct(Integer exceptionThresholdPct) { this.exceptionThresholdPct = exceptionThresholdPct; }
    public boolean isFlaggedForMonitoring() { return flaggedForMonitoring; } public void setFlaggedForMonitoring(boolean flaggedForMonitoring) { this.flaggedForMonitoring = flaggedForMonitoring; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
