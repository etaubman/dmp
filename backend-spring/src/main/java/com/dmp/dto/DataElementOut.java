package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataElementOut {

    private Integer id;
    @JsonProperty("domain_id") private Integer domainId;
    private String name;
    private String description;
    @JsonProperty("element_type") private String elementType;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;
    @JsonProperty("updated_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    public DataElementOut() {}
    public DataElementOut(Integer id, Integer domainId, String name, String description, String elementType,
                         OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id; this.domainId = domainId; this.name = name; this.description = description;
        this.elementType = elementType; this.createdAt = createdAt; this.updatedAt = updatedAt;
    }
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getElementType() { return elementType; } public void setElementType(String elementType) { this.elementType = elementType; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
