package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataQualityRuleInstanceOut {
    private Integer id;
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("application_id") private Integer applicationId;
    @JsonProperty("run_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime runAt;
    private boolean passed;
    @JsonProperty("exception_count") private int exceptionCount;
    @JsonProperty("exception_pct") private Integer exceptionPct;
    private String notes;
    @JsonProperty("sql_version_id") private Integer sqlVersionId;
    @JsonProperty("marked_false_positive") private boolean markedFalsePositive;

    public DataQualityRuleInstanceOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public OffsetDateTime getRunAt() { return runAt; } public void setRunAt(OffsetDateTime runAt) { this.runAt = runAt; }
    public boolean isPassed() { return passed; } public void setPassed(boolean passed) { this.passed = passed; }
    public int getExceptionCount() { return exceptionCount; } public void setExceptionCount(int exceptionCount) { this.exceptionCount = exceptionCount; }
    public Integer getExceptionPct() { return exceptionPct; } public void setExceptionPct(Integer exceptionPct) { this.exceptionPct = exceptionPct; }
    public String getNotes() { return notes; } public void setNotes(String notes) { this.notes = notes; }
    public Integer getSqlVersionId() { return sqlVersionId; } public void setSqlVersionId(Integer sqlVersionId) { this.sqlVersionId = sqlVersionId; }
    public boolean isMarkedFalsePositive() { return markedFalsePositive; } public void setMarkedFalsePositive(boolean markedFalsePositive) { this.markedFalsePositive = markedFalsePositive; }
}
