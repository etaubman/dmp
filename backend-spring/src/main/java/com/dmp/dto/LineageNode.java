package com.dmp.dto;

import java.util.Map;

public class LineageNode {
    private String id;
    private String type;
    private String label;
    private Map<String, Object> data = java.util.Collections.emptyMap();

    public LineageNode() {}
    public LineageNode(String id, String type, String label, Map<String, Object> data) {
        this.id = id; this.type = type; this.label = label; this.data = data != null ? data : java.util.Collections.emptyMap();
    }
    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public String getLabel() { return label; } public void setLabel(String label) { this.label = label; }
    public Map<String, Object> getData() { return data; } public void setData(Map<String, Object> data) { this.data = data; }
}
