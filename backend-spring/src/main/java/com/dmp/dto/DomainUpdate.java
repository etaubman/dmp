package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DomainUpdate {

    private String name;
    private String description;

    @JsonProperty("parent_id")
    private Integer parentId;
    private boolean parentIdIncluded;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getParentId() { return parentId; }
    @JsonProperty("parent_id")
    public void setParentId(Integer parentId) {
        this.parentId = parentId;
        this.parentIdIncluded = true;
    }
    public boolean hasParentIdUpdate() { return parentIdIncluded; }
}
