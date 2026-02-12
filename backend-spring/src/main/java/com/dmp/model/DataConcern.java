package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_concerns")
public class DataConcern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "domain_id", nullable = false)
    private Integer domainId;

    @Column(name = "application_id")
    private Integer applicationId;

    @Column(name = "euc_id")
    private Integer eucId;

    @Column(name = "endpoint_id")
    private Integer endpointId;

    @Column(name = "data_element_id")
    private Integer dataElementId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 64)
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; }
    public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public Integer getApplicationId() { return applicationId; }
    public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public Integer getEucId() { return eucId; }
    public void setEucId(Integer eucId) { this.eucId = eucId; }
    public Integer getEndpointId() { return endpointId; }
    public void setEndpointId(Integer endpointId) { this.endpointId = endpointId; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
