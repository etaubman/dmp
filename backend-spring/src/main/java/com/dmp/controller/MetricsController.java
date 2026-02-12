package com.dmp.controller;

import com.dmp.dto.MetricsOut;
import com.dmp.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Aggregated metrics (counts, etc.) optionally scoped by domain. */
@RestController
@RequestMapping("/api/metrics")
@Tag(name = "metrics", description = "Aggregated metrics")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping
    @Operation(summary = "Get metrics", description = "Dashboard metrics; optional domain_id for scoping")
    public ResponseEntity<MetricsOut> getMetrics(@RequestParam(required = false) Integer domain_id) {
        return ResponseEntity.ok(metricsService.getMetrics(domain_id));
    }
}
