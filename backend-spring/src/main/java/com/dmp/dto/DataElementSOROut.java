package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataElementSOROut {
    @JsonProperty("application_id") private Integer applicationId;
    @JsonProperty("application_name") private String applicationName;
    @JsonProperty("physical_data_attribute") private String physicalDataAttribute;

    public DataElementSOROut() {}
    public DataElementSOROut(Integer applicationId, String applicationName, String physicalDataAttribute) {
        this.applicationId = applicationId; this.applicationName = applicationName; this.physicalDataAttribute = physicalDataAttribute;
    }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public String getApplicationName() { return applicationName; } public void setApplicationName(String applicationName) { this.applicationName = applicationName; }
    public String getPhysicalDataAttribute() { return physicalDataAttribute; } public void setPhysicalDataAttribute(String physicalDataAttribute) { this.physicalDataAttribute = physicalDataAttribute; }
}
