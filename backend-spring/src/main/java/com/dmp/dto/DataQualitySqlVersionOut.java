package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DataQualitySqlVersionOut {
    private Integer id;
    @JsonProperty("rule_id") private Integer ruleId;
    @JsonProperty("sql_text") private String sqlText;
    private int version;
    @JsonProperty("is_live") private boolean isLive;
    @JsonProperty("created_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    public DataQualitySqlVersionOut() {}
    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Integer getRuleId() { return ruleId; } public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }
    public String getSqlText() { return sqlText; } public void setSqlText(String sqlText) { this.sqlText = sqlText; }
    public int getVersion() { return version; } public void setVersion(int version) { this.version = version; }
    public boolean isLive() { return isLive; } public void setLive(boolean live) { isLive = live; }
    public OffsetDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
