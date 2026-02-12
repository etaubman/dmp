package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_feeds")
public class DataFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "domain_id", nullable = false)
    private Integer domainId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_type", length = 64)
    private String sourceType;

    @Column(length = 64)
    private String format;

    @Column(name = "transmission_method", length = 64)
    private String transmissionMethod;

    @Column(name = "producer_application_id")
    private Integer producerApplicationId;

    @Column(name = "consumer_application_id")
    private Integer consumerApplicationId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; }
    public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public String getTransmissionMethod() { return transmissionMethod; }
    public void setTransmissionMethod(String transmissionMethod) { this.transmissionMethod = transmissionMethod; }
    public Integer getProducerApplicationId() { return producerApplicationId; }
    public void setProducerApplicationId(Integer producerApplicationId) { this.producerApplicationId = producerApplicationId; }
    public Integer getConsumerApplicationId() { return consumerApplicationId; }
    public void setConsumerApplicationId(Integer consumerApplicationId) { this.consumerApplicationId = consumerApplicationId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
