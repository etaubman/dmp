package com.dmp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

public class DQTrendPoint {
    @JsonProperty("run_at") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime runAt;
    private boolean passed;
    @JsonProperty("exception_pct") private Integer exceptionPct;
    @JsonProperty("exception_count") private int exceptionCount;

    public DQTrendPoint() {}
    public DQTrendPoint(OffsetDateTime runAt, boolean passed, Integer exceptionPct, int exceptionCount) {
        this.runAt = runAt; this.passed = passed; this.exceptionPct = exceptionPct; this.exceptionCount = exceptionCount;
    }
    public OffsetDateTime getRunAt() { return runAt; } public void setRunAt(OffsetDateTime runAt) { this.runAt = runAt; }
    public boolean isPassed() { return passed; } public void setPassed(boolean passed) { this.passed = passed; }
    public Integer getExceptionPct() { return exceptionPct; } public void setExceptionPct(Integer exceptionPct) { this.exceptionPct = exceptionPct; }
    public int getExceptionCount() { return exceptionCount; } public void setExceptionCount(int exceptionCount) { this.exceptionCount = exceptionCount; }
}
