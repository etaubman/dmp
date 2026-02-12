package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.List;

public class DQPerformanceSummary {
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("application_id") private int applicationId;
    @JsonProperty("last_run_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime lastRunAt;
    @JsonProperty("last_passed") private Boolean lastPassed;
    @JsonProperty("last_exception_pct") private Integer lastExceptionPct;
    @JsonProperty("threshold_pct") private Integer thresholdPct;
    @JsonProperty("recent_runs") private List<DataQualityRuleInstanceOut> recentRuns;

    public DQPerformanceSummary() {}
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public int getApplicationId() { return applicationId; } public void setApplicationId(int applicationId) { this.applicationId = applicationId; }
    public OffsetDateTime getLastRunAt() { return lastRunAt; } public void setLastRunAt(OffsetDateTime lastRunAt) { this.lastRunAt = lastRunAt; }
    public Boolean getLastPassed() { return lastPassed; } public void setLastPassed(Boolean lastPassed) { this.lastPassed = lastPassed; }
    public Integer getLastExceptionPct() { return lastExceptionPct; } public void setLastExceptionPct(Integer lastExceptionPct) { this.lastExceptionPct = lastExceptionPct; }
    public Integer getThresholdPct() { return thresholdPct; } public void setThresholdPct(Integer thresholdPct) { this.thresholdPct = thresholdPct; }
    public List<DataQualityRuleInstanceOut> getRecentRuns() { return recentRuns; } public void setRecentRuns(List<DataQualityRuleInstanceOut> recentRuns) { this.recentRuns = recentRuns; }
}
