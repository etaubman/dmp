package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataFeedOut {
    private Integer id;
    @JsonProperty("domain_id") private Integer domainId;
    private String name;
    private String description;
    @JsonProperty("source_type") private String sourceType;
    private String format;
    @JsonProperty("transmission_method") private String transmissionMethod;
    @JsonProperty("producer_application_id") private Integer producerApplicationId;
    @JsonProperty("consumer_application_id") private Integer consumerApplicationId;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;
    @JsonProperty("updated_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;
    @JsonProperty("data_element_count") private int dataElementCount;
    @JsonProperty("control_count") private int controlCount;
    @JsonProperty("producer_application_name") private String producerApplicationName;
    @JsonProperty("consumer_application_name") private String consumerApplicationName;

    public DataFeedOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getDomainId() { return domainId; } public void setDomainId(Integer domainId) { this.domainId = domainId; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getSourceType() { return sourceType; } public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getFormat() { return format; } public void setFormat(String format) { this.format = format; }
    public String getTransmissionMethod() { return transmissionMethod; } public void setTransmissionMethod(String transmissionMethod) { this.transmissionMethod = transmissionMethod; }
    public Integer getProducerApplicationId() { return producerApplicationId; } public void setProducerApplicationId(Integer producerApplicationId) { this.producerApplicationId = producerApplicationId; }
    public Integer getConsumerApplicationId() { return consumerApplicationId; } public void setConsumerApplicationId(Integer consumerApplicationId) { this.consumerApplicationId = consumerApplicationId; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public int getDataElementCount() { return dataElementCount; } public void setDataElementCount(int dataElementCount) { this.dataElementCount = dataElementCount; }
    public int getControlCount() { return controlCount; } public void setControlCount(int controlCount) { this.controlCount = controlCount; }
    public String getProducerApplicationName() { return producerApplicationName; } public void setProducerApplicationName(String producerApplicationName) { this.producerApplicationName = producerApplicationName; }
    public String getConsumerApplicationName() { return consumerApplicationName; } public void setConsumerApplicationName(String consumerApplicationName) { this.consumerApplicationName = consumerApplicationName; }
}
