package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class DataQualitySqlVersionCreate {
    @NotBlank @JsonProperty("sql_text") private String sqlText;
    private Integer version;
    @JsonProperty("is_live") private boolean isLive;

    public String getSqlText() { return sqlText; } public void setSqlText(String sqlText) { this.sqlText = sqlText; }
    public Integer getVersion() { return version; } public void setVersion(Integer version) { this.version = version; }
    public boolean isLive() { return isLive; } public void setLive(boolean live) { isLive = live; }
}
