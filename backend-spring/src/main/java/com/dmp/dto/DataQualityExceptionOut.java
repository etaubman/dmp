package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataQualityExceptionOut {
    private Integer id;
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    private String description;
    private String status;
    @JsonProperty("is_false_positive") private boolean isFalsePositive;
    @JsonProperty("marked_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime markedAt;
    @JsonProperty("marked_by") private Integer markedBy;
    @JsonProperty("identified_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime identifiedAt;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    public DataQualityExceptionOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public boolean isFalsePositive() { return isFalsePositive; } public void setFalsePositive(boolean falsePositive) { isFalsePositive = falsePositive; }
    public OffsetDateTime getMarkedAt() { return markedAt; } public void setMarkedAt(OffsetDateTime markedAt) { this.markedAt = markedAt; }
    public Integer getMarkedBy() { return markedBy; } public void setMarkedBy(Integer markedBy) { this.markedBy = markedBy; }
    public OffsetDateTime getIdentifiedAt() { return identifiedAt; } public void setIdentifiedAt(OffsetDateTime identifiedAt) { this.identifiedAt = identifiedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
