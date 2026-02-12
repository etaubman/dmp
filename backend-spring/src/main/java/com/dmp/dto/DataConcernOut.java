package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataConcernOut {
    private Integer id;
    @JsonProperty("domain_id") private Integer domainId;
    @JsonProperty("application_id") private Integer applicationId;
    @JsonProperty("euc_id") private Integer eucId;
    @JsonProperty("endpoint_id") private Integer endpointId;
    @JsonProperty("data_element_id") private Integer dataElementId;
    private String title;
    private String description;
    private String status;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;
    @JsonProperty("updated_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    public DataConcernOut() {}
    public DataConcernOut(Integer id, Integer domainId, Integer applicationId, Integer eucId, Integer endpointId,
                         Integer dataElementId, String title, String description, String status,
                         OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id; this.domainId = domainId; this.applicationId = applicationId; this.eucId = eucId;
        this.endpointId = endpointId; this.dataElementId = dataElementId; this.title = title;
        this.description = description; this.status = status; this.createdAt = createdAt; this.updatedAt = updatedAt;
    }
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public Integer getApplicationId() { return applicationId; } public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public Integer getEucId() { return eucId; } public void setEucId(Integer eucId) { this.eucId = eucId; }
    public Integer getEndpointId() { return endpointId; } public void setEndpointId(Integer endpointId) { this.endpointId = endpointId; }
    public Integer getDataElementId() { return dataElementId; } public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
