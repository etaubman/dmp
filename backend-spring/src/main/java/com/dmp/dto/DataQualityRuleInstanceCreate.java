package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public class DataQualityRuleInstanceCreate {
    @NotNull @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @NotNull @JsonProperty("application_id") private Integer applicationId;
    private boolean passed = true;
    @JsonProperty("exception_count") private int exceptionCount = 0;
    @JsonProperty("exception_pct") private Integer exceptionPct;
    private String notes;
    @JsonProperty("sql_version_id") private Integer sqlVersionId;

    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public boolean isPassed() { return passed; } public void setPassed(boolean passed) { this.passed = passed; }
    public int getExceptionCount() { return exceptionCount; } public void setExceptionCount(int exceptionCount) { this.exceptionCount = exceptionCount; }
    public Integer getExceptionPct() { return exceptionPct; } public void setExceptionPct(Integer exceptionPct) { this.exceptionPct = exceptionPct; }
    public String getNotes() { return notes; } public void setNotes(String notes) { this.notes = notes; }
    public Integer getSqlVersionId() { return sqlVersionId; } public void setSqlVersionId(Integer sqlVersionId) { this.sqlVersionId = sqlVersionId; }
}
