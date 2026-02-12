package com.dmp.controller;

import com.dmp.dto.*;
import com.dmp.service.DataQualityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/** Data quality rules, instances, exceptions, SQL versions, performance and mod requests. */
@RestController
@RequestMapping("/api")
@Tag(name = "data-quality", description = "Data quality rules, instances, exceptions, trends")
public class DataQualityController {

    private final DataQualityService dataQualityService;

    public DataQualityController(DataQualityService dataQualityService) {
        this.dataQualityService = dataQualityService;
    }

    // --- Rule instances (before /{rule_id}) ---
    @GetMapping("/data-quality-rules/instances")
    public List<DataQualityRuleInstanceOut> listInstances(
            @RequestParam(required = false) Integer rule_id,
            @RequestParam(required = false) Integer data_element_id,
            @RequestParam(required = false) Integer application_id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @RequestParam(defaultValue = "100") int limit) {
        return dataQualityService.listInstances(rule_id, data_element_id, application_id, from, to, Math.min(limit, 500));
    }

    @PostMapping("/data-quality-rules/instances")
    public DataQualityRuleInstanceOut createInstance(@Valid @RequestBody DataQualityRuleInstanceCreate body) {
        return dataQualityService.createInstance(body);
    }

    @GetMapping("/data-quality-rules/instances/{instanceId}")
    public DataQualityRuleInstanceDetailOut getInstance(
            @PathVariable int instanceId,
            @RequestParam(defaultValue = "true") boolean prettify) {
        return dataQualityService.getInstance(instanceId, prettify);
    }

    @PatchMapping("/data-quality-rules/instances/{instanceId}/false-positive")
    public Map<String, Object> markInstanceFalsePositive(@PathVariable int instanceId) {
        return dataQualityService.markInstanceFalsePositive(instanceId);
    }

    @GetMapping("/data-quality-rules/instance-counts")
    public List<RuleInstanceCountOut> listInstanceCounts(@RequestParam int domain_id) {
        return dataQualityService.listInstanceCounts(domain_id);
    }

    // --- Rules list and CRUD ---
    @GetMapping("/data-quality-rules")
    public List<DataQualityRuleOut> listRules(
            @RequestParam(required = false) Integer domain_id,
            @RequestParam(required = false) Integer data_element_id,
            @RequestParam(required = false) Integer endpoint_id) {
        return dataQualityService.listRules(domain_id, data_element_id, endpoint_id);
    }

    @PostMapping("/data-quality-rules")
    public DataQualityRuleOut createRule(@Valid @RequestBody DataQualityRuleCreate body) {
        return dataQualityService.createRule(body);
    }

    @GetMapping("/data-quality-rules/{ruleId}")
    public DataQualityRuleOut getRule(@PathVariable int ruleId) {
        return dataQualityService.getRule(ruleId);
    }

    @PatchMapping("/data-quality-rules/{ruleId}")
    public DataQualityRuleOut updateRule(@PathVariable int ruleId, @RequestBody DataQualityRuleUpdate body) {
        return dataQualityService.updateRule(ruleId, body);
    }

    // --- Exceptions ---
    @GetMapping("/data-quality-exceptions")
    public List<DataQualityExceptionOut> listExceptions(
            @RequestParam(required = false) Integer domain_id,
            @RequestParam(required = false) Integer data_element_id) {
        return dataQualityService.listExceptions(domain_id, data_element_id);
    }

    @PatchMapping("/data-quality-exceptions/{exceptionId}/false-positive")
    public Map<String, Object> markExceptionFalsePositive(@PathVariable int exceptionId) {
        return dataQualityService.markExceptionFalsePositive(exceptionId);
    }

    // --- SQL versions ---
    @GetMapping("/data-quality-rules/{ruleId}/sql-versions")
    public List<DataQualitySqlVersionOut> listSqlVersions(@PathVariable int ruleId) {
        return dataQualityService.listSqlVersions(ruleId);
    }

    @PostMapping("/data-quality-rules/{ruleId}/sql-versions")
    public DataQualitySqlVersionOut createSqlVersion(@PathVariable int ruleId, @Valid @RequestBody DataQualitySqlVersionCreate body) {
        return dataQualityService.createSqlVersion(ruleId, body);
    }

    @PatchMapping("/data-quality-rules/{ruleId}/sql-versions/{versionId}/live")
    public Map<String, Object> setSqlVersionLive(@PathVariable int ruleId, @PathVariable int versionId) {
        return dataQualityService.setSqlVersionLive(ruleId, versionId);
    }

    // --- Performance ---
    @GetMapping("/data-quality-rules/{ruleId}/performance")
    public DQPerformanceSummary getPerformance(
            @PathVariable int ruleId,
            @RequestParam(required = false) Integer data_element_id,
            @RequestParam(required = false) Integer application_id) {
        return dataQualityService.getPerformance(ruleId, data_element_id, application_id);
    }

    @GetMapping("/data-quality-rules/{ruleId}/performance/trend")
    public DQTrendResponse getTrend(
            @PathVariable int ruleId,
            @RequestParam(required = false) Integer data_element_id,
            @RequestParam(required = false) Integer application_id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @RequestParam(defaultValue = "50") int limit) {
        return dataQualityService.getTrend(ruleId, data_element_id, application_id, from, to, Math.min(limit, 200));
    }

    // --- Mod requests and flag ---
    @PostMapping("/data-quality-rules/{ruleId}/request-mod")
    public RuleModRequestOut requestMod(@PathVariable int ruleId, @RequestParam(required = false) Integer requested_by) {
        return dataQualityService.requestMod(ruleId, requested_by);
    }

    @GetMapping("/data-quality-rules/{ruleId}/mod-requests")
    public List<RuleModRequestOut> listModRequests(@PathVariable int ruleId) {
        return dataQualityService.listModRequests(ruleId);
    }

    @PatchMapping("/data-quality-rules/{ruleId}/flag-monitoring")
    public Map<String, Object> flagMonitoring(@PathVariable int ruleId, @RequestParam(defaultValue = "true") boolean flagged) {
        return dataQualityService.flagForMonitoring(ruleId, flagged);
    }
}
