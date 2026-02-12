package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LineageApplicationOut {
    @JsonProperty("application_id") private Integer applicationId;
    @JsonProperty("application_name") private String applicationName;
    private String source;  // "sor" | "endpoint"

    public LineageApplicationOut() {}
    public LineageApplicationOut(Integer applicationId, String applicationName, String source) {
        this.applicationId = applicationId; this.applicationName = applicationName; this.source = source;
    }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public String getApplicationName() { return applicationName; } public void setApplicationName(String applicationName) { this.applicationName = applicationName; }
    public String getSource() { return source; } public void setSource(String source) { this.source = source; }
}
