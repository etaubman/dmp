package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "rule_mod_requests")
public class RuleModRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;

    @Column(nullable = false)
    private String status = "requested";

    @Column(name = "requested_at")
    private OffsetDateTime requestedAt;

    @Column(name = "requested_by")
    private Integer requestedBy;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; }
    public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(OffsetDateTime requestedAt) { this.requestedAt = requestedAt; }
    public Integer getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Integer requestedBy) { this.requestedBy = requestedBy; }
}
