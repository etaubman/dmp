package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DQTrendResponse {
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("application_id") private int applicationId;
    private List<DQTrendPoint> points;

    public DQTrendResponse() {}
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public int getApplicationId() { return applicationId; } public void setApplicationId(int applicationId) { this.applicationId = applicationId; }
    public List<DQTrendPoint> getPoints() { return points; } public void setPoints(List<DQTrendPoint> points) { this.points = points; }
}
