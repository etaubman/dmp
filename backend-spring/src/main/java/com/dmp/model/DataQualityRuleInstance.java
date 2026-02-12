package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_quality_rule_instances")
public class DataQualityRuleInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;

    @Column(name = "data_element_id")
    private Integer dataElementId;

    @Column(name = "application_id", nullable = false)
    private Integer applicationId;

    @Column(name = "run_at", nullable = false)
    private OffsetDateTime runAt;

    @Column(nullable = false)
    private Integer passed = 1;

    @Column(name = "exception_count", nullable = false)
    private Integer exceptionCount = 0;

    @Column(name = "exception_pct")
    private Integer exceptionPct;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "sql_version_id")
    private Integer sqlVersionId;

    @Column(name = "marked_false_positive", nullable = false)
    private Integer markedFalsePositive = 0;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; }
    public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getApplicationId() { return applicationId; }
    public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public OffsetDateTime getRunAt() { return runAt; }
    public void setRunAt(OffsetDateTime runAt) { this.runAt = runAt; }
    public Integer getPassed() { return passed; }
    public void setPassed(Integer passed) { this.passed = passed; }
    public Integer getExceptionCount() { return exceptionCount; }
    public void setExceptionCount(Integer exceptionCount) { this.exceptionCount = exceptionCount; }
    public Integer getExceptionPct() { return exceptionPct; }
    public void setExceptionPct(Integer exceptionPct) { this.exceptionPct = exceptionPct; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Integer getSqlVersionId() { return sqlVersionId; }
    public void setSqlVersionId(Integer sqlVersionId) { this.sqlVersionId = sqlVersionId; }
    public Integer getMarkedFalsePositive() { return markedFalsePositive; }
    public void setMarkedFalsePositive(Integer markedFalsePositive) { this.markedFalsePositive = markedFalsePositive; }
}
