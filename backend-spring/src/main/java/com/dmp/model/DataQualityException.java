package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_quality_exceptions")
public class DataQualityException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;

    @Column(name = "data_element_id")
    private Integer dataElementId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 64)
    private String status;

    @Column(name = "is_false_positive", nullable = false)
    private Integer isFalsePositive = 0;

    @Column(name = "marked_at")
    private OffsetDateTime markedAt;

    @Column(name = "marked_by")
    private Integer markedBy;

    @Column(name = "identified_at")
    private OffsetDateTime identifiedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; }
    public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getIsFalsePositive() { return isFalsePositive; }
    public void setIsFalsePositive(Integer isFalsePositive) { this.isFalsePositive = isFalsePositive; }
    public OffsetDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(OffsetDateTime markedAt) { this.markedAt = markedAt; }
    public Integer getMarkedBy() { return markedBy; }
    public void setMarkedBy(Integer markedBy) { this.markedBy = markedBy; }
    public OffsetDateTime getIdentifiedAt() { return identifiedAt; }
    public void setIdentifiedAt(OffsetDateTime identifiedAt) { this.identifiedAt = identifiedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
