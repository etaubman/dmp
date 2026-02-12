package com.dmp.controller;

import com.dmp.dto.MetricsOut;
import com.dmp.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping
    public ResponseEntity<MetricsOut> getMetrics(@RequestParam(required = false) Integer domain_id) {
        return ResponseEntity.ok(metricsService.getMetrics(domain_id));
    }
}
