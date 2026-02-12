package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DomainTreeOut {

    private Integer id;
    private String name;
    private String description;

    @JsonProperty("parent_id")
    private Integer parentId;

    private int level = 0;
    private List<DomainTreeOut> children = new ArrayList<>();

    public DomainTreeOut() {
    }

    public DomainTreeOut(Integer id, String name, String description, Integer parentId, int level, List<DomainTreeOut> children) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.parentId = parentId;
        this.level = level;
        this.children = children != null ? children : new ArrayList<>();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getParentId() { return parentId; }
    public void setParentId(Integer parentId) { this.parentId = parentId; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public List<DomainTreeOut> getChildren() { return children; }
    public void setChildren(List<DomainTreeOut> children) { this.children = children; }
}
