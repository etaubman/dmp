package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class RuleModRequestOut {
    private Integer id;
    @JsonProperty("rule_id") private Integer ruleId;
    private String status;
    @JsonProperty("requested_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime requestedAt;
    @JsonProperty("requested_by") private Integer requestedBy;

    public RuleModRequestOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getRequestedAt() { return requestedAt; } public void setRequestedAt(OffsetDateTime requestedAt) { this.requestedAt = requestedAt; }
    public Integer getRequestedBy() { return requestedBy; } public void setRequestedBy(Integer requestedBy) { this.requestedBy = requestedBy; }
}
