package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

/** Match FastAPI EUCOut: snake_case, include nulls. */
public class EUCOut {

    private Integer id;

    @JsonProperty("domain_id")
    private Integer domainId;

    private String name;
    private String description;

    @JsonProperty("euc_type")
    private String eucType;

    @JsonProperty("created_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    public EUCOut() {
    }

    public EUCOut(Integer id, Integer domainId, String name, String description, String eucType,
                  OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.domainId = domainId;
        this.name = name;
        this.description = description;
        this.eucType = eucType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; }
    public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEucType() { return eucType; }
    public void setEucType(String eucType) { this.eucType = eucType; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
