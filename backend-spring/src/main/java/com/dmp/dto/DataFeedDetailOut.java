package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class DataFeedDetailOut extends DataFeedOut {
    @JsonProperty("data_elements")
    private List<DataFeedDataElementRefOut> dataElements = new ArrayList<>();
    private List<DataFeedControlOut> controls = new ArrayList<>();

    public List<DataFeedDataElementRefOut> getDataElements() { return dataElements; }
    public void setDataElements(List<DataFeedDataElementRefOut> dataElements) { this.dataElements = dataElements; }
    public List<DataFeedControlOut> getControls() { return controls; }
    public void setControls(List<DataFeedControlOut> controls) { this.controls = controls; }
}
