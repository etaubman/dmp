package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_element_sor")
public class DataElementSOR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "data_element_id", nullable = false)
    private Integer dataElementId;

    @Column(name = "application_id", nullable = false)
    private Integer applicationId;

    @Column(name = "physical_data_attribute", length = 255)
    private String physicalDataAttribute;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public Integer getApplicationId() { return applicationId; }
    public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
    public String getPhysicalDataAttribute() { return physicalDataAttribute; }
    public void setPhysicalDataAttribute(String physicalDataAttribute) { this.physicalDataAttribute = physicalDataAttribute; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
