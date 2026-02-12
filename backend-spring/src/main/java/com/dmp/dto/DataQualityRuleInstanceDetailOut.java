package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataQualityRuleInstanceDetailOut extends DataQualityRuleInstanceOut {
    @JsonProperty("sql_text") private String sqlText;
    @JsonProperty("sql_text_prettified") private String sqlTextPrettified;

    public String getSqlText() { return sqlText; } public void setSqlText(String sqlText) { this.sqlText = sqlText; }
    public String getSqlTextPrettified() { return sqlTextPrettified; } public void setSqlTextPrettified(String sqlTextPrettified) { this.sqlTextPrettified = sqlTextPrettified; }
}
