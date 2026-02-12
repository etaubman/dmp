package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataFeedControlOut {
    private Integer id;
    @JsonProperty("data_feed_id") private Integer dataFeedId;
    @JsonProperty("control_type") private String controlType;
    private String name;
    private String description;

    public DataFeedControlOut() {}
    public DataFeedControlOut(Integer id, Integer dataFeedId, String controlType, String name, String description) {
        this.id = id; this.dataFeedId = dataFeedId; this.controlType = controlType; this.name = name; this.description = description;
    }
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getDataFeedId() { return dataFeedId; } public void setDataFeedId(Integer dataFeedId) { this.dataFeedId = dataFeedId; }
    public String getControlType() { return controlType; } public void setControlType(String controlType) { this.controlType = controlType; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
}
