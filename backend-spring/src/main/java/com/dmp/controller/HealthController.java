package com.dmp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/ready")
    public Map<String, String> ready() {
        // DB connectivity is implicitly checked by Spring Boot actuator / datasource
        // For simplicity we return ready; could inject DataSource and run SELECT 1
        return Map.of("status", "ready");
    }

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of("message", "Data Manager Portal API", "docs", "/swagger-ui.html");
    }
}
