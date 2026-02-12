package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataElementSORSummaryOut {
    @JsonProperty("data_element_id") private Integer dataElementId;
    @JsonProperty("application_id") private Integer applicationId;
    @JsonProperty("application_name") private String applicationName;
    @JsonProperty("physical_data_attribute") private String physicalDataAttribute;

    public DataElementSORSummaryOut() {}
    public DataElementSORSummaryOut(Integer dataElementId, Integer applicationId, String applicationName, String physicalDataAttribute) {
        this.dataElementId = dataElementId; this.applicationId = applicationId;
        this.applicationName = applicationName; this.physicalDataAttribute = physicalDataAttribute;
    }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public String getApplicationName() { return applicationName; } public void setApplicationName(String applicationName) { this.applicationName = applicationName; }
    public String getPhysicalDataAttribute() { return physicalDataAttribute; } public void setPhysicalDataAttribute(String physicalDataAttribute) { this.physicalDataAttribute = physicalDataAttribute; }
}
