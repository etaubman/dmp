package com.dmp.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_feed_data_elements")
public class DataFeedDataElement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "data_feed_id", nullable = false)
    private Integer dataFeedId;

    @Column(name = "data_element_id", nullable = false)
    private Integer dataElementId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_element_id", insertable = false, updatable = false)
    private DataElement dataElement;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDataFeedId() { return dataFeedId; }
    public void setDataFeedId(Integer dataFeedId) { this.dataFeedId = dataFeedId; }
    public Integer getDataElementId() { return dataElementId; }
    public void setDataElementId(Integer dataElementId) { this.dataElementId = dataElementId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public DataElement getDataElement() { return dataElement; }
    public void setDataElement(DataElement dataElement) { this.dataElement = dataElement; }
}
