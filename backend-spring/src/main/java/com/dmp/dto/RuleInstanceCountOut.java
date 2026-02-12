package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RuleInstanceCountOut {
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("instance_count") private int instanceCount;
    @JsonProperty("last_passed") private Boolean lastPassed;

    public RuleInstanceCountOut() {}
    public RuleInstanceCountOut(Integer ruleId, int instanceCount, Boolean lastPassed) {
        this.ruleId = ruleId; this.instanceCount = instanceCount; this.lastPassed = lastPassed;
    }
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public int getInstanceCount() { return instanceCount; } public void setInstanceCount(int instanceCount) { this.instanceCount = instanceCount; }
    public Boolean getLastPassed() { return lastPassed; } public void setLastPassed(Boolean lastPassed) { this.lastPassed = lastPassed; }
}
