package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_quality_rules")
public class DataQualityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "domain_id")
    private Integer domainId;

    @Column(name = "data_element_id")
    private Integer dataElementId;

    @Column(name = "endpoint_id")
    private Integer endpointId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rule_type", length = 64)
    private String ruleType;

    @Column(name = "exception_threshold_pct")
    private Integer exceptionThresholdPct;

    @Column(name = "flagged_for_monitoring", nullable = false)
    private Integer flaggedForMonitoring = 0;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; }
    public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getEndpointId() { return endpointId; }
    public void setEndpointId(Integer endpointId) { this.endpointId = endpointId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRuleType() { return ruleType; }
    public void setRuleType(String ruleType) { this.ruleType = ruleType; }
    public Integer getExceptionThresholdPct() { return exceptionThresholdPct; }
    public void setExceptionThresholdPct(Integer exceptionThresholdPct) { this.exceptionThresholdPct = exceptionThresholdPct; }
    public Integer getFlaggedForMonitoring() { return flaggedForMonitoring; }
    public void setFlaggedForMonitoring(Integer flaggedForMonitoring) { this.flaggedForMonitoring = flaggedForMonitoring; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
