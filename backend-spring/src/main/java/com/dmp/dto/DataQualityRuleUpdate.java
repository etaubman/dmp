package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataQualityRuleUpdate {
    private String name;
    private String description;
    @JsonProperty("rule_type") private String ruleType;
    @JsonProperty("exception_threshold_pct") private Integer exceptionThresholdPct;
    @JsonProperty("flagged_for_monitoring") private Boolean flaggedForMonitoring;

    private boolean nameIncluded, descriptionIncluded, ruleTypeIncluded, exceptionThresholdPctIncluded, flaggedIncluded;

    public String getName() { return name; } @JsonProperty("name") public void setName(String name) { this.name = name; this.nameIncluded = true; } public boolean hasNameUpdate() { return nameIncluded; }
    public String getDescription() { return description; } @JsonProperty("description") public void setDescription(String description) { this.description = description; this.descriptionIncluded = true; } public boolean hasDescriptionUpdate() { return descriptionIncluded; }
    public String getRuleType() { return ruleType; } @JsonProperty("rule_type") public void setRuleType(String ruleType) { this.ruleType = ruleType; this.ruleTypeIncluded = true; } public boolean hasRuleTypeUpdate() { return ruleTypeIncluded; }
    public Integer getExceptionThresholdPct() { return exceptionThresholdPct; } @JsonProperty("exception_threshold_pct") public void setExceptionThresholdPct(Integer exceptionThresholdPct) { this.exceptionThresholdPct = exceptionThresholdPct; this.exceptionThresholdPctIncluded = true; } public boolean hasExceptionThresholdPctUpdate() { return exceptionThresholdPctIncluded; }
    public Boolean getFlaggedForMonitoring() { return flaggedForMonitoring; } @JsonProperty("flagged_for_monitoring") public void setFlaggedForMonitoring(Boolean flaggedForMonitoring) { this.flaggedForMonitoring = flaggedForMonitoring; this.flaggedIncluded = true; } public boolean hasFlaggedUpdate() { return flaggedIncluded; }
}
